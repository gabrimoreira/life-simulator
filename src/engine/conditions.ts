// Avaliador de condicoes declarativas.

import { EDUCATION_LABELS, STAT_LABELS } from './labels'
import { formatMoney } from './text'
import { assertNever, educationRank } from './types'
import type { Condition, GameState } from './types'


function inRange(value: number, min: number | undefined, max: number | undefined): boolean {
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

export function evaluate(condition: Condition, state: GameState): boolean {
  const c = state.character

  switch (condition.type) {
    case 'age':
      return inRange(c.age, condition.min, condition.max)

    case 'stat':
      return inRange(c.stats[condition.stat], condition.min, condition.max)

    case 'money':
      return inRange(c.money, condition.min, condition.max)

    case 'flag':
      return (c.flags[condition.flag] ?? false) === condition.value

    case 'gender':
      return c.gender === condition.gender

    case 'socialClass':
      return condition.oneOf.includes(c.socialClass)

    case 'education':
      return condition.atLeast
        ? educationRank(c.education) >= educationRank(condition.level)
        : c.education === condition.level

    case 'hasRelation':
      return state.relations.some((r) => r.kind === condition.kind && r.alive)

    case 'hasCareer':
      return (c.career !== null) === condition.value

    case 'careerTrack':
      return c.career?.trackId === condition.trackId

    case 'careerKind':
      return c.career?.kind === condition.kind

    case 'careerLevel':
      return c.career !== null && inRange(c.career.level, condition.min, condition.max)

    case 'performance':
      return c.career !== null && inRange(c.career.performance, condition.min, condition.max)

    case 'enrolled':
      return (c.enrollment !== null) === condition.value

    case 'inPrison':
      return (c.prison !== null) === condition.value

    case 'unhappyYears':
      return inRange(c.unhappyYears, condition.min, condition.max)

    case 'ownsAsset':
      return c.assets.some((owned) => {
        if (condition.assetId !== undefined && owned.assetId !== condition.assetId) return false
        if (condition.kind !== undefined && owned.kind !== condition.kind) return false
        return true
      })

    case 'netWorth': {
      const worth = c.money + c.assets.reduce((sum, a) => sum + a.value, 0) - c.debt
      return inRange(worth, condition.min, condition.max)
    }

    case 'chose':
      return state.choiceLog.some(
        (record) =>
          record.eventId === condition.eventId && record.optionIndex === condition.optionIndex,
      )

    case 'relationLevel': {
      // Qualquer pessoa daquele tipo serve. Com `.find()` a resposta vinha
      // sempre do PRIMEIRO do array: quem tinha dois filhos e cuidava do
      // caçula continuava reprovado porque o primogênito estava frio.
      return state.relations.some(
        (r) => r.kind === condition.kind && r.alive && inRange(r.relation, condition.min, condition.max),
      )
    }

    case 'relationCount': {
      const floor = condition.minRelation
      const count = state.relations.filter(
        (r) =>
          r.kind === condition.kind && r.alive && (floor === undefined || r.relation >= floor),
      ).length
      return inRange(count, condition.min, condition.max)
    }

    case 'not':
      return !evaluate(condition.condition, state)

    case 'anyOf':
      return condition.conditions.some((inner) => evaluate(inner, state))

    default:
      return assertNever(condition, 'evaluate')
  }
}

export function evaluateAll(conditions: Condition[], state: GameState): boolean {
  return conditions.every((condition) => evaluate(condition, state))
}

/** Primeiro motivo de falha, ou null se tudo passar. Usado nas opcoes desabilitadas. */
export function firstFailure(conditions: Condition[], state: GameState): string | null {
  for (const condition of conditions) {
    if (!evaluate(condition, state)) return describe(condition)
  }
  return null
}

function describeRange(
  label: string,
  min: number | undefined,
  max: number | undefined,
  format: (n: number) => string,
): string {
  if (min !== undefined && max !== undefined) {
    return `Requer ${label} entre ${format(min)} e ${format(max)}`
  }
  if (min !== undefined) return `Requer ${label} ${format(min)} ou mais`
  if (max !== undefined) return `Requer ${label} ${format(max)} ou menos`
  return `Requer ${label}`
}

/** Motivo legivel de uma condicao, para mostrar numa opcao bloqueada. */
export function describe(condition: Condition): string {
  const plain = (n: number): string => String(n)

  switch (condition.type) {
    case 'age':
      return describeRange('idade', condition.min, condition.max, (n) => `${n} anos`)

    case 'stat':
      return describeRange(STAT_LABELS[condition.stat], condition.min, condition.max, plain)

    case 'money':
      return describeRange('saldo', condition.min, condition.max, formatMoney)

    case 'flag':
      return condition.value ? `Requer: ${condition.flag}` : `Impedido por: ${condition.flag}`

    case 'gender':
      return condition.gender === 'male' ? 'Apenas para homens' : 'Apenas para mulheres'

    case 'socialClass':
      return 'Requer outra origem social'

    case 'education':
      return condition.atLeast
        ? `Requer ${EDUCATION_LABELS[condition.level]}`
        : `Requer exatamente ${EDUCATION_LABELS[condition.level]}`

    case 'hasRelation':
      return 'Requer alguém próximo'

    case 'hasCareer':
      return condition.value ? 'Requer um trabalho' : 'Você já tem um trabalho'

    case 'careerTrack':
      return 'Requer outra carreira'

    case 'chose':
      return 'Depende de uma escolha que você não fez'

    case 'careerKind':
      return 'Requer outro tipo de carreira'

    case 'careerLevel':
      return describeRange('nível de carreira', condition.min, condition.max, plain)

    case 'performance':
      return describeRange('desempenho', condition.min, condition.max, plain)

    case 'enrolled':
      return condition.value ? 'Requer estar matriculado' : 'Você já está estudando'

    case 'inPrison':
      return condition.value ? 'Só na cadeia' : 'Não dá para fazer isso preso'

    case 'unhappyYears':
      return describeRange('anos seguidos de infelicidade', condition.min, condition.max, plain)

    case 'ownsAsset':
      return 'Requer ter um bem específico'

    case 'netWorth':
      return describeRange('patrimônio', condition.min, condition.max, formatMoney)

    case 'relationLevel':
      return describeRange('relação', condition.min, condition.max, plain)

    case 'relationCount':
      return condition.minRelation !== undefined
        ? describeRange('pessoas próximas', condition.min, condition.max, plain)
        : describeRange('número de pessoas', condition.min, condition.max, plain)

    case 'not':
      return `Não pode: ${describe(condition.condition)}`

    case 'anyOf':
      return condition.conditions.map(describe).join(' ou ')

    default:
      return assertNever(condition, 'describe')
  }
}
