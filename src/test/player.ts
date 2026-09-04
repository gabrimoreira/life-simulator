// Jogadores simulados.
//
// Todo número de balanceamento do projeto sai daqui, e por isso vale dizer o
// que estes jogadores NÃO são: eles não são pessoas. São dois limites.
//
// `first` sempre escolhe a primeira opção disponível. Nos eventos destrutivos
// — traição, o crime chegando em casa, largar tudo — essa é justamente a pior,
// e é por isso que ele serve de PISO: se um caminho é alcançável até para ele,
// é alcançável.
//
// `sensible` pontua cada opção pelo efeito esperado e escolhe a melhor. Não é
// esperto: não planeja, não guarda dinheiro para depois, não entende sinergia
// entre trilha e curso. Mas também não se sabota, e é isso que ele mede — o
// que acontece quando o jogador simplesmente não faz besteira.
//
// A distância entre os dois é a informação: um número que só muda quando o
// jogador é sensato depende de escolha; um número igual nos dois é estrutural.

import { availableActions, performAction } from '../engine/actions'
import { firstFailure } from '../engine/conditions'
import type { ContentPack } from '../engine/content-pack'
import { createGame } from '../engine/generate'
import { livingRelations, relationActionsFor } from '../engine/relations'
import { createRng } from '../engine/rng'
import { advanceYear, chooseOption, currentEvent, runRelationAction } from '../engine/turn'
import type { Effect, EventOption, GameState, Outcome } from '../engine/types'

export type Policy = 'first' | 'sensible'

export interface Plan {
  /** Prefixos de rótulo de ação, tentados nesta ordem a cada turno. */
  actions?: string[]
  /** Prefixos de ação de relação, tentados em cada pessoa viva. */
  social?: string[]
  policy?: Policy
  /**
   * Quantas vezes tentar CADA ação por turno.
   *
   * O padrão é 1, que espalha os pontos de ação entre as ações do plano. Com
   * 3, o plano concentra tudo na primeira que estiver disponível — é a
   * diferença entre "faço um pouco de cada" e "vou fundo numa coisa só", e
   * `economy.test.ts` mede justamente a segunda.
   */
  repeatActions?: number
  /** Teto de turnos, para um bug de conteúdo não virar laço infinito. */
  maxYears?: number
  name?: string
  /**
   * Chamado a cada turno, depois das ações e antes de avançar o ano.
   *
   * Existe para medir o que só aparece DURANTE a vida — o pico de anos
   * seguidos de infelicidade, o menor pool de eventos visto — e que o estado
   * final não guarda.
   */
  onYear?: (state: GameState) => void
}

/**
 * Quanto vale um efeito para quem só quer não se dar mal.
 *
 * Os pesos são grosseiros de propósito. Afinar isto até parecer inteligência
 * seria construir um jogador que joga o MEU jogo, e as medidas passariam a
 * dizer mais sobre a heurística do que sobre o balanceamento.
 */
function scoreEffect(effect: Effect): number {
  switch (effect.type) {
    case 'stat': {
      const peso = effect.stat === 'health' || effect.stat === 'happiness' ? 2 : 1
      // `set` é uma reescrita: o valor absoluto importa mais que o sinal.
      const valor = effect.op === 'set' ? effect.value - 50 : effect.value
      return valor * peso
    }
    case 'money':
      return effect.delta / 5_000
    case 'debt':
      return -effect.delta / 5_000
    case 'relation':
      return effect.delta * 0.5
    case 'addRelation':
      return 8
    case 'removeRelation':
      return -15
    case 'performance':
      return effect.delta * 0.6
    case 'career':
      // Promoção é boa; ser demitido ou largar é caro.
      return effect.action === 'promote' ? 25 : effect.action === 'hire' ? 15 : -25
    case 'jail':
      // Anos negativos são remição: ganho, não perda.
      return -effect.years * 25
    case 'release':
      return 40
    case 'death':
      return -1000
    case 'divorce':
      return -60
    case 'dropOut':
      return -30
    case 'enroll':
    case 'study':
      return 10
    case 'education':
      return 20
    case 'actionPoints':
      return effect.delta * 12
    case 'asset':
      // Comprar troca caixa por patrimônio; vender faz o contrário. Nenhum dos
      // dois é bom ou ruim por si — o peso pequeno reflete isso.
      return effect.action === 'buy' ? 5 : -5
    case 'flag':
    case 'relationKind':
      return 0
    default:
      return 0
  }
}

function scoreOutcome(outcome: Outcome): number {
  return outcome.effects.reduce((sum, effect) => sum + scoreEffect(effect), 0)
}

/** Valor esperado da opção, ponderado pela chance de cada desfecho. */
function scoreOption(option: EventOption): number {
  return option.outcomes.reduce((sum, o) => sum + o.chance * scoreOutcome(o), 0)
}

function pickOption(state: GameState, options: EventOption[], policy: Policy): number {
  const disponivel = (option: EventOption): boolean =>
    !option.requirements || firstFailure(option.requirements, state) === null

  if (policy === 'first') {
    const i = options.findIndex(disponivel)
    return i === -1 ? 0 : i
  }

  let melhor = -1
  let melhorScore = -Infinity
  options.forEach((option, i) => {
    if (!disponivel(option)) return
    const score = scoreOption(option)
    if (score > melhorScore) {
      melhorScore = score
      melhor = i
    }
  })
  return melhor === -1 ? 0 : melhor
}

/** Vive uma vida inteira, do nascimento à morte, e devolve o estado final. */
export function simulate(seed: number, content: ContentPack, plan: Plan = {}): GameState {
  const {
    actions = [],
    social = [],
    policy = 'first',
    repeatActions = 1,
    maxYears = 150,
    name = 'T',
    onYear,
  } = plan

  const state = createGame({ name, gender: 'male', seed, birthYear: 2000 }, content)
  const rng = createRng(seed)
  let guard = 0

  while (state.character.alive && guard++ < maxYears) {
    while (state.pendingEventIds.length > 0) {
      const event = currentEvent(state, content)
      if (!event) break
      chooseOption(state, content, pickOption(state, event.options, policy))
    }
    if (!state.character.alive) break

    for (const want of actions) {
      for (let i = 0; i < repeatActions; i++) {
        const action = availableActions(state, content).find(
          (a) => a.enabled && a.label.startsWith(want),
        )
        if (!action) break
        performAction(state, content, rng, action.id)
      }
    }

    for (const person of livingRelations(state)) {
      const disponiveis = relationActionsFor(state, content, person).filter((a) => a.enabled)
      for (const want of social) {
        const action = disponiveis.find((a) => a.label.startsWith(want))
        if (action && runRelationAction(state, content, person.id, action.id)) break
      }
    }

    onYear?.(state)
    advanceYear(state, content)
  }

  return state
}

/** Uma leva de vidas com o mesmo plano, variando só a seed. */
export function simulateMany(count: number, content: ContentPack, plan: Plan = {}): GameState[] {
  return Array.from({ length: count }, (_, i) => simulate(i + 1, content, plan))
}
