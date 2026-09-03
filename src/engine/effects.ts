// Aplicador de efeitos declarativos. Muta o estado e devolve a linha que a
// timeline mostra. Clamp de stat acontece aqui e em nenhum outro lugar.

import { STAT_MAX, STAT_MIN } from './balance'
import type { ContentPack } from './content-pack'
import { EDUCATION_LABELS, STAT_LABELS, relationLabel } from './labels'
import { createPerson } from './people'
import type { Rng } from './rng'
import { formatMoney } from './text'
import { assertNever } from './types'
import type { Character, Effect, EffectLog, GameState, Person, RelationRef } from './types'

export function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)))
}

/** Unico ponto de escrita de stat no projeto. Devolve o delta efetivo. */
export function setStat(character: Character, stat: keyof Character['stats'], value: number): number {
  const before = character.stats[stat]
  character.stats[stat] = clampStat(value)
  return character.stats[stat] - before
}

/**
 * Dinheiro nunca fica negativo: o que falta vira divida. Entrada de dinheiro
 * abate a divida antes de virar saldo.
 */
export function addMoney(character: Character, delta: number): void {
  if (delta >= 0) {
    const toDebt = Math.min(character.debt, delta)
    character.debt -= toDebt
    character.money += delta - toDebt
    return
  }

  const cost = -delta
  if (character.money >= cost) {
    character.money -= cost
  } else {
    character.debt += cost - character.money
    character.money = 0
  }
}

function findRelation(state: GameState, ref: RelationRef): Person | undefined {
  return ref.by === 'id'
    ? state.relations.find((r) => r.id === ref.id)
    : state.relations.find((r) => r.kind === ref.kind && r.alive)
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

export function applyEffect(
  effect: Effect,
  state: GameState,
  rng: Rng,
  content: ContentPack,
): EffectLog | null {
  const character = state.character

  switch (effect.type) {
    case 'stat': {
      const target = effect.op === 'set' ? effect.value : character.stats[effect.stat] + effect.value
      const delta = setStat(character, effect.stat, target)
      if (delta === 0) return null
      return {
        label: STAT_LABELS[effect.stat],
        text: signed(delta),
        tone: delta > 0 ? 'good' : 'bad',
      }
    }

    case 'money': {
      if (effect.delta === 0) return null
      addMoney(character, effect.delta)
      return {
        label: 'Dinheiro',
        text: `${effect.delta > 0 ? '+' : '−'}${formatMoney(Math.abs(effect.delta))}`,
        tone: effect.delta > 0 ? 'good' : 'bad',
      }
    }

    case 'debt': {
      if (effect.delta === 0) return null
      character.debt = Math.max(0, character.debt + effect.delta)
      return {
        label: 'Dívida',
        text: `${effect.delta > 0 ? '+' : '−'}${formatMoney(Math.abs(effect.delta))}`,
        tone: effect.delta > 0 ? 'bad' : 'good',
      }
    }

    case 'flag': {
      const before = character.flags[effect.flag] ?? false
      if (before === effect.value) return null
      character.flags[effect.flag] = effect.value
      return null // flags sao estado interno; aparecem no Perfil, nao na timeline
    }

    case 'education': {
      if (character.education === effect.level) return null
      character.education = effect.level
      return { label: 'Educação', text: EDUCATION_LABELS[effect.level], tone: 'good' }
    }

    case 'relation': {
      const person = findRelation(state, effect.target)
      if (!person) return null
      const before = person.relation
      person.relation = Math.max(0, Math.min(100, person.relation + effect.delta))
      const delta = person.relation - before
      if (delta === 0) return null
      return {
        label: person.name.split(' ')[0] ?? person.name,
        text: signed(delta),
        tone: delta > 0 ? 'good' : 'bad',
      }
    }

    case 'addRelation': {
      const person = createPerson(effect.kind, state, rng, content)
      state.relations.push(person)
      return {
        label: relationLabel(person.kind, person.gender),
        text: person.name.split(' ')[0] ?? person.name,
        tone: 'good',
      }
    }

    case 'removeRelation': {
      const person = findRelation(state, effect.target)
      if (!person) return null
      state.relations = state.relations.filter((r) => r.id !== person.id)
      return {
        label: relationLabel(person.kind, person.gender),
        text: 'saiu da sua vida',
        tone: 'bad',
      }
    }

    case 'death': {
      character.alive = false
      character.deathCause = effect.cause
      character.deathAge = character.age
      return null // a entrada de morte da timeline e escrita por `endTurn`
    }

    default:
      return assertNever(effect, 'applyEffect')
  }
}

export function applyEffects(
  effects: Effect[],
  state: GameState,
  rng: Rng,
  content: ContentPack,
): EffectLog[] {
  const logs: EffectLog[] = []
  for (const effect of effects) {
    const log = applyEffect(effect, state, rng, content)
    if (log) logs.push(log)
  }
  return logs
}
