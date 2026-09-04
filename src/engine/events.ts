// Selecao de eventos e resolucao de outcomes.

import { evaluateAll } from './conditions'
import type { ContentPack } from './content-pack'
import { isInPrison, mentionsPrison } from './prison'
import type { Rng } from './rng'
import { STAT_KEYS } from './types'
import type { EventOption, GameEvent, GameState, Outcome, StatKey } from './types'

export function findEvent(content: ContentPack, id: string): GameEvent | undefined {
  return content.events.find((event) => event.id === id)
}

/** Eventos cujas condicoes passam agora e que ainda podem disparar. */
export function eligibleEvents(
  state: GameState,
  content: ContentPack,
  exclude: ReadonlySet<string> = new Set(),
): GameEvent[] {
  const fired = new Set(state.firedEventIds)
  const locked = isInPrison(state)

  return content.events.filter((event) => {
    if (exclude.has(event.id)) return false
    // Preso, a vida la fora simplesmente some do sorteio.
    if (locked !== mentionsPrison(event.conditions)) return false
    if (event.once === true && fired.has(event.id)) return false
    if (event.cooldown !== undefined) {
      const last = state.lastFiredYear[event.id]
      if (last !== undefined && state.year - last < event.cooldown) return false
    }
    return evaluateAll(event.conditions, state)
  })
}

/**
 * Sorteio ponderado sem reposicao. A Sorte NAO entra aqui — ela enviesa
 * outcomes, nao a chance de um evento acontecer.
 */
export function selectEvents(
  state: GameState,
  rng: Rng,
  content: ContentPack,
  count: number,
): GameEvent[] {
  const chosen: GameEvent[] = []
  const taken = new Set<string>()

  for (let i = 0; i < count; i++) {
    const pool = eligibleEvents(state, content, taken)
    if (pool.length === 0) break
    const event = rng.weighted(pool, (e) => e.weight)
    chosen.push(event)
    taken.add(event.id)
  }

  return chosen
}

/**
 * Chance do outcome depois do vies dos atributos.
 *
 * 50 e neutro em qualquer atributo; 100 com peso 1 dobra a chance, 0 zera.
 * Varios atributos somam: `{ charisma: 0.4, looks: 0.2 }` e uma negociacao
 * que depende mais de conversa do que de aparencia, e um pouco das duas.
 */
export function effectiveChance(outcome: Outcome, stats: Record<StatKey, number>): number {
  const bias = outcome.bias
  if (bias === undefined) return outcome.chance

  let factor = 1
  for (const key of STAT_KEYS) {
    const weight = bias[key]
    if (weight === undefined || weight === 0) continue
    factor += weight * ((stats[key] - 50) / 50)
  }
  return Math.max(0, outcome.chance * factor)
}

export function pickOutcome(
  option: EventOption,
  stats: Record<StatKey, number>,
  rng: Rng,
): Outcome {
  if (option.outcomes.length === 0) {
    throw new Error('pickOutcome: opcao sem outcomes')
  }
  if (option.outcomes.length === 1) {
    const only = option.outcomes[0]
    if (only === undefined) throw new Error('pickOutcome: outcome ausente')
    return only
  }
  // `weighted` ja normaliza pelo total, entao nao precisa renormalizar a mao.
  return rng.weighted(option.outcomes, (outcome) => effectiveChance(outcome, stats))
}
