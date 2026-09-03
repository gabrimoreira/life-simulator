// Prisão como sub-loop de turnos.
//
// Não há máquina de estados nova: toda ação e todo evento já passam por
// `conditions`, então basta que, preso, só apareça o que declara
// `{ type: 'inPrison', value: true }`. O resto do jogo simplesmente some.

import {
  PRISON_HAPPINESS_COST,
  PRISON_HEALTH_COST,
  PRISON_RELATION_DECAY,
  PRISON_REPUTATION_COST,
} from './balance'
import type { ContentPack } from './content-pack'
import { leaveCareer, setStat } from './careers-bridge'
import { makeNote } from './timeline'
import type { Condition, GameState, TimelineEntry } from './types'

export function isInPrison(state: GameState): boolean {
  return state.character.prison !== null
}

/**
 * Uma condição "menciona prisão" se em algum ponto da árvore fala de
 * `inPrison`. Conteúdo que não menciona é conteúdo da vida lá fora.
 */
export function mentionsPrison(conditions: Condition[]): boolean {
  const walk = (condition: Condition): boolean => {
    switch (condition.type) {
      case 'inPrison':
        return true
      case 'not':
        return walk(condition.condition)
      case 'anyOf':
        return condition.conditions.some(walk)
      default:
        return false
    }
  }
  return conditions.some(walk)
}

/**
 * Prende, ou soma à pena de quem já está preso. Carreira e matrícula acabam
 * junto. Sem a soma, um evento de briga dentro da cadeia dizia "sua pena
 * aumentou" e não aumentava nada.
 */
export function jail(
  state: GameState,
  content: ContentPack,
  years: number,
  reason: string,
): TimelineEntry {
  const c = state.character
  const total = Math.max(1, Math.round(years))

  const current = c.prison
  if (current) {
    current.yearsLeft += total
    return makeNote(
      state,
      `Sua pena aumentou em ${total} ${total === 1 ? 'ano' : 'anos'} por ${reason}.`,
      'crime',
      [{ label: 'Pena', text: `+${total} anos`, tone: 'bad' }],
    )
  }

  if (c.career !== null) leaveCareer(state, content)
  c.enrollment = null
  c.prison = { yearsLeft: total, reason, yearsServed: 0 }
  c.flags['criminal_record'] = true

  setStat(c, 'reputation', c.stats.reputation - PRISON_REPUTATION_COST)

  return makeNote(
    state,
    `Você foi condenad{o} a ${total} ${total === 1 ? 'ano' : 'anos'} por ${reason}.`,
    'crime',
    [{ label: 'Reputação', text: `-${PRISON_REPUTATION_COST}`, tone: 'bad' }],
  )
}

export function release(state: GameState): TimelineEntry | null {
  const prison = state.character.prison
  if (!prison) return null

  state.character.prison = null
  return makeNote(
    state,
    `Você saiu em liberdade depois de ${prison.yearsServed} ${prison.yearsServed === 1 ? 'ano' : 'anos'}.`,
    'crime',
    [{ label: 'Ficha', text: 'suja', tone: 'bad' }],
  )
}

/**
 * Um ano atrás das grades. Roda antes da economia: quem está preso não tem
 * renda nem custo de vida — é sustentado pelo Estado, e é o que torna a
 * cadeia cara em tempo, não em dinheiro.
 */
export function applyPrisonYear(state: GameState): TimelineEntry[] {
  const c = state.character
  const prison = c.prison
  if (!prison) return []

  prison.yearsLeft -= 1
  prison.yearsServed += 1

  setStat(c, 'health', c.stats.health - PRISON_HEALTH_COST)
  setStat(c, 'happiness', c.stats.happiness - PRISON_HAPPINESS_COST)

  for (const person of state.relations) {
    if (!person.alive) continue
    person.relation = Math.max(0, person.relation - PRISON_RELATION_DECAY)
  }

  if (prison.yearsLeft > 0) return []

  const note = release(state)
  return note ? [note] : []
}
