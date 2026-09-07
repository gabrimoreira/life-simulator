import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { createPerson } from './people'
import { createRng } from './rng'
import {
  applyRelationYear,
  findPerson,
  livingRelations,
  performRelationAction,
  relationActionsFor,
  relativeMortalityChance,
  retarget,
} from './relations'
import type { Effect, GameState, Person, RelationAction } from './types'

function person(overrides: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: 'Ana Silva',
    kind: 'mother',
    gender: 'female',
    age: 50,
    relation: 60,
    alive: true,
    flags: {},
    ...overrides,
  }
}

const CONVERSAR: RelationAction = {
  id: 'talk',
  label: 'Conversar',
  hint: 'Custa tempo.',
  cost: 1,
  kinds: ['mother', 'friend'],
  outcomes: [
    {
      chance: 1,
      text: 'foi bom.',
      effects: [{ type: 'relation', target: { by: 'target' }, delta: 10 }],
    },
  ],
}

const PEDIR: RelationAction = {
  id: 'ask_money',
  label: 'Pedir dinheiro',
  hint: 'Cobra na relação.',
  cost: 1,
  cooldown: 3,
  kinds: ['mother'],
  minRelation: 50,
  outcomes: [
    {
      chance: 1,
      text: 'emprestou.',
      effects: [{ type: 'money', delta: 1_000 }],
    },
  ],
}

const CORTAR: RelationAction = {
  id: 'cut_off',
  label: 'Cortar relações',
  hint: 'Sem volta.',
  cost: 0,
  kinds: ['friend'],
  maxRelation: 40,
  outcomes: [
    {
      chance: 1,
      text: 'acabou.',
      effects: [{ type: 'removeRelation', target: { by: 'target' } }],
    },
  ],
}

const content = makeContent([], { relationActions: [CONVERSAR, PEDIR, CORTAR] })
const rng = () => createRng(1)

function withPerson(p: Person, overrides: Partial<GameState> = {}): GameState {
  return makeState({ relations: [p], ...overrides })
}

describe('retarget', () => {
  it('troca {by:target} pelo id de quem recebeu a ação', () => {
    const effects: Effect[] = [
      { type: 'relation', target: { by: 'target' }, delta: 5 },
      { type: 'removeRelation', target: { by: 'target' } },
      { type: 'relationKind', target: { by: 'target' }, kind: 'spouse' },
    ]
    for (const effect of retarget(effects, 'p9')) {
      expect(effect).toMatchObject({ target: { by: 'id', id: 'p9' } })
    }
  })

  it('retargeta TODO efeito com alvo, inclusive os que nasceram depois', () => {
    // `personFlag` entrou na Fase 9 e ficou de fora da lista de tipos que
    // `retarget` enumerava. `{ by: 'target' }` chegava vivo em `findRelation`,
    // que devolve undefined, e o efeito virava no-op silencioso: a flag nunca
    // era escrita e nenhum teste reclamava. Hoje a checagem é estrutural.
    const comAlvo: Effect[] = [
      { type: 'personFlag', target: { by: 'target' }, flag: 'helped_me', value: true },
    ]
    expect(retarget(comAlvo, 'p9')[0]).toMatchObject({ target: { by: 'id', id: 'p9' } })
  })

  it('não mexe em ref por tipo nem em efeito sem alvo', () => {
    const effects: Effect[] = [
      { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 5 },
      { type: 'money', delta: 10 },
    ]
    expect(retarget(effects, 'p9')).toEqual(effects)
  })
})

describe('mortalidade de quem está em volta', () => {
  it('cresce com a idade', () => {
    expect(relativeMortalityChance(90)).toBeGreaterThan(relativeMortalityChance(40))
  })

  it('envelhece todo mundo um ano', () => {
    const state = withPerson(person({ age: 30 }))
    applyRelationYear(state, rng())
    expect(state.relations[0]?.age).toBe(31)
  })

  it('quem morre sai da lista de vivos e cobra felicidade', () => {
    const state = withPerson(person({ age: 108, relation: 100 }))
    const antes = state.character.stats.happiness
    const notes = applyRelationYear(state, createRng(2))

    expect(state.relations[0]?.alive).toBe(false)
    expect(livingRelations(state)).toHaveLength(0)
    expect(state.character.stats.happiness).toBeLessThan(antes)
    expect(notes).toHaveLength(1)
  })

  it('a dor é proporcional ao quanto a relação valia', () => {
    const proximo = withPerson(person({ age: 108, relation: 100 }))
    const distante = withPerson(person({ age: 108, relation: 0 }))
    const base = proximo.character.stats.happiness

    applyRelationYear(proximo, createRng(2))
    applyRelationYear(distante, createRng(2))

    expect(base - proximo.character.stats.happiness).toBeGreaterThan(
      base - distante.character.stats.happiness,
    )
  })

  it('não mata duas vezes', () => {
    const state = withPerson(person({ age: 108, alive: false }))
    expect(applyRelationYear(state, createRng(2))).toEqual([])
  })
})

