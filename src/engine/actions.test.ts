import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { availableActions, findAction, performAction, resetActionPoints } from './actions'
import { ACTION_POINTS_PER_TURN } from './balance'
import { createRng } from './rng'
import { courseFlag } from './types'
import type { CareerTrack, Course, GameAction, GameState } from './types'

const CURSO: Course = {
  id: 'direito',
  name: 'Direito',
  grants: 'bachelor',
  years: 2,
  annualCost: 0,
  requirements: [{ type: 'stat', stat: 'intelligence', min: 60 }],
  completionEffects: [],
}

const TRILHA: CareerTrack = {
  id: 'clt',
  name: 'Corporativo',
  kind: 'clt',
  entryLabel: 'Procurar emprego',
  entryHint: 'Renda previsível.',
  levels: [
    {
      title: 'Júnior',
      salary: 40_000,
      minYears: 0,
      requirements: [{ type: 'age', min: 18 }],
    },
    {
      title: 'Pleno',
      salary: 80_000,
      minYears: 2,
      requirements: [{ type: 'stat', stat: 'intelligence', min: 80 }],
    },
  ],
}

const BARATA: GameAction = {
  id: 'train',
  group: 'health',
  label: 'Treinar',
  hint: 'Exercício.',
  cost: 1,
  conditions: [],
  outcomes: [
    {
      chance: 1,
      text: 'Você treinou.',
      effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 5 }],
    },
  ],
}

const CARA: GameAction = {
  id: 'run_scam',
  group: 'crime',
  label: 'Golpe',
  hint: 'Caro.',
  cost: 2,
  cooldown: 3,
  conditions: [],
  requirements: [{ type: 'stat', stat: 'charisma', min: 90 }],
  outcomes: [{ chance: 1, text: 'Funcionou.', effects: [{ type: 'money', delta: 1_000 }] }],
}

const content = makeContent([], {
  actions: [BARATA, CARA],
  careers: [TRILHA],
  courses: [CURSO],
})

const rng = () => createRng(1)
const ids = (state: GameState): string[] => availableActions(state, content).map((a) => a.id)
const view = (state: GameState, id: string) =>
  availableActions(state, content).find((a) => a.id === id)

describe('pontos de ação', () => {
  it('recarregam todo turno', () => {
    const state = makeState({ actionPoints: 0 })
    resetActionPoints(state)
    expect(state.actionPoints).toBe(ACTION_POINTS_PER_TURN)
  })

  it('a ação desconta o próprio custo', () => {
    const state = makeState({ actionPoints: 3 })
    performAction(state, content, rng(), 'train')
    expect(state.actionPoints).toBe(2)
  })

  it('ação sem pontos suficientes aparece bloqueada e não executa', () => {
    const state = makeState({ actionPoints: 1 })
    state.character.stats.charisma = 95
    expect(view(state, 'run_scam')?.enabled).toBe(false)
    expect(view(state, 'run_scam')?.reason).toContain('pontos de ação')
    expect(performAction(state, content, rng(), 'run_scam')).toBeNull()
    expect(state.actionPoints).toBe(1)
  })

  it('custo zero não consome ponto', () => {
    const gratis: GameAction = { ...BARATA, id: 'quit_job', cost: 0 }
    const livre = makeContent([], { actions: [gratis] })
    const state = makeState({ actionPoints: 3 })
    performAction(state, livre, rng(), 'quit_job')
    expect(state.actionPoints).toBe(3)
  })
})

describe('disponibilidade', () => {
  it('requisito não atendido deixa a ação visível, porém bloqueada com o motivo', () => {
    const state = makeState()
    state.character.stats.charisma = 10
    const scam = view(state, 'run_scam')
    expect(scam?.enabled).toBe(false)
    expect(scam?.reason).toBe('Requer Carisma 90 ou mais')
  })

  it('condição não atendida some da lista', () => {
    const escondida: GameAction = { ...BARATA, id: 'x', conditions: [{ type: 'age', min: 99 }] }
    const c = makeContent([], { actions: [escondida] })
    expect(availableActions(makeState(), c)).toHaveLength(0)
  })

  it('respeita cooldown e diz quanto falta', () => {
    const state = makeState({ year: 2030, lastActionYear: { run_scam: 2029 } })
    state.character.stats.charisma = 95
    expect(view(state, 'run_scam')?.reason).toBe('Disponível em 2 anos')

    state.year = 2032
    expect(view(state, 'run_scam')?.enabled).toBe(true)
  })

  it('personagem morto não tem ação nenhuma', () => {
    const state = makeState({ character: makeCharacter({ alive: false }) })
    expect(availableActions(state, content)).toEqual([])
  })
})

