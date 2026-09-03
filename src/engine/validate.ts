// Sanidade do conteudo. Roda nos testes, nao em runtime: conteudo quebrado
// deve derrubar o CI, nao o jogo do jogador.

import { KNOWN_TOKENS, extractTokens } from './text'
import type { Condition, GameEvent } from './types'

const CHANCE_TOLERANCE = 0.001
const MIN_OPTIONS = 2
const MAX_OPTIONS = 4

function checkTokens(text: string, where: string, problems: string[]): void {
  for (const token of extractTokens(text)) {
    if (!(KNOWN_TOKENS as readonly string[]).includes(token)) {
      problems.push(`${where}: token desconhecido "{${token}}"`)
    }
  }
}

function checkCondition(condition: Condition, where: string, problems: string[]): void {
  switch (condition.type) {
    case 'age':
    case 'money':
      if (condition.min === undefined && condition.max === undefined) {
        problems.push(`${where}: condicao "${condition.type}" sem min nem max`)
      } else if (
        condition.min !== undefined &&
        condition.max !== undefined &&
        condition.min > condition.max
      ) {
        problems.push(`${where}: condicao "${condition.type}" com min > max`)
      }
      break
    case 'stat':
      if (condition.min === undefined && condition.max === undefined) {
        problems.push(`${where}: condicao "stat" sem min nem max`)
      }
      break
    case 'socialClass':
      if (condition.oneOf.length === 0) problems.push(`${where}: "socialClass" com lista vazia`)
      break
    case 'anyOf':
      if (condition.conditions.length === 0) problems.push(`${where}: "anyOf" com lista vazia`)
      condition.conditions.forEach((inner, i) => checkCondition(inner, `${where}.anyOf[${i}]`, problems))
      break
    case 'not':
      checkCondition(condition.condition, `${where}.not`, problems)
      break
    default:
      break
  }
}

/** Lista de problemas encontrados. Vazia = conteudo saudavel. */
export function validateEvents(events: GameEvent[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const event of events) {
    const where = `evento "${event.id}"`

    if (event.id.trim() === '') problems.push('evento com id vazio')
    if (seen.has(event.id)) problems.push(`${where}: id duplicado`)
    seen.add(event.id)

    if (event.weight <= 0) problems.push(`${where}: weight deve ser > 0`)
    if (event.cooldown !== undefined && event.cooldown <= 0) {
      problems.push(`${where}: cooldown deve ser > 0`)
    }
    if (event.once === true && event.cooldown !== undefined) {
      problems.push(`${where}: once e cooldown juntos — o cooldown nunca importa`)
    }
    if (event.text.trim() === '') problems.push(`${where}: text vazio`)
    checkTokens(event.text, where, problems)

    event.conditions.forEach((c, i) => checkCondition(c, `${where}.conditions[${i}]`, problems))

    if (event.options.length < MIN_OPTIONS || event.options.length > MAX_OPTIONS) {
      problems.push(`${where}: ${event.options.length} opcoes (esperado ${MIN_OPTIONS}-${MAX_OPTIONS})`)
    }

    // O modal e bloqueante: sem uma saida sempre disponivel, o jogador trava.
    const hasFreeOption = event.options.some(
      (option) => option.requirements === undefined || option.requirements.length === 0,
    )
    if (!hasFreeOption) {
      problems.push(`${where}: todas as opcoes tem requisitos, o jogador pode travar`)
    }

    event.options.forEach((option, oi) => {
      const optionWhere = `${where}.options[${oi}]`
      if (option.text.trim() === '') problems.push(`${optionWhere}: text vazio`)
      checkTokens(option.text, optionWhere, problems)

      option.requirements?.forEach((c, i) =>
        checkCondition(c, `${optionWhere}.requirements[${i}]`, problems),
      )

      if (option.outcomes.length === 0) {
        problems.push(`${optionWhere}: sem outcomes`)
        return
      }

      let sum = 0
      option.outcomes.forEach((outcome, ri) => {
        const outcomeWhere = `${optionWhere}.outcomes[${ri}]`
        if (outcome.chance <= 0) problems.push(`${outcomeWhere}: chance deve ser > 0`)
        if (outcome.text.trim() === '') problems.push(`${outcomeWhere}: text vazio`)
        checkTokens(outcome.text, outcomeWhere, problems)
        sum += outcome.chance
      })

      if (Math.abs(sum - 1) > CHANCE_TOLERANCE) {
        problems.push(`${optionWhere}: chances somam ${sum.toFixed(3)}, esperado 1`)
      }
    })
  }

  return problems
}
