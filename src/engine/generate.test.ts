import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { skipPendingEvents } from '../test/fixtures'
import { simulate } from '../test/player'
import { advanceYear } from './turn'
import { createGame } from './generate'
import {
  INITIAL_RELATION,
  PARENT_MIN_AGE_AT_FIRST_CHILD,
  RELATION_ANNUAL_DECAY,
} from './balance'
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
  it('quem é ignorado por décadas some da sua vida afetiva', () => {
    // Na Fase 1 havia um piso, porque o jogador não tinha NENHUMA ação para
    // cuidar de alguém — decair até zero seria punição sem agência. A aba
    // Relações removeu o motivo, então o piso saiu junto.
    const state = newGame(9)
    // Só a família do nascimento: eventos podem trazer amizades novas no meio
    // do caminho, e essas ainda não tiveram tempo de esfriar.
    const originais = new Set(state.relations.map((p) => p.id))

    for (let i = 0; i < 40; i++) {
      if (!state.character.alive) break
      advanceYear(state, GAME_CONTENT)
      skipPendingEvents(state)
    }

    const sobreviventes = state.relations.filter((p) => p.alive && originais.has(p.id))
    expect(sobreviventes.length).toBeGreaterThan(0)

    // Teto do que sobra depois de 40 anos de descaso, partindo do melhor caso
    // possível. Um piso de decaimento faria isto falhar — que é o ponto.
    const teto = INITIAL_RELATION.max - 40 * RELATION_ANNUAL_DECAY
    for (const person of sobreviventes) {
      expect(person.relation, person.name).toBeLessThanOrEqual(Math.max(0, teto))
    }
  })
})

describe('a semente reproduz a vida inteira', () => {
  /** Assinatura do que uma vida produziu, do nascimento a morte. */
  function assinatura(seed: number): string {
    const state = simulate(seed, GAME_CONTENT)
    return JSON.stringify({
      cidade: state.character.city,
      classe: state.character.socialClass,
      idadeMorte: state.character.deathAge,
      causa: state.character.deathCause,
      familia: state.relations.map((p) => `${p.name}/${p.kind}/${p.age}`),
      notas: state.timeline.filter((e) => e.kind === 'note').map((e) => e.text),
    })
  }

  it('a mesma semente da exatamente a mesma vida', () => {
    // A seed sempre esteve no save e nunca foi exibida nem aceita de volta:
    // o engine era deterministico por design e nao havia como usar isso.
    expect(assinatura(424242)).toBe(assinatura(424242))
  })

  it('sementes diferentes dao vidas diferentes', () => {
    expect(assinatura(424242)).not.toBe(assinatura(999))
  })
})