describe('ações derivadas', () => {
  it('oferece matrícula nos cursos e entrada nas trilhas', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    expect(ids(state)).toContain('enroll:direito')
    expect(ids(state)).toContain('career:clt')
  })

  it('a matrícula herda os requisitos do curso', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    state.character.stats.intelligence = 10
    expect(view(state, 'enroll:direito')?.reason).toBe('Requer Inteligência 60 ou mais')
  })

  it('matricular troca a lista por cursar e largar', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    state.character.stats.intelligence = 80
    performAction(state, content, rng(), 'enroll:direito')

    expect(ids(state)).toContain('study')
    expect(ids(state)).toContain('drop_out')
    expect(ids(state)).not.toContain('enroll:direito')
  })

  it('curso já concluído some da lista', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    state.character.stats.intelligence = 80
    state.character.flags[courseFlag('direito')] = true
    expect(ids(state)).not.toContain('enroll:direito')
  })

  it('entrar numa carreira coloca no nível de entrada e some da lista', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    const note = performAction(state, content, rng(), 'career:clt')
    expect(note?.kind).toBe('note')
    expect(state.character.career).toMatchObject({ trackId: 'clt', level: 0 })
    expect(ids(state)).not.toContain('career:clt')
  })

  it('quem já é qualificado entra acima do primeiro degrau', () => {
    // Um engenheiro de 40 anos recomeçando não volta a ser estagiário.
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    state.character.stats.intelligence = 90
    performAction(state, content, rng(), 'career:clt')
    expect(state.character.career?.level).toBe(1)
  })

  it('entrada bloqueada por idade aparece com o motivo', () => {
    const state = makeState({ character: makeCharacter({ age: 12 }) })
    expect(view(state, 'career:clt')?.reason).toBe('Requer idade 18 anos ou mais')
  })

  it('cursar um ano avança a matrícula', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    state.character.stats.intelligence = 80
    performAction(state, content, rng(), 'enroll:direito')
    performAction(state, content, rng(), 'study')
    expect(state.character.enrollment?.yearsLeft).toBe(1)
  })
})

describe('execução', () => {
  it('aplica os efeitos do outcome e devolve a nota', () => {
    const state = makeState()
    const antes = state.character.stats.health
    const note = performAction(state, content, rng(), 'train')
    expect(note?.kind).toBe('note')
    expect(state.character.stats.health).toBe(antes + 5)
  })

  it('ação inexistente é inócua', () => {
    const state = makeState({ actionPoints: 3 })
    expect(performAction(state, content, rng(), 'nao_existe')).toBeNull()
    expect(state.actionPoints).toBe(3)
  })

  it('não confia na UI: requisito não atendido não executa nem cobra ponto', () => {
    const state = makeState({ actionPoints: 3 })
    state.character.stats.charisma = 10
    expect(performAction(state, content, rng(), 'run_scam')).toBeNull()
    expect(state.actionPoints).toBe(3)
  })

  it('registra o ano para o cooldown valer', () => {
    const state = makeState({ year: 2040, actionPoints: 3 })
    state.character.stats.charisma = 95
    performAction(state, content, rng(), 'run_scam')
    expect(state.lastActionYear['run_scam']).toBe(2040)
  })
})

describe('findAction', () => {
  it('acha tanto ação de conteúdo quanto derivada', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    expect(findAction(state, content, 'train')?.outcomes).not.toBeNull()
    expect(findAction(state, content, 'career:clt')?.outcomes).toBeNull()
    expect(findAction(state, content, 'nada')).toBeUndefined()
  })
})
