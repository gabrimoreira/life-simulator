import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { addMoney, applyEffect, applyEffects, clampStat } from './effects'
import { createRng } from './rng'
import type { GameState } from './types'

const rng = () => createRng(1)
const content = makeContent()

describe('clampStat', () => {
  it('prende em 0 e 100 e arredonda', () => {
    expect(clampStat(-30)).toBe(0)
    expect(clampStat(140)).toBe(100)
    expect(clampStat(49.6)).toBe(50)
  })
})

describe('efeito stat', () => {
  it('delta soma e set substitui', () => {
    const state = makeState()
    applyEffect({ type: 'stat', stat: 'health', op: 'delta', value: 10 }, state, rng(), content)
    expect(state.character.stats.health).toBe(60)

    applyEffect({ type: 'stat', stat: 'health', op: 'set', value: 5 }, state, rng(), content)
    expect(state.character.stats.health).toBe(5)
  })

  it('não passa do teto nem do piso', () => {
    const state = makeState()
    applyEffect({ type: 'stat', stat: 'health', op: 'delta', value: 999 }, state, rng(), content)
    expect(state.character.stats.health).toBe(100)

    applyEffect({ type: 'stat', stat: 'health', op: 'delta', value: -999 }, state, rng(), content)
    expect(state.character.stats.health).toBe(0)
  })

  it('não gera linha na timeline quando o delta efetivo é zero', () => {
    const state = makeState()
    state.character.stats.health = 100
    const log = applyEffect(
      { type: 'stat', stat: 'health', op: 'delta', value: 10 },
      state,
      rng(),
      content,
    )
    expect(log).toBeNull()
  })
})

describe('dinheiro e dívida', () => {
  it('gasto maior que o saldo vira dívida, e o saldo para em zero', () => {
    const character = makeCharacter({ money: 1000, debt: 0 })
    addMoney(character, -2500)
    expect(character.money).toBe(0)
    expect(character.debt).toBe(1500)
  })

  it('entrada de dinheiro abate a dívida antes de virar saldo', () => {
    const character = makeCharacter({ money: 0, debt: 1000 })
    addMoney(character, 1500)
    expect(character.debt).toBe(0)
    expect(character.money).toBe(500)
  })

  it('entrada menor que a dívida só abate parte dela', () => {
    const character = makeCharacter({ money: 0, debt: 1000 })
    addMoney(character, 400)
    expect(character.debt).toBe(600)
    expect(character.money).toBe(0)
  })

  it('efeito debt nunca deixa a dívida negativa', () => {
    const state = makeState({ character: makeCharacter({ debt: 500 }) })
    applyEffect({ type: 'debt', delta: -900 }, state, rng(), content)
    expect(state.character.debt).toBe(0)
  })
})

describe('relações', () => {
  it('relation ajusta a pessoa certa e respeita 0..100', () => {
    const state = makeState({
      relations: [
        { id: 'm', name: 'Ana Silva', kind: 'mother', gender: 'female', age: 45, relation: 95, alive: true, flags: {} },
      ],
    })
    applyEffect(
      { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 20 },
      state,
      rng(),
      content,
    )
    expect(state.relations[0]?.relation).toBe(100)
  })

  it('relation em alguém que não existe é inócuo', () => {
    const state = makeState()
    const log = applyEffect(
      { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 10 },
      state,
      rng(),
      content,
    )
    expect(log).toBeNull()
    expect(state.relations).toHaveLength(0)
  })

  it('addRelation e removeRelation entram e saem da lista', () => {
    const state = makeState()
    applyEffect({ type: 'addRelation', kind: 'friend' }, state, rng(), content)
    expect(state.relations).toHaveLength(1)

    applyEffect(
      { type: 'removeRelation', target: { by: 'kind', kind: 'friend' } },
      state,
      rng(),
      content,
    )
    expect(state.relations).toHaveLength(0)
  })
})

describe('efeito death', () => {
  it('mata e registra causa e idade', () => {
    const state = makeState({ character: makeCharacter({ age: 33 }) })
    applyEffect({ type: 'death', cause: 'atropelamento' }, state, rng(), content)
    expect(state.character.alive).toBe(false)
    expect(state.character.deathCause).toBe('atropelamento')
    expect(state.character.deathAge).toBe(33)
  })
})

describe('applyEffects', () => {
  it('aplica em ordem e devolve só o que vira linha da timeline', () => {
    const state = makeState()
    const logs = applyEffects(
      [
        { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
        { type: 'flag', flag: 'formado', value: true },
        { type: 'money', delta: 1000 },
      ],
      state,
      rng(),
      content,
    )
    // A flag muda o estado mas não polui a timeline.
    expect(logs).toHaveLength(2)
    expect(state.character.flags['formado']).toBe(true)
    expect(state.character.money).toBe(11_000)
  })
})

describe('personFlag', () => {
  function comMae(flags: Record<string, boolean> = {}): GameState {
    return makeState({
      relations: [
        { id: 'm', name: 'Ana Silva', kind: 'mother', gender: 'female', age: 60, relation: 70, alive: true, flags },
      ],
    })
  }

  it('escreve na pessoa apontada e não no personagem', () => {
    const state = comMae()
    applyEffect(
      { type: 'personFlag', target: { by: 'kind', kind: 'mother' }, flag: 'helped_me', value: true },
      state,
      rng(),
      content,
    )
    expect(state.relations[0]?.flags['helped_me']).toBe(true)
    // Os dois namespaces não se misturam: `character.flags` continua vazio.
    expect(state.character.flags['helped_me']).toBeUndefined()
  })

  it('apagar é escrever false, e a flag some da condição', () => {
    const state = comMae({ helped_me: true })
    applyEffect(
      { type: 'personFlag', target: { by: 'kind', kind: 'mother' }, flag: 'helped_me', value: false },
      state,
      rng(),
      content,
    )
    expect(state.relations[0]?.flags['helped_me']).toBe(false)
  })

  it('não vai para a timeline', () => {
    // Como as flags do personagem: é estado interno. O que o jogador vê é o
    // evento que a escreveu, e depois o que ela abre.
    const state = comMae()
    const log = applyEffect(
      { type: 'personFlag', target: { by: 'kind', kind: 'mother' }, flag: 'helped_me', value: true },
      state,
      rng(),
      content,
    )
    expect(log).toBeNull()
  })

  it('apontar para quem não existe é inócuo', () => {
    const state = makeState()
    expect(
      applyEffect(
        { type: 'personFlag', target: { by: 'kind', kind: 'spouse' }, flag: 'helped_me', value: true },
        state,
        rng(),
        content,
      ),
    ).toBeNull()
  })
})
