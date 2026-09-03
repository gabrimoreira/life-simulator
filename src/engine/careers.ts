// Progressao de carreira. A trilha e conteudo; o estado do cargo e a regra de
// promocao moram aqui.

import {
  AGE_RETIREMENT_MIN,
  BANKRUPTCY_CHANCE,
  CAREER_RESTART_PENALTY,
  BANKRUPTCY_DEBT_RATIO,
  BANKRUPTCY_INCOME_RATIO,
  DEBT_CEILING,
  FIRE_CHANCE,
  FIRE_PERFORMANCE_THRESHOLD,
  PERFORMANCE_DRIFT,
  PERFORMANCE_FROM_CHARISMA,
  PERFORMANCE_FROM_INTELLIGENCE,
  PERFORMANCE_START,
  PROMOTION_BASE_CHANCE,
  PENSION_RATE,
  PROMOTION_PERFORMANCE_WEIGHT,
} from './balance'
import { evaluateAll } from './conditions'
import type { ContentPack } from './content-pack'
import { applyEffects } from './effects'
import type { Rng } from './rng'
import { formatMoney } from './text'
import { makeNote } from './timeline'
import type { CareerLevel, CareerTrack, GameState, TimelineEntry } from './types'

export function findTrack(content: ContentPack, trackId: string): CareerTrack | undefined {
  return content.careers.find((track) => track.id === trackId)
}

export function currentTrack(state: GameState, content: ContentPack): CareerTrack | undefined {
  const career = state.character.career
  return career ? findTrack(content, career.trackId) : undefined
}

export function currentLevel(state: GameState, content: ContentPack): CareerLevel | undefined {
  const career = state.character.career
  const track = currentTrack(state, content)
  return career && track ? track.levels[career.level] : undefined
}

/** "Analista pleno · Corporativo", ou null se desempregado. */
export function careerTitle(state: GameState, content: ContentPack): string | null {
  const level = currentLevel(state, content)
  const track = currentTrack(state, content)
  return level && track ? `${level.title} · ${track.name}` : null
}

