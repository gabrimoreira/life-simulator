import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { advanceYear } from './turn'
import { createGame } from './generate'
import { PARENT_MIN_AGE_AT_FIRST_CHILD, RELATION_DECAY_FLOOR } from './balance'
import { STAT_KEYS } from './types'

const newGame = (seed: number, name = 'Cecília'): ReturnType<typeof createGame> =>
  createGame({ name, gender: 'female', seed, birthYear: 2000 }, GAME_CONTENT)

describe('createGame', () => {
  it('é determinístico para a mesma seed', () => {
    expect(JSON.stringify(newGame(77))).toBe(JSON.stringify(newGame(77)))
  })

  it('gera stats dentro de 0..100', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { character } = newGame(seed)
      for (const key of STAT_KEYS) {
        expect(character.stats[key]).toBeGreaterThanOrEqual(0)
        expect(character.stats[key]).toBeLessThanOrEqual(100)
      }
    }
  })

  it('sempre nasce com mãe e pai', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const kinds = newGame(seed).relations.map((r) => r.kind)
      expect(kinds).toContain('mother')
      expect(kinds).toContain('father')
    }
  })

  it('a família compartilha sobrenome', () => {
    const state = newGame(5)
    const surnames = new Set(state.relations.map((r) => r.name.split(' ').slice(1).join(' ')))
    expect(surnames.size).toBe(1)
  })

  it('ninguém da família repete o primeiro nome — nem o do personagem', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const state = newGame(seed)
      const first = [
        state.character.name.split(' ')[0],
        ...state.relations.map((r) => r.name.split(' ')[0]),
      ]
      expect(new Set(first).size, `seed ${seed}: ${first.join(', ')}`).toBe(first.length)
    }
  })

  it('irmãos que já existem no nascimento são mais velhos que o personagem', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const state = newGame(seed)
      for (const sibling of state.relations.filter((r) => r.kind === 'sibling')) {
        expect(sibling.age, `seed ${seed}`).toBeGreaterThan(0)
      }
    }
  })

  it('pais têm idade plausível para o filho mais velho', () => {
    // Não basta ser "mais velho": uma mãe de 19 com uma filha de 12 teria
    // parido aos 7, e o jogador vê as duas linhas juntas na aba Relações.
    for (let seed = 1; seed <= 200; seed++) {
      const state = newGame(seed)
      const parents = state.relations.filter((r) => r.kind === 'mother' || r.kind === 'father')
      const oldestSibling = Math.max(
        0,
        ...state.relations.filter((r) => r.kind === 'sibling').map((s) => s.age),
      )
      for (const parent of parents) {
        expect(
          parent.age - oldestSibling,
          `seed ${seed}: pai de ${parent.age} com irmão de ${oldestSibling}`,
        ).toBeGreaterThanOrEqual(PARENT_MIN_AGE_AT_FIRST_CHILD)
      }
    }
  })

  it('cada pessoa tem id único', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const ids = newGame(seed).relations.map((r) => r.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('usa o nome informado e apara espaços', () => {
    expect(newGame(1, '  Joana  ').character.name).toBe('Joana')
  })

  it('cai num nome padrão quando vem vazio', () => {
    expect(newGame(1, '   ').character.name).toBe('Anônimo')
  })
})

describe('decaimento de relação', () => {
  it('não zera relações — na Fase 1 não há como cuidar de ninguém', () => {
    const state = newGame(9)
    for (let i = 0; i < 60; i++) {
      if (!state.character.alive) break
      advanceYear(state, GAME_CONTENT)
      // Ignora os eventos: aqui interessa só o decaimento automático.
      state.pendingEventIds = []
    }
    for (const person of state.relations) {
      expect(person.relation).toBeGreaterThanOrEqual(RELATION_DECAY_FLOOR)
    }
  })
})
