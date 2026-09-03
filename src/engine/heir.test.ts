import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { makeCharacter, makeState } from '../test/fixtures'
import { INHERITANCE_SHARE } from './balance'
import { buyAsset } from './assets'
import { canContinue, createHeir, heirCandidates } from './heir'
import { availableActions, performAction } from './actions'
import { firstFailure } from './conditions'
import { createGame } from './generate'
import { livingRelations, relationActionsFor } from './relations'
import { createRng } from './rng'
import { advanceYear, chooseOption, currentEvent, runRelationAction } from './turn'
import type { GameState, Person } from './types'

function child(overrides: Partial<Person> = {}): Person {
  return {
    id: 'c1',
    name: 'Lucas Prado',
    kind: 'child',
    gender: 'male',
    age: 12,
    relation: 70,
    alive: true,
    ...overrides,
  }
}

function dead(overrides: Partial<GameState> = {}): GameState {
  const state = makeState({
    year: 2060,
    character: makeCharacter({ name: 'Heitor Prado', money: 200_000, debt: 0, alive: false }),
    ...overrides,
  })
  state.character.deathAge = 60
  state.character.deathCause = 'infarto'
  return state
}

describe('candidatos', () => {
  it('só filhos vivos continuam a história', () => {
    const state = dead({
      relations: [
        child({ id: 'a' }),
        child({ id: 'b', alive: false }),
        { id: 'm', name: 'Ana', kind: 'mother', gender: 'female', age: 80, relation: 50, alive: true },
      ],
    })
    expect(heirCandidates(state).map((p) => p.id)).toEqual(['a'])
  })

  it('sem filho vivo, não há como continuar', () => {
    expect(canContinue(dead({ relations: [] }))).toBe(false)
    expect(canContinue(dead({ relations: [child()] }))).toBe(true)
  })

  it('não oferece herdeiro enquanto o personagem está vivo', () => {
    const state = makeState({ relations: [child()] })
    expect(canContinue(state)).toBe(false)
  })
})

describe('herança', () => {
  it('passa uma fatia do patrimônio, dividida entre os filhos', () => {
    const state = dead({ relations: [child({ id: 'a' }), child({ id: 'b' })] })
    const heir = createHeir(state, 'a')
    expect(heir?.character.money).toBe(Math.round((200_000 * INHERITANCE_SHARE) / 2))
  })

  it('conta os bens, não só o caixa', () => {
    const semBens = dead({ relations: [child()] })
    const comBens = dead({ relations: [child()] })
    comBens.character.money = 200_000
    buyAsset(comBens, GAME_CONTENT, 'fixed_income')

    const a = createHeir(semBens, 'c1')
    const b = createHeir(comBens, 'c1')
    // Comprar um ativo tira do caixa mas não some do patrimônio.
    expect(b?.character.money).toBe(a?.character.money)
  })

  it('patrimônio negativo não vira herança negativa', () => {
    const state = dead({ relations: [child()] })
    state.character.money = 0
    state.character.debt = 300_000
    expect(createHeir(state, 'c1')?.character.money).toBe(0)
  })

  it('dívida do falecido não passa para o filho', () => {
    const state = dead({ relations: [child()] })
    state.character.debt = 100_000
    expect(createHeir(state, 'c1')?.character.debt).toBe(0)
  })
})

describe('o filho', () => {
  it('assume nome, gênero e idade próprios', () => {
    const state = dead({ relations: [child({ name: 'Lucas Prado', age: 20, gender: 'male' })] })
    const heir = createHeir(state, 'c1')
    expect(heir?.character.name).toBe('Lucas Prado')
    expect(heir?.character.age).toBe(20)
    expect(heir?.character.gender).toBe('male')
    expect(heir?.character.birthYear).toBe(2060 - 20)
  })

  it('já tem a escolaridade que a idade garante', () => {
    const state = dead({ relations: [child({ age: 25 })] })
    expect(createHeir(state, 'c1')?.character.education).toBe('highschool')

    const jovem = dead({ relations: [child({ age: 8 })] })
    expect(createHeir(jovem, 'c1')?.character.education).toBe('none')
  })

  it('herda metade dos atributos, com regressão à média', () => {
    const state = dead({ relations: [child()] })
    for (const key of ['intelligence', 'charisma', 'health'] as const) {
      state.character.stats[key] = 100
    }
    const heir = createHeir(state, 'c1')
    if (!heir) throw new Error('sem herdeiro')

    // Puxa para cima sem copiar: linhagem otimizada não vira escada infinita.
    expect(heir.character.stats.intelligence).toBeGreaterThan(55)
    expect(heir.character.stats.intelligence).toBeLessThan(100)
  })

  it('não herda fama — filho de famoso ainda não é ninguém', () => {
    const state = dead({ relations: [child()] })
    state.character.stats.fame = 100
    expect(createHeir(state, 'c1')?.character.stats.fame).toBeLessThan(15)
  })

  it('não herda carreira, curso nem bens do pai', () => {
    const state = dead({ relations: [child()] })
    state.character.money = 500_000
    buyAsset(state, GAME_CONTENT, 'car_popular')
    const heir = createHeir(state, 'c1')
    expect(heir?.character.assets).toEqual([])
    expect(heir?.character.career).toBeNull()
    expect(heir?.character.enrollment).toBeNull()
  })
})