describe('ações dirigidas a alguém', () => {
  it('só mostra o que se aplica àquele tipo de relação', () => {
    const mae = withPerson(person({ kind: 'mother' }))
    const p = mae.relations[0]
    if (!p) throw new Error('sem pessoa')
    expect(relationActionsFor(mae, content, p).map((a) => a.id)).toEqual(['talk', 'ask_money'])
  })

  it('bloqueia por relação baixa com o próprio alvo', () => {
    const state = withPerson(person({ relation: 10 }))
    const p = state.relations[0]
    if (!p) throw new Error('sem pessoa')
    const pedir = relationActionsFor(state, content, p).find((a) => a.id === 'ask_money')
    expect(pedir?.enabled).toBe(false)
    expect(pedir?.reason).toBe('Requer relação 50 ou mais')
  })

  it('bloqueia por relação alta demais quando a ação exige o contrário', () => {
    const state = withPerson(person({ kind: 'friend', relation: 90 }))
    const p = state.relations[0]
    if (!p) throw new Error('sem pessoa')
    const cortar = relationActionsFor(state, content, p).find((a) => a.id === 'cut_off')
    expect(cortar?.reason).toBe('Só quando a relação estiver 40 ou menos')
  })

  it('aplica o efeito na pessoa certa quando há duas do mesmo tipo', () => {
    // É por isto que minRelation existe em vez de uma Condition por tipo:
    // a condição responderia pela primeira pessoa, não pela escolhida.
    const state = makeState({
      relations: [
        person({ id: 'a', name: 'Ana Silva', relation: 60 }),
        person({ id: 'b', name: 'Bia Silva', relation: 60 }),
      ],
    })
    performRelationAction(state, content, rng(), 'b', 'talk')
    expect(findPerson(state, 'a')?.relation).toBe(60)
    expect(findPerson(state, 'b')?.relation).toBe(70)
  })

  it('desconta o ponto de ação', () => {
    const state = withPerson(person(), { actionPoints: 2 })
    performRelationAction(state, content, rng(), 'p1', 'talk')
    expect(state.actionPoints).toBe(1)
  })

  it('sem ponto de ação, não executa nem cobra', () => {
    const state = withPerson(person(), { actionPoints: 0 })
    expect(performRelationAction(state, content, rng(), 'p1', 'talk')).toBeNull()
    expect(findPerson(state, 'p1')?.relation).toBe(60)
  })

  it('respeita cooldown por pessoa, não global', () => {
    const state = makeState({
      year: 2030,
      relations: [person({ id: 'a' }), person({ id: 'b' })],
    })
    performRelationAction(state, content, rng(), 'a', 'ask_money')

    const a = findPerson(state, 'a')
    const b = findPerson(state, 'b')
    if (!a || !b) throw new Error('sem pessoas')

    expect(relationActionsFor(state, content, a).find((x) => x.id === 'ask_money')?.enabled).toBe(
      false,
    )
    expect(relationActionsFor(state, content, b).find((x) => x.id === 'ask_money')?.enabled).toBe(
      true,
    )
  })

  it('não age sobre quem já morreu', () => {
    const state = withPerson(person({ alive: false }))
    expect(performRelationAction(state, content, rng(), 'p1', 'talk')).toBeNull()
  })

  it('não confia na UI: requisito de relação é revalidado', () => {
    const state = withPerson(person({ relation: 10 }), { actionPoints: 3 })
    expect(performRelationAction(state, content, rng(), 'p1', 'ask_money')).toBeNull()
    expect(state.actionPoints).toBe(3)
  })

  it('a nota da timeline diz de quem se trata', () => {
    const state = withPerson(person({ name: 'Ana Silva' }))
    const note = performRelationAction(state, content, rng(), 'p1', 'talk')
    expect(note?.kind).toBe('note')
    if (note?.kind === 'note') expect(note.text).toContain('Ana')
  })
})

describe('nome de quem chega na família', () => {
  it('filho carrega o sobrenome de quem o teve', () => {
    const state = makeState({ character: makeCharacter({ name: 'Heitor Prado' }) })
    const child = createPerson('child', state, createRng(3), makeContent())
    expect(child.name.endsWith(' Prado')).toBe(true)
  })

  it('amigo e parceiro têm sobrenome próprio', () => {
    const state = makeState({ character: makeCharacter({ name: 'Heitor Prado' }) })
    const friend = createPerson('friend', state, createRng(3), makeContent())
    expect(friend.name.endsWith(' Prado')).toBe(false)
  })

  it('personagem sem sobrenome não gera filho com nome pela metade', () => {
    const state = makeState({ character: makeCharacter({ name: 'Anônimo' }) })
    const child = createPerson('child', state, createRng(3), makeContent())
    expect(child.name.split(' ').length).toBeGreaterThan(1)
  })
})

