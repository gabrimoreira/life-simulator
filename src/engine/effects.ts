// Aplicador de efeitos declarativos. Muta o estado e devolve a linha que a
// timeline mostra. Clamp de stat acontece aqui e em nenhum outro lugar.

import { DEBT_CEILING, STAT_MAX, STAT_MIN } from './balance'
import { assetName, buyAsset, findAsset, sellAsset } from './assets'
import { clampPerformance, hireInto, leaveCareer, recordCareerBest } from './careers'
import { evaluateAll } from './conditions'
import { courseName, dropOut, enroll, studyYear } from './education'
import type { ContentPack } from './content-pack'
import { EDUCATION_LABELS, STAT_LABELS, relationLabel } from './labels'
import { createPerson } from './people'
import { jail, release } from './prison'
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
 *
 * A divida para no teto porque ninguem empresta para sempre. Passado esse
 * ponto o gasto simplesmente nao acontece — a pessoa corta o proprio padrao
 * de vida ate caber. Sem isso, 70 anos de deficit produzem um numero de
 * milhoes que nao significa mais nada na tela.
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
    return
  }

  const shortfall = cost - character.money
  character.money = 0
  character.debt = Math.min(DEBT_CEILING, character.debt + shortfall)
}

function findRelation(state: GameState, ref: RelationRef): Person | undefined {
  switch (ref.by) {
    case 'id':
      return state.relations.find((r) => r.id === ref.id)
    case 'kind':
      return state.relations.find((r) => r.kind === ref.kind && r.alive)
    case 'target':
      // `retarget()` em relations.ts troca isto por um ref de id antes de
      // chegar aqui. Um 'target' vivo neste ponto e conteudo escrito errado.
      return undefined
    default:
      return assertNever(ref, 'findRelation')
  }
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
      character.debt = Math.max(0, Math.min(DEBT_CEILING, character.debt + effect.delta))
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

    case 'career': {
      const career = state.character.career
      // Extraido antes do switch: com `effect` narrowed a never no default, o
      // acesso a `.action` deixa de compilar.
      const action = effect.action
      switch (action) {
        case 'hire': {
          const track = effect.trackId
            ? content.careers.find((t) => t.id === effect.trackId)
            : undefined
          if (!track || career !== null) return null
          hireInto(state, track)
          return { label: 'Carreira', text: track.name, tone: 'good' }
        }
        case 'promote': {
          if (!career) return null
          const track = content.careers.find((t) => t.id === career.trackId)
          const next = track?.levels[career.level + 1]
          if (!next) return null
          // Respeita a tabela de requisitos. Sem isto, qualquer evento com um
          // efeito de promocao furava a progressao inteira: um personagem sem
          // diploma chegava a Analista senior, e a educacao deixava de valer
          // qualquer coisa para a carreira.
          if (!evaluateAll(next.requirements, state)) return null
          career.level += 1
          career.yearsInLevel = 0
          recordCareerBest(state, career.trackId, career.level)
          return { label: 'Cargo', text: next.title, tone: 'good' }
        }
        case 'quit':
        case 'fire': {
          if (!career) return null
          leaveCareer(state, content)
          return {
            label: 'Carreira',
            text: action === 'quit' ? 'largou o emprego' : 'demitido',
            tone: 'bad',
          }
        }
        default:
          return assertNever(action, 'applyEffect/career')
      }
    }

    case 'performance': {
      const career = state.character.career
      if (!career) return null
      const before = career.performance
      career.performance = clampPerformance(career.performance + effect.delta)
      const delta = career.performance - before
      if (delta === 0) return null
      return { label: 'Desempenho', text: signed(delta), tone: delta > 0 ? 'good' : 'bad' }
    }

    case 'enroll': {
      return enroll(state, content, effect.courseId)
        ? { label: 'Matrícula', text: courseName(content, effect.courseId), tone: 'good' }
        : null
    }

    case 'study': {
      // A nota rica de "cursar um ano" e escrita por `studyYear`; aqui o efeito
      // so existe para conteudo que queira empurrar um ano de curso de brinde.
      return studyYear(state, content, rng) !== null
        ? { label: 'Curso', text: 'mais um ano', tone: 'neutral' }
        : null
    }

    case 'dropOut': {
      return dropOut(state) ? { label: 'Curso', text: 'abandonado', tone: 'bad' } : null
    }

    case 'actionPoints': {
      state.actionPoints = Math.max(0, state.actionPoints + effect.delta)
      return {
        label: 'Pontos de ação',
        text: signed(effect.delta),
        tone: effect.delta > 0 ? 'good' : 'bad',
      }
    }

    case 'asset': {
      if (effect.action === 'buy') {
        const asset = findAsset(content, effect.assetId)
        if (!asset || !buyAsset(state, content, effect.assetId)) return null
        return { label: asset.name, text: `−${formatMoney(asset.price)}`, tone: 'neutral' }
      }
      const proceeds = sellAsset(state, effect.assetId)
      if (proceeds === null) return null
      return {
        label: assetName(content, effect.assetId),
        text: `+${formatMoney(proceeds)}`,
        tone: 'good',
      }
    }

    case 'relationKind': {
      const person = findRelation(state, effect.target)
      if (!person || person.kind === effect.kind) return null
      person.kind = effect.kind
      return { label: relationLabel(effect.kind, person.gender), text: person.name.split(' ')[0] ?? person.name, tone: 'good' }
    }

    case 'jail': {
      const wasInside = state.character.prison !== null
      // A nota rica de condenacao e escrita por `jail()`; aqui so o resumo.
      jail(state, content, effect.years, effect.reason)
      return {
        label: wasInside ? 'Pena' : 'Preso',
        text: `${wasInside ? '+' : ''}${effect.years} anos`,
        tone: 'bad',
      }
    }

    case 'release': {
      return release(state) !== null ? { label: 'Solto', text: 'liberdade', tone: 'good' } : null
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
