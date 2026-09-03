import { describe, expect, it } from 'vitest'
import { validateEvents } from '../engine/validate'
import { eligibleEvents } from '../engine/events'
import { makeCharacter, makeState } from '../test/fixtures'
import { GAME_CONTENT } from '.'
import { ALL_EVENTS } from './events'

describe('conteúdo do jogo', () => {
  it('passa na validação estrutural', () => {
    expect(validateEvents(ALL_EVENTS)).toEqual([])
  })

  it('tem eventos elegíveis em toda idade jogável', () => {
    // Um ano sem nenhum evento possível é aceitável; uma faixa inteira vazia
    // significa que a vida adulta virou silêncio.
    for (let age = 0; age <= 100; age += 5) {
      const state = makeState({ character: makeCharacter({ age, education: 'highschool' }) })
      const pool = eligibleEvents(state, GAME_CONTENT)
      if (age >= 5 && age <= 90) {
        expect(pool.length, `nenhum evento elegível aos ${age} anos`).toBeGreaterThan(0)
      }
    }
  })

  it('não tem nomes nem cidades duplicados', () => {
    expect(new Set(GAME_CONTENT.maleNames).size).toBe(GAME_CONTENT.maleNames.length)
    expect(new Set(GAME_CONTENT.femaleNames).size).toBe(GAME_CONTENT.femaleNames.length)
    expect(new Set(GAME_CONTENT.surnames).size).toBe(GAME_CONTENT.surnames.length)
  })
})

describe('validateEvents', () => {
  it('pega chances que não somam 1', () => {
    const problems = validateEvents([
      {
        id: 'quebrado',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'x',
        options: [
          {
            text: 'a',
            outcomes: [
              { chance: 0.5, text: 'a', effects: [] },
              { chance: 0.2, text: 'b', effects: [] },
            ],
          },
          { text: 'b', outcomes: [{ chance: 1, text: 'c', effects: [] }] },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('somam'))).toBe(true)
  })

  it('pega id duplicado', () => {
    const event = {
      id: 'dup',
      category: 'random' as const,
      weight: 1,
      conditions: [],
      text: 'x',
      options: [
        { text: 'a', outcomes: [{ chance: 1, text: 'a', effects: [] }] },
        { text: 'b', outcomes: [{ chance: 1, text: 'b', effects: [] }] },
      ],
    }
    expect(validateEvents([event, event]).some((p) => p.includes('duplicado'))).toBe(true)
  })

  it('pega token de interpolação desconhecido', () => {
    const problems = validateEvents([
      {
        id: 'token',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'Olá {nomeErrado}',
        options: [
          { text: 'a', outcomes: [{ chance: 1, text: 'a', effects: [] }] },
          { text: 'b', outcomes: [{ chance: 1, text: 'b', effects: [] }] },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('token desconhecido'))).toBe(true)
  })

  it('pega evento em que todas as opções têm requisito', () => {
    const problems = validateEvents([
      {
        id: 'travado',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'x',
        options: [
          {
            text: 'a',
            requirements: [{ type: 'money', min: 1 }],
            outcomes: [{ chance: 1, text: 'a', effects: [] }],
          },
          {
            text: 'b',
            requirements: [{ type: 'money', min: 2 }],
            outcomes: [{ chance: 1, text: 'b', effects: [] }],
          },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('travar'))).toBe(true)
  })
})
