// Envelhecimento e morte. Roda todo ano, sem escolha do jogador, e em silencio:
// a timeline e sobre eventos, nao sobre -2 de saude por ano.

import {
  DEATH_CAUSES_BY_AGE,
  DEATH_CAUSE_OLD_AGE,
  DEATH_CAUSE_POOR_HEALTH,
  HAPPINESS_CRISIS_THRESHOLD,
  HAPPINESS_MEAN,
  HAPPINESS_MEAN_REVERSION,
  HEALTH_BASELINE_DECLINE,
  HEALTH_PEAK_AGE,
  CHRONIC_HEALTH_PENALTY,
  HEALTH_RECOVERY_RATE,
  TRAINED_HEALTH_BONUS,
  INTELLIGENCE_SCHOOL_AGES,
  INTELLIGENCE_SCHOOL_GAIN,
  LOOKS_DECAY_FACTOR,
  LOOKS_DECAY_START_AGE,
  MAX_AGE,
  MORTALITY_BASE,
  MORTALITY_GROWTH,
  MORTALITY_HEALTH_MAX_MULT,
  MORTALITY_HEALTH_MIN_MULT,
  FRIEND_ANNUAL_DECAY,
  RELATION_ANNUAL_DECAY,
} from './balance'
import { setStat } from './effects'
import { FLAG_CHRONIC_CONDITION, FLAG_TRAINS_REGULARLY } from './flags'
import type { Rng } from './rng'
import type { GameState } from './types'

/**
 * Teto de saude para a idade, deslocado pelo que a pessoa faz da vida.
 * Treinar levanta o teto; uma condicao cronica o abaixa.
 */
export function healthBaseline(age: number, flags: Record<string, boolean> = {}): number {
  const base = 100 - Math.max(0, age - HEALTH_PEAK_AGE) * HEALTH_BASELINE_DECLINE
  const trained = flags[FLAG_TRAINS_REGULARLY] === true ? TRAINED_HEALTH_BONUS : 0
  const chronic = flags[FLAG_CHRONIC_CONDITION] === true ? CHRONIC_HEALTH_PENALTY : 0
  return Math.max(0, base + trained - chronic)
}

export function applyAging(state: GameState, rng: Rng): void {
  const c = state.character

  const baseline = healthBaseline(c.age, c.flags)
  setStat(c, 'health', c.stats.health + (baseline - c.stats.health) * HEALTH_RECOVERY_RATE)

  if (c.age >= LOOKS_DECAY_START_AGE) {
    const loss = (c.age - LOOKS_DECAY_START_AGE) * LOOKS_DECAY_FACTOR
    setStat(c, 'looks', c.stats.looks - loss)
  }

  // Felicidade regride a media: euforia e depressao nao duram para sempre.
  const drift = (HAPPINESS_MEAN - c.stats.happiness) * HAPPINESS_MEAN_REVERSION
  setStat(c, 'happiness', c.stats.happiness + drift)

  // Conta os anos SEGUIDOS de infelicidade, depois da reversao a media — o que
  // interessa e onde a pessoa terminou o ano, nao o susto do meio dele. Zera
  // no primeiro ano bom: e um contador de sequencia, nao um acumulado de vida.
  c.unhappyYears =
    c.stats.happiness < HAPPINESS_CRISIS_THRESHOLD ? c.unhappyYears + 1 : 0

  if (c.age >= INTELLIGENCE_SCHOOL_AGES.min && c.age <= INTELLIGENCE_SCHOOL_AGES.max) {
    setStat(
      c,
      'intelligence',
      c.stats.intelligence + rng.int(INTELLIGENCE_SCHOOL_GAIN.min, INTELLIGENCE_SCHOOL_GAIN.max),
    )
  }

  // Quem nao e cuidado se afasta. O envelhecimento e a morte dos parentes
  // ficam em `relations.ts`, junto com o resto do que e social.
  //
  // Amizade esfria mais rapido que familia: parente distante continua parente,
  // amigo que voce nao ve vira conhecido e depois vira ninguem. Quem SAI da
  // lista e decidido em `relations.ts`, junto com a nota da timeline.
  for (const person of state.relations) {
    if (!person.alive) continue
    const decay = person.kind === 'friend' ? FRIEND_ANNUAL_DECAY : RELATION_ANNUAL_DECAY
    person.relation = Math.max(0, person.relation - decay)
  }
}

/** Probabilidade de morrer neste ano. Exposta para teste e balanceamento. */
export function mortalityChance(age: number, health: number): number {
  const base = MORTALITY_BASE * Math.exp(MORTALITY_GROWTH * age)
  const multiplier = Math.max(
    MORTALITY_HEALTH_MIN_MULT,
    Math.min(MORTALITY_HEALTH_MAX_MULT, 2 - health / 50),
  )
  return Math.min(1, base * multiplier)
}

function causeForAge(age: number, rng: Rng): string {
  const bracket = DEATH_CAUSES_BY_AGE.find((b) => age <= b.maxAge)
  return bracket ? rng.pick(bracket.causes) : DEATH_CAUSE_OLD_AGE
}

/** Mata o personagem se for o caso. Roda DEPOIS dos eventos do turno. */
export function checkDeath(state: GameState, rng: Rng): void {
  const c = state.character
  if (!c.alive) return

  const kill = (cause: string): void => {
    c.alive = false
    c.deathCause = cause
    c.deathAge = c.age
  }

  if (c.stats.health <= 0) return kill(DEATH_CAUSE_POOR_HEALTH)
  if (c.age >= MAX_AGE) return kill(DEATH_CAUSE_OLD_AGE)
  if (rng.chance(mortalityChance(c.age, c.stats.health))) return kill(causeForAge(c.age, rng))
}
