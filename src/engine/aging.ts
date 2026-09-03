// Envelhecimento e morte. Roda todo ano, sem escolha do jogador, e em silencio:
// a timeline e sobre eventos, nao sobre -2 de saude por ano.

import {
  DEATH_CAUSES_BY_AGE,
  DEATH_CAUSE_OLD_AGE,
  DEATH_CAUSE_POOR_HEALTH,
  HAPPINESS_MEAN,
  HAPPINESS_MEAN_REVERSION,
  HEALTH_BASELINE_DECLINE,
  HEALTH_PEAK_AGE,
  HEALTH_RECOVERY_RATE,
  INTELLIGENCE_SCHOOL_AGES,
  INTELLIGENCE_SCHOOL_GAIN,
  LOOKS_DECAY_FACTOR,
  LOOKS_DECAY_START_AGE,
  MAX_AGE,
  MORTALITY_BASE,
  MORTALITY_GROWTH,
  MORTALITY_HEALTH_MAX_MULT,
  MORTALITY_HEALTH_MIN_MULT,
  RELATION_ANNUAL_DECAY,
} from './balance'
import { setStat } from './effects'
import type { Rng } from './rng'
import type { GameState } from './types'

/** Teto de saude para a idade. 100 ate o pico, caindo depois. */
export function healthBaseline(age: number): number {
  return Math.max(0, 100 - Math.max(0, age - HEALTH_PEAK_AGE) * HEALTH_BASELINE_DECLINE)
}

export function applyAging(state: GameState, rng: Rng): void {
  const c = state.character

  setStat(c, 'health', c.stats.health + (healthBaseline(c.age) - c.stats.health) * HEALTH_RECOVERY_RATE)

  if (c.age >= LOOKS_DECAY_START_AGE) {
    const loss = (c.age - LOOKS_DECAY_START_AGE) * LOOKS_DECAY_FACTOR
    setStat(c, 'looks', c.stats.looks - loss)
  }

  // Felicidade regride a media: euforia e depressao nao duram para sempre.
  const drift = (HAPPINESS_MEAN - c.stats.happiness) * HAPPINESS_MEAN_REVERSION
  setStat(c, 'happiness', c.stats.happiness + drift)

  if (c.age >= INTELLIGENCE_SCHOOL_AGES.min && c.age <= INTELLIGENCE_SCHOOL_AGES.max) {
    setStat(
      c,
      'intelligence',
      c.stats.intelligence + rng.int(INTELLIGENCE_SCHOOL_GAIN.min, INTELLIGENCE_SCHOOL_GAIN.max),
    )
  }

  // Quem nao e cuidado se afasta. O envelhecimento e a morte dos parentes
  // ficam em `relations.ts`, junto com o resto do que e social.
  for (const person of state.relations) {
    if (!person.alive) continue
    person.relation = Math.max(0, person.relation - RELATION_ANNUAL_DECAY)
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
