import { describe, expect, it } from 'vitest'
import {
  validateAchievements,
  validateActions,
  validateAssets,
  validateCareers,
  validateCourses,
  validateEvents,
  validateRelationActions,
  orphanFlags,
} from '../engine/validate'
import { eligibleEvents } from '../engine/events'
import { makeCharacter, makeState } from '../test/fixtures'
import { createGame } from '../engine/generate'
import { GAME_CONTENT } from '.'
import { ALL_EVENTS } from './events'

describe('conteúdo do jogo', () => {
  it('passa na validação estrutural', () => {
    expect(validateEvents(ALL_EVENTS)).toEqual([])
    expect(validateActions(GAME_CONTENT.actions)).toEqual([])
    expect(validateCareers(GAME_CONTENT.careers)).toEqual([])
    expect(validateCourses(GAME_CONTENT.courses)).toEqual([])
    expect(validateAssets(GAME_CONTENT.assets)).toEqual([])
    expect(validateRelationActions(GAME_CONTENT.relationActions)).toEqual([])
    expect(validateAchievements(GAME_CONTENT.achievements)).toEqual([])
  })

  it('toda trilha tem um nível de entrada alcançável cedo', () => {
    for (const track of GAME_CONTENT.careers) {
      const entry = track.levels[0]
      expect(entry, track.id).toBeDefined()
      expect(entry?.minYears, track.id).toBe(0)
    }
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

describe('saúde do conteúdo', () => {
  it('nenhuma flag é escrita sem que alguém a leia', () => {
    // Onze das dezesseis flags eram write-only quando isto foi medido: o
    // Perfil exibia "Ficha suja" e nada no jogo se comportava diferente.
    expect(orphanFlags(GAME_CONTENT)).toEqual([])
  })
})

describe('densidade do sorteio', () => {
  /** Um personagem representativo da idade, para medir o pool disponível. */
  function personaAos(age: number): ReturnType<typeof createGame> {
    const state = createGame({ name: 'T', gender: 'male', seed: 1, birthYear: 2000 }, GAME_CONTENT)
    state.character.age = age
    state.character.education = age >= 23 ? 'bachelor' : age >= 18 ? 'highschool' : 'none'
    state.character.money = 500_000

    if (age >= 24) {
      state.character.career = {
        trackId: 'clt',
        kind: 'clt',
        level: 2,
        yearsInLevel: 3,
        yearsInTrack: 6,
        performance: 60,
      }
    }
    if (age >= 30) {
      state.character.flags['married'] = true
      state.relations.push(
        { id: 'sp', name: 'Ana Silva', kind: 'spouse', gender: 'female', age, relation: 70, alive: true },
        { id: 'ch', name: 'Rui Silva', kind: 'child', gender: 'male', age: Math.max(1, age - 28), relation: 70, alive: true },
      )
    }
    return state
  }

  it('o pool não deixa a vida adulta virar repetição', () => {
    // Uma vida sorteia ~120 eventos. Com um punhado de elegíveis por idade, a
    // vida adulta repetia os mesmos quatro por trinta turnos seguidos.
    for (let age = 20; age <= 80; age += 5) {
      const pool = eligibleEvents(personaAos(age), GAME_CONTENT)
      expect(pool.length, `aos ${age} anos`).toBeGreaterThanOrEqual(22)
    }
  })

  it('a infância e a adolescência têm com o que trabalhar', () => {
    // A infância é curta: são poucos turnos, então um pool menor não vira
    // repetição do jeito que viraria numa vida adulta de trinta anos.
    expect(eligibleEvents(personaAos(5), GAME_CONTENT).length).toBeGreaterThanOrEqual(5)
    expect(eligibleEvents(personaAos(10), GAME_CONTENT).length).toBeGreaterThanOrEqual(8)
    expect(eligibleEvents(personaAos(15), GAME_CONTENT).length).toBeGreaterThanOrEqual(12)
  })
})
