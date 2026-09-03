import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeEvent, makeState } from '../test/fixtures'
import { availableActions } from './actions'
import { PRISON_HAPPINESS_COST, PRISON_HEALTH_COST } from './balance'
import { hireInto } from './careers'
import { eligibleEvents } from './events'
import { applyPrisonYear, isInPrison, jail, mentionsPrison, release } from './prison'
import { advanceYear } from './turn'
import type { CareerTrack, GameAction, GameState } from './types'

const TRILHA: CareerTrack = {
  id: 'clt',
  name: 'Corporativo',
  kind: 'clt',
  entryLabel: 'Procurar emprego',
  entryHint: 'Previsível.',
  levels: [{ title: 'Analista', salary: 40_000, minYears: 0, requirements: [] }],
}

const LIVRE: GameAction = {
  id: 'train',
  group: 'health',
  label: 'Treinar',
  hint: 'Exercício.',
  cost: 1,
  conditions: [],
  outcomes: [{ chance: 1, text: 'ok', effects: [] }],
}

const NA_CADEIA: GameAction = {
  id: 'prison_lay_low',
  group: 'crime',
  label: 'Manter a cabeça baixa',
  hint: 'Não chamar atenção.',
  cost: 1,
  conditions: [{ type: 'inPrison', value: true }],
  outcomes: [{ chance: 1, text: 'ok', effects: [] }],
}

const content = makeContent(
  [
    makeEvent({ id: 'la_fora', conditions: [] }),
    makeEvent({ id: 'la_dentro', conditions: [{ type: 'inPrison', value: true }] }),
  ],
  { actions: [LIVRE, NA_CADEIA], careers: [TRILHA] },
)

const preso = (years = 3): GameState => {
  const state = makeState({ character: makeCharacter({ age: 30 }) })
  jail(state, content, years, 'roubo')
  return state
}

describe('mentionsPrison', () => {
  it('acha a menção em qualquer profundidade', () => {
    expect(mentionsPrison([{ type: 'inPrison', value: true }])).toBe(true)
    expect(mentionsPrison([{ type: 'not', condition: { type: 'inPrison', value: true } }])).toBe(
      true,
    )
    expect(
      mentionsPrison([
        { type: 'anyOf', conditions: [{ type: 'age', min: 1 }, { type: 'inPrison', value: false }] },
      ]),
    ).toBe(true)
    expect(mentionsPrison([{ type: 'age', min: 18 }])).toBe(false)
    expect(mentionsPrison([])).toBe(false)
  })
})

describe('ser preso', () => {
  it('grava pena, motivo e ficha suja', () => {
    const state = preso(5)
    expect(state.character.prison).toMatchObject({ yearsLeft: 5, reason: 'roubo', yearsServed: 0 })
    expect(state.character.flags['criminal_record']).toBe(true)
    expect(isInPrison(state)).toBe(true)
  })

  it('acaba com a carreira e a matrícula', () => {
    const state = makeState({ character: makeCharacter({ age: 30 }) })
    hireInto(state, TRILHA)
    state.character.enrollment = {
      courseId: 'x',
      targetLevel: 'bachelor',
      yearsLeft: 3,
      annualCost: 0,
      financed: false,
    }

    jail(state, content, 4, 'fraude')
    expect(state.character.career).toBeNull()
    expect(state.character.enrollment).toBeNull()
  })

  it('custa reputação', () => {
    const antes = makeState({ character: makeCharacter({ age: 30 }) }).character.stats.reputation
    expect(preso().character.stats.reputation).toBeLessThan(antes)
  })

  it('uma segunda condenação soma à pena em vez de virar no-op', () => {
    // O evento de briga na cadeia dizia "sua pena aumentou" e não aumentava
    // nada, porque o efeito desistia ao ver alguém já preso.
    const state = preso(3)
    const note = jail(state, content, 4, 'lesão corporal')

    expect(state.character.prison?.yearsLeft).toBe(7)
    expect(state.character.prison?.reason).toBe('roubo')
    if (note.kind === 'note') expect(note.text).toContain('aumentou')
  })
})

describe('o ano lá dentro', () => {
  it('cobra saúde, felicidade e distância de quem está fora', () => {
    const state = preso(3)
    state.relations = [
      { id: 'm', name: 'Ana', kind: 'mother', gender: 'female', age: 55, relation: 80, alive: true },
    ]
    const saude = state.character.stats.health
    const humor = state.character.stats.happiness

    applyPrisonYear(state)

    expect(state.character.stats.health).toBe(saude - PRISON_HEALTH_COST)
    expect(state.character.stats.happiness).toBe(humor - PRISON_HAPPINESS_COST)
    expect(state.relations[0]?.relation).toBeLessThan(80)
  })

  it('conta os anos e solta no fim da pena', () => {
    const state = preso(2)
    expect(applyPrisonYear(state)).toEqual([])
    expect(state.character.prison?.yearsServed).toBe(1)

    const notes = applyPrisonYear(state)
    expect(state.character.prison).toBeNull()
    expect(notes).toHaveLength(1)
  })

  it('soltar quem já está solto é inócuo', () => {
    expect(release(makeState())).toBeNull()
  })

  it('quem está preso não tem renda nem custo de vida', () => {
    const state = preso(5)
    state.character.money = 100_000
    advanceYear(state, content)
    expect(state.character.money).toBe(100_000)
  })
})

describe('o sub-loop', () => {
  it('a vida lá fora some do sorteio de eventos', () => {
    expect(eligibleEvents(makeState(), content).map((e) => e.id)).toEqual(['la_fora'])
    expect(eligibleEvents(preso(), content).map((e) => e.id)).toEqual(['la_dentro'])
  })

  it('e da lista de ações', () => {
    expect(availableActions(makeState(), content).map((a) => a.id)).toContain('train')
    expect(availableActions(makeState(), content).map((a) => a.id)).not.toContain('prison_lay_low')

    const dentro = availableActions(preso(), content).map((a) => a.id)
    expect(dentro).toContain('prison_lay_low')
    expect(dentro).not.toContain('train')
  })

  it('matricular-se e arrumar emprego somem lá dentro', () => {
    const dentro = availableActions(preso(), content).map((a) => a.id)
    expect(dentro.some((id) => id.startsWith('career:'))).toBe(false)
    expect(dentro.some((id) => id.startsWith('enroll:'))).toBe(false)
  })
})