describe('viuvez', () => {
  it('a morte do cônjuge desfaz o casamento', () => {
    // A flag ficava presa em true para sempre, e `look_for_love` — que exige
    // `married: false` — trancava o viúvo fora de qualquer relação nova.
    const state = withPerson(person({ kind: 'spouse', age: 108 }))
    state.character.flags['married'] = true

    applyRelationYear(state, createRng(2))

    expect(state.relations[0]?.alive).toBe(false)
    expect(state.character.flags['married']).toBe(false)
  })

  it('a morte de outro parente não mexe no estado civil', () => {
    const state = withPerson(person({ kind: 'mother', age: 108 }))
    state.character.flags['married'] = true
    applyRelationYear(state, createRng(2))
    expect(state.character.flags['married']).toBe(true)
  })
})

describe('amizade que acaba por abandono', () => {
  function comAmigo(relation: number): GameState {
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    state.relations.push({
      id: 'f1',
      name: 'Bruno Alves',
      kind: 'friend',
      gender: 'male',
      age: 40,
      relation,
      alive: true,
      flags: {},
    })
    return state
  }

  it('amigo com relacao zerada sai da lista, com nota', () => {
    // Sumir em silencio esconderia a consequencia de onde o jogador gastou os
    // pontos de acao, que e justamente a decisao que os pontos existem para
    // forcar.
    const state = comAmigo(0)
    const notes = applyRelationYear(state, createRng(1))

    expect(state.relations).toHaveLength(0)
    const texto = notes.map((n) => (n.kind === 'note' ? n.text : '')).join(' ')
    expect(texto).toContain('pararam de se falar')
  })

  it('amigo com qualquer relacao restante fica', () => {
    const state = comAmigo(1)
    applyRelationYear(state, createRng(1))
    expect(state.relations).toHaveLength(1)
  })

  it('familia zerada NAO sai: ninguem deixa de ser irmao por nao se falar', () => {
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    state.relations.push({
      id: 'm',
      name: 'Marta Alves',
      kind: 'mother',
      gender: 'female',
      age: 70,
      relation: 0,
      alive: true,
      flags: {},
    })
    applyRelationYear(state, createRng(1))
    expect(state.relations).toHaveLength(1)
  })

  it('nao mexe em quem ja morreu', () => {
    const state = comAmigo(0)
    state.relations[0]!.alive = false
    applyRelationYear(state, createRng(1))
    expect(state.relations).toHaveLength(1)
  })
})

describe('personFlags gateia a ação pelo ALVO', () => {
  const cobrar: RelationAction = {
    id: 'cobrar',
    label: 'Cobrar',
    hint: 'x',
    cost: 1,
    kinds: ['friend'],
    personFlags: { owes_me: true },
    outcomes: [{ chance: 1, text: 'pagou.', effects: [] }],
  }

  function comDoisAmigos(): GameState {
    const state = makeState()
    state.relations.push(
      person({ id: 'a', kind: 'friend', flags: { owes_me: true } }),
      person({ id: 'b', kind: 'friend', flags: {} }),
    )
    return state
  }

  it('aparece só em quem carrega a flag, e some da lista dos outros', () => {
    // Este é o ponto inteiro de `Person.flags`: `personFlag` como Condition
    // responde por TIPO — "algum amigo me deve" —, e responderia sim nos dois.
    // Aqui a pergunta é sobre a pessoa que está na tela.
    const state = comDoisAmigos()
    const content = makeContent([], { relationActions: [cobrar] })
    const [devedor, quitado] = state.relations
    if (!devedor || !quitado) throw new Error('fixture')

    expect(relationActionsFor(state, content, devedor)[0]?.enabled).toBe(true)
    // Filtrada, não desabilitada: cobrar quem nunca pegou dinheiro emprestado
    // não é uma ação bloqueada que dá para destravar.
    expect(relationActionsFor(state, content, quitado)).toEqual([])
  })

  it('a flag some e a ação some junto', () => {
    const state = comDoisAmigos()
    const content = makeContent([], { relationActions: [cobrar] })
    const devedor = state.relations[0]
    if (!devedor) throw new Error('fixture')
    devedor.flags['owes_me'] = false
    expect(relationActionsFor(state, content, devedor)).toEqual([])
  })
})
