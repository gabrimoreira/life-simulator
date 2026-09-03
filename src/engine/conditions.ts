// Avaliador de condicoes declarativas.

import { EDUCATION_LABELS, STAT_LABELS } from './labels'
import { formatMoney } from './text'
import { assertNever, EDUCATION_ORDER } from './types'
import type { Condition, EducationLevel, GameState } from './types'

function educationRank(level: EducationLevel): number {
  return EDUCATION_ORDER.indexOf(level)
}

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

    case 'not':
      return `Não pode: ${describe(condition.condition)}`

    case 'anyOf':
      return condition.conditions.map(describe).join(' ou ')

    default:
      return assertNever(condition, 'describe')
  }
}