export function clampPerformance(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

/** Desempenho para o qual a pessoa tende sozinha, sem esforco extra. */
export function performanceBaseline(state: GameState): number {
  const { intelligence, charisma } = state.character.stats
  return clampPerformance(
    intelligence * PERFORMANCE_FROM_INTELLIGENCE + charisma * PERFORMANCE_FROM_CHARISMA,
  )
}

/**
 * Nivel em que a pessoa ENTRA na trilha: o mais alto cujos requisitos ela ja
 * cumpre. Um engenheiro de 40 anos recomecando nao volta a ser estagiario.
 *
 * Niveis que exigem `performance` sao naturalmente inalcancaveis na entrada
 * (nao ha carreira, logo nao ha desempenho), o que ja limita o teto sem
 * precisar de nenhuma regra extra.
 */
export function entryLevel(state: GameState, track: CareerTrack): number {
  let qualified = 0
  for (let i = 1; i < track.levels.length; i++) {
    const candidate = track.levels[i]
    if (!candidate || !evaluateAll(candidate.requirements, state)) break
    qualified = i
  }

  // Quem ja subiu nesta trilha volta perto de onde estava, nao do zero.
  const best = state.character.careerHistory[track.id] ?? 0
  const afterPenalty = Math.max(0, best - CAREER_RESTART_PENALTY)

  return Math.min(track.levels.length - 1, Math.max(qualified, afterPenalty))
}

/** Registra o teto ja alcancado numa trilha, para uma volta futura. */
export function recordCareerBest(state: GameState, trackId: string, level: number): void {
  const best = state.character.careerHistory[trackId] ?? 0
  if (level > best) state.character.careerHistory[trackId] = level
}

/** Coloca o personagem na trilha. Nao valida o requisito de entrada. */
export function hireInto(state: GameState, track: CareerTrack): void {
  const level = entryLevel(state, track)
  state.character.career = {
    trackId: track.id,
    kind: track.kind,
    level,
    yearsInLevel: 0,
    yearsInTrack: 0,
    performance: PERFORMANCE_START,
  }
  recordCareerBest(state, track.id, level)
}

/**
 * Sai da carreira. Quem sai depois da idade de aposentadoria leva uma renda
 * vitalicia proporcional ao ultimo salario; quem sai antes, nao.
 */
export function leaveCareer(state: GameState, content: ContentPack): void {
  const level = currentLevel(state, content)
  if (level && state.character.age >= AGE_RETIREMENT_MIN) {
    state.character.pension = Math.max(
      state.character.pension,
      Math.round(level.salary * PENSION_RATE),
    )
  }
  state.character.career = null
}

/** Requisitos do proximo nivel, ou null se ja esta no topo. */
export function nextLevel(state: GameState, content: ContentPack): CareerLevel | null {
  const career = state.character.career
  const track = currentTrack(state, content)
  if (!career || !track) return null
  return track.levels[career.level + 1] ?? null
}

export function promotionReady(state: GameState, content: ContentPack): boolean {
  const career = state.character.career
  const next = nextLevel(state, content)
  if (!career || !next) return false
  return career.yearsInLevel >= next.minYears && evaluateAll(next.requirements, state)
}

function grossIncome(level: CareerLevel, rng: Rng): number {
  const volatility = level.volatility ?? 0
  if (volatility <= 0) return level.salary
  const swing = (rng.next() * 2 - 1) * volatility
  return Math.round(level.salary * (1 + swing))
}

export interface CareerYear {
  /** Renda bruta do ano. Pode ser negativa num ano ruim de negocio. */
  income: number
  notes: TimelineEntry[]
}

/**
 * Roda um ano de carreira: paga, move o desempenho, tenta promover e checa
 * demissao ou falencia. Nao mexe em dinheiro — quem soma e a economia.
 */
export function applyCareerYear(
  state: GameState,
  rng: Rng,
  content: ContentPack,
): CareerYear {
  const career = state.character.career
  const track = currentTrack(state, content)
  const level = currentLevel(state, content)
  if (!career || !track || !level) return { income: 0, notes: [] }

  const notes: TimelineEntry[] = []
  const income = grossIncome(level, rng)

  career.yearsInLevel += 1
  career.yearsInTrack += 1

  // Sem esforco deliberado, o desempenho volta para o que a pessoa e.
  const baseline = performanceBaseline(state)
  career.performance = clampPerformance(
    career.performance + (baseline - career.performance) * PERFORMANCE_DRIFT,
  )

  if (track.annualEffects) {
    applyEffects(track.annualEffects, state, rng, content)
  }

  // Falencia: um ano ruim de negocio pode acabar com tudo.
  if (track.kind === 'business' && income < level.salary * BANKRUPTCY_INCOME_RATIO) {
    if (rng.chance(BANKRUPTCY_CHANCE)) {
      const debt = Math.round(level.salary * BANKRUPTCY_DEBT_RATIO)
      state.character.debt = Math.min(DEBT_CEILING, state.character.debt + debt)
      leaveCareer(state, content)
      notes.push(
        makeNote(
          state,
          `O negócio quebrou. Você fechou as portas devendo ${formatMoney(debt)}.`,
          'career',
          [
            { label: 'Dívida', text: `+${formatMoney(debt)}`, tone: 'bad' },
            { label: 'Carreira', text: 'encerrada', tone: 'bad' },
          ],
        ),
      )
      return { income, notes }
    }
  }

  // Demissao por desempenho.
  if (track.kind === 'clt' && career.performance < FIRE_PERFORMANCE_THRESHOLD) {
    if (rng.chance(FIRE_CHANCE)) {
      leaveCareer(state, content)
      notes.push(
        makeNote(state, `Você foi demitid{o} de ${level.title.toLowerCase()}.`, 'career', [
          { label: 'Carreira', text: 'encerrada', tone: 'bad' },
        ]),
      )
      return { income, notes }
    }
  }

  // Promocao.
  const next = nextLevel(state, content)
  if (next && promotionReady(state, content)) {
    const bonus = ((career.performance - 50) / 50) * PROMOTION_PERFORMANCE_WEIGHT
    const chance = Math.max(0.02, Math.min(0.9, PROMOTION_BASE_CHANCE * (1 + bonus) + bonus * 0.2))
    if (rng.chance(chance)) {
      career.level += 1
      career.yearsInLevel = 0
      recordCareerBest(state, track.id, career.level)
      notes.push(
        makeNote(state, `Você foi promovid{o} a ${next.title.toLowerCase()}.`, 'career', [
          { label: 'Cargo', text: next.title, tone: 'good' },
          { label: 'Salário', text: formatMoney(next.salary), tone: 'good' },
        ]),
      )
    }
  }

  return { income, notes }
}
