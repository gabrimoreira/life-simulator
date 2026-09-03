import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { AGE_ELEMENTARY_DONE, AGE_HIGHSCHOOL_DONE } from './balance'
import { applySchooling, dropOut, enroll, studyYear } from './education'
import { createRng } from './rng'
import { courseFlag } from './types'
import type { Course, GameState } from './types'

const PAGA: Course = {
  id: 'direito',
  name: 'Direito',
  grants: 'bachelor',
  years: 3,
  annualCost: 20_000,
  requirements: [{ type: 'stat', stat: 'intelligence', min: 50 }],
  completionEffects: [{ type: 'stat', stat: 'charisma', op: 'delta', value: 8 }],
}

const GRATIS: Course = {
  id: 'licenciatura',
  name: 'Licenciatura',
  grants: 'bachelor',
  years: 2,
  annualCost: 0,
  requirements: [],
  completionEffects: [],
}

const content = makeContent([], { courses: [PAGA, GRATIS] })
const rng = () => createRng(1)

/** Cursa até formar ou desistir, devolvendo quantos anos levou. */
function studyToCompletion(state: GameState, max = 20): number {
  let years = 0
  while (state.character.enrollment !== null && years < max) {
    studyYear(state, content, rng())
    years++
  }
  return years
}

describe('escolaridade automática', () => {
  it('conclui o Fundamental na idade certa', () => {
    const state = makeState({
      character: makeCharacter({ age: AGE_ELEMENTARY_DONE, education: 'none' }),
    })
    expect(applySchooling(state)?.kind).toBe('note')
    expect(state.character.education).toBe('elementary')
  })

  it('conclui o Médio quando a inteligência dá', () => {
    const state = makeState({
      character: makeCharacter({ age: AGE_HIGHSCHOOL_DONE, education: 'elementary' }),
    })
    state.character.stats.intelligence = 70
    applySchooling(state)
    expect(state.character.education).toBe('highschool')
  })

  it('trava no Fundamental quando a inteligência não dá', () => {
    const state = makeState({
      character: makeCharacter({ age: AGE_HIGHSCHOOL_DONE, education: 'elementary' }),
    })
    state.character.stats.intelligence = 10
    const note = applySchooling(state)
    expect(state.character.education).toBe('elementary')
    expect(note?.kind).toBe('note')
  })

  it('não faz nada fora das idades de virada', () => {
    const state = makeState({ character: makeCharacter({ age: 25, education: 'highschool' }) })
    expect(applySchooling(state)).toBeNull()
  })
})

describe('matrícula', () => {
  it('registra curso, prazo e custo', () => {
    const state = makeState()
    expect(enroll(state, content, 'direito')).toBe(true)
    expect(state.character.enrollment).toMatchObject({
      courseId: 'direito',
      yearsLeft: 3,
      annualCost: 20_000,
    })
  })

  it('recusa quem já está matriculado em outra coisa', () => {
    const state = makeState()
    enroll(state, content, 'direito')
    expect(enroll(state, content, 'licenciatura')).toBe(false)
    expect(state.character.enrollment?.courseId).toBe('direito')
  })

  it('recusa curso inexistente', () => {
    expect(enroll(makeState(), content, 'astrologia')).toBe(false)
  })

  it('entra financiado quem não tem o dinheiro do primeiro ano', () => {
    const pobre = makeState({ character: makeCharacter({ money: 500 }) })
    enroll(pobre, content, 'direito')
    expect(pobre.character.enrollment?.financed).toBe(true)

    const rico = makeState({ character: makeCharacter({ money: 500_000 }) })
    enroll(rico, content, 'direito')
    expect(rico.character.enrollment?.financed).toBe(false)
  })
})

describe('cursar', () => {
  it('forma no prazo e concede nível, flag e efeitos', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    const charismaAntes = state.character.stats.charisma
    enroll(state, content, 'direito')

    expect(studyToCompletion(state)).toBe(3)
    expect(state.character.education).toBe('bachelor')
    expect(state.character.flags[courseFlag('direito')]).toBe(true)
    expect(state.character.stats.charisma).toBe(charismaAntes + 8)
    expect(state.character.enrollment).toBeNull()
  })

  it('quem paga à vista perde saldo; quem financia acumula dívida', () => {
    const rico = makeState({ character: makeCharacter({ money: 500_000, debt: 0 }) })
    enroll(rico, content, 'direito')
    studyYear(rico, content, rng())
    expect(rico.character.money).toBe(480_000)
    expect(rico.character.debt).toBe(0)

    const pobre = makeState({ character: makeCharacter({ money: 0, debt: 0 }) })
    enroll(pobre, content, 'direito')
    studyYear(pobre, content, rng())
    expect(pobre.character.debt).toBe(20_000)
  })

  it('curso público não cobra nada', () => {
    const state = makeState({ character: makeCharacter({ money: 1_000, debt: 0 }) })
    enroll(state, content, 'licenciatura')
    studyToCompletion(state)
    expect(state.character.money).toBe(1_000)
    expect(state.character.debt).toBe(0)
    expect(state.character.education).toBe('bachelor')
  })

  it('pular um ano não reprova — só não forma', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    enroll(state, content, 'direito')
    studyYear(state, content, rng())
    // Três anos passam sem estudar: o curso continua exatamente onde parou.
    expect(state.character.enrollment?.yearsLeft).toBe(2)
    expect(state.character.education).toBe('highschool')
  })

  it('estudar sem matrícula é inócuo', () => {
    const state = makeState()
    expect(studyYear(state, content, rng())).toBeNull()
  })

  it('largar o curso descarta o progresso', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    enroll(state, content, 'direito')
    studyYear(state, content, rng())
    expect(dropOut(state)).toBe(true)
    expect(state.character.enrollment).toBeNull()
    expect(state.character.education).toBe('highschool')
    expect(dropOut(state)).toBe(false)
  })

  it('quem está no fundo do poço acaba largando sozinho', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    state.character.stats.happiness = 0
    enroll(state, content, 'direito')

    const shared = createRng(7)
    let dropped = false
    for (let i = 0; i < 60 && !dropped; i++) {
      if (!state.character.enrollment) break
      state.character.stats.happiness = 0
      studyYear(state, content, shared)
      dropped = state.character.enrollment === null && state.character.education !== 'bachelor'
    }
    expect(dropped).toBe(true)
  })
})
