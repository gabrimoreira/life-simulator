// Sanidade do conteudo. Roda nos testes, nao em runtime: conteudo quebrado
// deve derrubar o CI, nao o jogo do jogador.

import { KNOWN_TOKENS, extractTokens } from './text'
import type { ContentPack } from './content-pack'
import { ENGINE_READ_FLAGS } from './flags'
import type {
  Achievement,
  AssetDef,
  CareerTrack,
  Condition,
  Course,
  GameAction,
  Effect,
  GameEvent,
  Outcome,
  RelationAction,
} from './types'

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

function checkOutcomes(outcomes: Outcome[], where: string, problems: string[]): void {
  if (outcomes.length === 0) {
    problems.push(`${where}: sem outcomes`)
    return
  }

  let sum = 0
  outcomes.forEach((outcome, i) => {
    const outcomeWhere = `${where}.outcomes[${i}]`
    if (outcome.chance <= 0) problems.push(`${outcomeWhere}: chance deve ser > 0`)
    if (outcome.text.trim() === '') problems.push(`${outcomeWhere}: text vazio`)
    checkTokens(outcome.text, outcomeWhere, problems)
    sum += outcome.chance
  })

  if (Math.abs(sum - 1) > CHANCE_TOLERANCE) {
    problems.push(`${where}: chances somam ${sum.toFixed(3)}, esperado 1`)
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

      checkOutcomes(option.outcomes, optionWhere, problems)
    })
  }

  return problems
}


export function validateActions(actions: GameAction[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const action of actions) {
    const where = `acao "${action.id}"`

    if (seen.has(action.id)) problems.push(`${where}: id duplicado`)
    seen.add(action.id)

    // O engine reserva estes prefixos para acoes derivadas de cursos e trilhas.
    if (action.id.includes(':')) problems.push(`${where}: ":" e reservado para acoes derivadas`)
    if (action.id === 'study' || action.id === 'drop_out') {
      problems.push(`${where}: id colide com uma acao derivada do engine`)
    }

    if (action.cost < 0) problems.push(`${where}: cost negativo`)
    if (action.label.trim() === '') problems.push(`${where}: label vazio`)
    if (action.hint.trim() === '') problems.push(`${where}: hint vazio`)
    if (action.cooldown !== undefined && action.cooldown <= 0) {
      problems.push(`${where}: cooldown deve ser > 0`)
    }

    action.conditions.forEach((c, i) => checkCondition(c, `${where}.conditions[${i}]`, problems))
    action.requirements?.forEach((c, i) =>
      checkCondition(c, `${where}.requirements[${i}]`, problems),
    )
    checkOutcomes(action.outcomes, where, problems)
  }

  return problems
}

export function validateCareers(careers: CareerTrack[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const track of careers) {
    const where = `trilha "${track.id}"`

    if (seen.has(track.id)) problems.push(`${where}: id duplicado`)
    seen.add(track.id)

    if (track.levels.length < 2) problems.push(`${where}: precisa de pelo menos 2 niveis`)

    track.levels.forEach((level, i) => {
      const levelWhere = `${where}.levels[${i}]`
      if (level.title.trim() === '') problems.push(`${levelWhere}: title vazio`)
      if (level.salary <= 0) problems.push(`${levelWhere}: salary deve ser > 0`)
      if (level.minYears < 0) problems.push(`${levelWhere}: minYears negativo`)
      if (level.volatility !== undefined && (level.volatility < 0 || level.volatility > 0.95)) {
        problems.push(`${levelWhere}: volatility fora de 0..0.95`)
      }
      // Um nivel que paga menos que o anterior nunca seria uma promocao.
      const previous = track.levels[i - 1]
      if (previous && level.salary <= previous.salary) {
        problems.push(`${levelWhere}: salario nao sobe em relacao ao nivel anterior`)
      }
      level.requirements.forEach((c, ci) =>
        checkCondition(c, `${levelWhere}.requirements[${ci}]`, problems),
      )
    })
  }

  return problems
}

export function validateCourses(courses: Course[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const course of courses) {
    const where = `curso "${course.id}"`

    if (seen.has(course.id)) problems.push(`${where}: id duplicado`)
    seen.add(course.id)

    if (course.name.trim() === '') problems.push(`${where}: name vazio`)
    if (course.years <= 0) problems.push(`${where}: years deve ser > 0`)
    if (course.annualCost < 0) problems.push(`${where}: annualCost negativo`)

    course.requirements.forEach((c, i) =>
      checkCondition(c, `${where}.requirements[${i}]`, problems),
    )
  }

  return problems
}