describe('a família que sobra', () => {
  it('o cônjuge do falecido vira o outro pai', () => {
    const state = dead({
      relations: [
        child(),
        { id: 's', name: 'Ana Prado', kind: 'spouse', gender: 'female', age: 58, relation: 80, alive: true },
      ],
    })
    const heir = createHeir(state, 'c1')
    expect(heir?.relations.find((p) => p.id === 's')?.kind).toBe('mother')
  })

  it('os outros filhos viram irmãos', () => {
    const state = dead({ relations: [child({ id: 'a' }), child({ id: 'b' })] })
    expect(createHeir(state, 'a')?.relations.find((p) => p.id === 'b')?.kind).toBe('sibling')
  })

  it('avós e amigos do falecido não entram na vida do filho', () => {
    const state = dead({
      relations: [
        child(),
        { id: 'g', name: 'Zilda', kind: 'mother', gender: 'female', age: 85, relation: 40, alive: true },
        { id: 'f', name: 'Diego', kind: 'friend', gender: 'male', age: 60, relation: 70, alive: true },
      ],
    })
    const ids = createHeir(state, 'c1')?.relations.map((p) => p.id)
    expect(ids).not.toContain('g')
    expect(ids).not.toContain('f')
  })

  it('quem já morreu não é transportado', () => {
    const state = dead({ relations: [child(), child({ id: 'x', alive: false })] })
    expect(createHeir(state, 'c1')?.relations).toHaveLength(0)
  })
})

describe('continuidade', () => {
  it('a vida do filho é jogável a partir do primeiro ano', () => {
    const state = dead({ relations: [child({ age: 18 })] })
    const heir = createHeir(state, 'c1')
    if (!heir) throw new Error('sem herdeiro')

    expect(heir.timeline.length).toBeGreaterThan(0)
    advanceYear(heir, GAME_CONTENT)
    expect(heir.character.age).toBe(19)
  })

  it('a linhagem continua determinística', () => {
    const a = createHeir(dead({ relations: [child()] }), 'c1')
    const b = createHeir(dead({ relations: [child()] }), 'c1')
    expect(JSON.stringify(b)).toBe(JSON.stringify(a))
  })

  it('herdeiro inexistente devolve null', () => {
    expect(createHeir(dead({ relations: [child()] }), 'fantasma')).toBeNull()
  })
})

/**
 * O herdeiro é o gancho de rejogabilidade da fase inteira. Se ele for raro
 * demais, a fase não entregou nada — e na primeira medição ele era: 9 em 50.
 * O conserto foi baixar o custo de "ter um filho" para 1 ponto de ação e o
 * decaimento de relação de 3 para 2 ao ano.
 */
describe('alcançabilidade da linhagem', () => {
  const SOCIAL = ['Pedir em casamento', 'Ter um filho', 'Conversar']

  function vive(seed: number, prioridade: string[]): GameState {
    const state = createGame({ name: 'T', gender: 'male', seed, birthYear: 2000 }, GAME_CONTENT)
    const rng = createRng(seed)
    let guard = 0

    while (state.character.alive && guard++ < 150) {
      while (state.pendingEventIds.length > 0) {
        const event = currentEvent(state, GAME_CONTENT)
        if (!event) break
        let pick = 0
        for (let i = 0; i < event.options.length; i++) {
          const option = event.options[i]
          if (option && (!option.requirements || firstFailure(option.requirements, state) === null)) {
            pick = i
            break
          }
        }
        chooseOption(state, GAME_CONTENT, pick)
      }
      if (!state.character.alive) break

      for (const want of prioridade) {
        const action = availableActions(state, GAME_CONTENT).find(
          (a) => a.enabled && a.label.startsWith(want),
        )
        if (action) performAction(state, GAME_CONTENT, rng, action.id)
      }
      for (const person of livingRelations(state)) {
        const disponiveis = relationActionsFor(state, GAME_CONTENT, person).filter((a) => a.enabled)
        for (const want of SOCIAL) {
          const action = disponiveis.find((a) => a.label.startsWith(want))
          if (action && runRelationAction(state, GAME_CONTENT, person.id, action.id)) break
        }
      }
      advanceYear(state, GAME_CONTENT)
    }
    return state
  }

  it('quem prioriza família chega ao herdeiro na maioria das vidas', () => {
    const vidas = Array.from({ length: 30 }, (_, i) =>
      vive(i + 1, ['Procurar emprego', 'Procurar um relacionamento']),
    )
    const comFilho = vidas.filter(canContinue).length
    expect(comFilho / vidas.length).toBeGreaterThan(0.6)
  })

  it('gastar todo ponto de ação na carreira custa a família', () => {
    // Os pontos de ação existem para forçar essa escolha. Se os planos dessem
    // o mesmo resultado, não haveria decisão nenhuma no meio.
    //
    // A comparação é com o plano que consome os TRÊS pontos em carreira. Um
    // plano de carreira que ainda sobra um ponto para namorar não paga preço
    // nenhum — e essa era a versão frouxa que este teste media antes.
    const familia = Array.from({ length: 40 }, (_, i) =>
      vive(i + 1, ['Procurar emprego', 'Procurar um relacionamento']),
    ).filter(canContinue).length

    const carreira = Array.from({ length: 40 }, (_, i) =>
      vive(i + 1, [
        'Cursar mais um ano',
        'Procurar emprego',
        'Se dedicar ao trabalho',
        'Fazer networking',
      ]),
    ).filter(canContinue).length

    expect(carreira).toBeLessThan(familia * 0.7)
  })
})