export function validateAssets(assets: AssetDef[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const asset of assets) {
    const where = `ativo "${asset.id}"`

    if (seen.has(asset.id)) problems.push(`${where}: id duplicado`)
    seen.add(asset.id)

    if (asset.name.trim() === '') problems.push(`${where}: name vazio`)
    if (asset.hint.trim() === '') problems.push(`${where}: hint vazio`)
    if (asset.price <= 0) problems.push(`${where}: price deve ser > 0`)
    if (asset.upkeepRate < 0) problems.push(`${where}: upkeepRate negativo`)
    if (asset.volatility < 0) problems.push(`${where}: volatility negativa`)
    // Um ativo que valoriza sem cobrar nada e sem risco e dinheiro de graca:
    // o jogo nao tem inflacao, entao o retorno aqui e real, nao nominal.
    if (asset.appreciation > 0.06 && asset.upkeepRate === 0 && asset.volatility < 0.15) {
      problems.push(`${where}: valoriza forte sem custo nem risco`)
    }

    asset.requirements.forEach((c, i) =>
      checkCondition(c, `${where}.requirements[${i}]`, problems),
    )
  }

  return problems
}

export function validateRelationActions(actions: RelationAction[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const action of actions) {
    const where = `acao de relacao "${action.id}"`

    if (seen.has(action.id)) problems.push(`${where}: id duplicado`)
    seen.add(action.id)

    if (action.kinds.length === 0) problems.push(`${where}: sem tipos de relacao`)
    if (action.label.trim() === '') problems.push(`${where}: label vazio`)
    if (action.hint.trim() === '') problems.push(`${where}: hint vazio`)
    if (action.cost < 0) problems.push(`${where}: cost negativo`)
    if (action.cooldown !== undefined && action.cooldown <= 0) {
      problems.push(`${where}: cooldown deve ser > 0`)
    }
    if (
      action.minRelation !== undefined &&
      action.maxRelation !== undefined &&
      action.minRelation > action.maxRelation
    ) {
      problems.push(`${where}: minRelation > maxRelation, a acao nunca aparece`)
    }

    action.conditions?.forEach((c, i) => checkCondition(c, `${where}.conditions[${i}]`, problems))
    action.requirements?.forEach((c, i) =>
      checkCondition(c, `${where}.requirements[${i}]`, problems),
    )
    checkOutcomes(action.outcomes, where, problems)
  }

  return problems
}


export function validateAchievements(achievements: Achievement[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const achievement of achievements) {
    const where = `conquista "${achievement.id}"`

    if (seen.has(achievement.id)) problems.push(`${where}: id duplicado`)
    seen.add(achievement.id)

    if (achievement.name.trim() === '') problems.push(`${where}: name vazio`)
    if (achievement.description.trim() === '') problems.push(`${where}: description vazia`)
    // Conquista sem condicao seria concedida no primeiro turno de toda vida.
    if (achievement.conditions.length === 0) problems.push(`${where}: sem condicoes`)

    achievement.conditions.forEach((c, i) =>
      checkCondition(c, `${where}.conditions[${i}]`, problems),
    )
  }

  return problems
}

// ---------------------------------------------------------------------------
// Saude do conteudo como um todo
// ---------------------------------------------------------------------------

function walkConditionFlags(condition: Condition, read: Set<string>): void {
  switch (condition.type) {
    case 'flag':
      read.add(condition.flag)
      break
    case 'not':
      walkConditionFlags(condition.condition, read)
      break
    case 'anyOf':
      condition.conditions.forEach((inner) => walkConditionFlags(inner, read))
      break
    default:
      break
  }
}

function walkConditions(conditions: Condition[] | undefined, read: Set<string>): void {
  conditions?.forEach((condition) => walkConditionFlags(condition, read))
}

function walkEffects(effects: Effect[], written: Set<string>): void {
  for (const effect of effects) {
    if (effect.type === 'flag') written.add(effect.flag)
  }
}

function walkOutcomes(outcomes: Outcome[], written: Set<string>): void {
  outcomes.forEach((outcome) => walkEffects(outcome.effects, written))
}

/**
 * Flags que o conteudo escreve e ninguem le.
 *
 * Uma flag write-only e uma promessa quebrada: o Perfil mostra "Ficha suja" e
 * nada no jogo se comporta diferente por causa disso. Foram onze de dezesseis
 * quando isto foi medido pela primeira vez.
 */
export function orphanFlags(content: ContentPack): string[] {
  const written = new Set<string>()
  const read = new Set<string>(ENGINE_READ_FLAGS)

  for (const event of content.events) {
    walkConditions(event.conditions, read)
    for (const option of event.options) {
      walkConditions(option.requirements, read)
      walkOutcomes(option.outcomes, written)
    }
  }

  for (const action of content.actions) {
    walkConditions(action.conditions, read)
    walkConditions(action.requirements, read)
    walkOutcomes(action.outcomes, written)
  }

  for (const action of content.relationActions) {
    walkConditions(action.conditions, read)
    walkConditions(action.requirements, read)
    walkOutcomes(action.outcomes, written)
  }

  for (const track of content.careers) {
    track.levels.forEach((level) => walkConditions(level.requirements, read))
    walkEffects(track.annualEffects ?? [], written)
  }

  for (const course of content.courses) {
    walkConditions(course.requirements, read)
    walkEffects(course.completionEffects, written)
  }

  for (const asset of content.assets) {
    walkConditions(asset.requirements, read)
  }

  return [...written].filter((flag) => !read.has(flag)).sort()
}
