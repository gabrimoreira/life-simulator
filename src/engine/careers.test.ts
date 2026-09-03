import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import {
  applyCareerYear,
  careerTitle,
  currentLevel,
  hireInto,
  leaveCareer,
  entryLevel,
  performanceBaseline,
  promotionReady,
} from './careers'
import { applyEffect } from './effects'
import { createRng } from './rng'
import type { CareerTrack, GameState } from './types'

const TRACK: CareerTrack = {
  id: 'clt',
  name: 'Corporativo',
  kind: 'clt',
  entryLabel: 'Procurar emprego',
  entryHint: 'Renda previsível.',
  levels: [
    { title: 'Júnior', salary: 40_000, minYears: 0, requirements: [] },
    {
      title: 'Pleno',
      salary: 80_000,
      minYears: 2,
      requirements: [{ type: 'stat', stat: 'intelligence', min: 60 }],
    },
    { title: 'Sênior', salary: 150_000, minYears: 3, requirements: [] },
  ],
}

const VOLATILE: CareerTrack = {
  id: 'business',
  name: 'Empresário',
  kind: 'business',
  entryLabel: 'Abrir negócio',
  entryHint: 'Volátil.',
  levels: [
    { title: 'Autônomo', salary: 100_000, volatility: 0.9, minYears: 0, requirements: [] },
    { title: 'Empresa', salary: 300_000, volatility: 0.9, minYears: 2, requirements: [] },
  ],
}

const content = makeContent([], { careers: [TRACK, VOLATILE] })

function employed(overrides: Partial<GameState> = {}): GameState {
  const state = makeState(overrides)
  hireInto(state, TRACK)
  return state
}

describe('contratação', () => {
  it('entra no nível 0 e desnormaliza o kind da trilha', () => {
    const state = employed()
    expect(state.character.career).toMatchObject({ trackId: 'clt', kind: 'clt', level: 0 })
  })

  it('careerTitle junta cargo e trilha', () => {
    expect(careerTitle(employed(), content)).toBe('Júnior · Corporativo')
    expect(careerTitle(makeState(), content)).toBeNull()
  })

  it('sair zera a carreira', () => {
    const state = employed()
    leaveCareer(state, content)
    expect(state.character.career).toBeNull()
    expect(currentLevel(state, content)).toBeUndefined()
  })
})

describe('desempenho', () => {
  it('a baseline sai de inteligência e carisma', () => {
    const state = makeState()
    state.character.stats.intelligence = 100
    state.character.stats.charisma = 0
    expect(performanceBaseline(state)).toBe(60)
  })

  it('sem esforço, o desempenho converge para a baseline', () => {
    const state = employed()
    state.character.stats.intelligence = 90
    state.character.stats.charisma = 90
    const career = state.character.career
    if (!career) throw new Error('sem carreira')
    career.performance = 10

    const rng = createRng(1)
    for (let i = 0; i < 40; i++) applyCareerYear(state, rng, content)

    expect(career.performance).toBeGreaterThan(80)
  })
})

describe('promoção', () => {
  it('não promove antes do tempo mínimo no nível', () => {
    const state = employed()
    state.character.stats.intelligence = 90
    expect(promotionReady(state, content)).toBe(false)
  })

  it('não promove sem os requisitos, mesmo com o tempo cumprido', () => {
    const state = employed()
    state.character.stats.intelligence = 10
    const career = state.character.career
    if (career) career.yearsInLevel = 10
    expect(promotionReady(state, content)).toBe(false)
  })

  it('fica pronta quando tempo e requisitos passam', () => {
    const state = employed()
    state.character.stats.intelligence = 90
    const career = state.character.career
    if (career) career.yearsInLevel = 5
    expect(promotionReady(state, content)).toBe(true)
  })

  it('acaba promovendo quem cumpre os requisitos', () => {
    const state = employed()
    state.character.stats.intelligence = 95
    state.character.stats.charisma = 95

    const rng = createRng(4)
    for (let i = 0; i < 40; i++) applyCareerYear(state, rng, content)

    expect(state.character.career?.level).toBeGreaterThan(0)
  })

  it('zera os anos no nível ao promover', () => {
    const state = employed()
    state.character.stats.intelligence = 95
    state.character.stats.charisma = 95
    const rng = createRng(4)

    let promoted = false
    for (let i = 0; i < 40 && !promoted; i++) {
      applyCareerYear(state, rng, content)
      promoted = (state.character.career?.level ?? 0) > 0
    }
    expect(promoted).toBe(true)
    expect(state.character.career?.yearsInLevel).toBeLessThan(3)
  })
})

describe('renda', () => {
  it('salário sem volatilidade é fixo', () => {
    const state = employed()
    const rng = createRng(2)
    for (let i = 0; i < 10; i++) {
      expect(applyCareerYear(state, rng, content).income).toBe(40_000)
    }
  })

  it('negócio volátil varia de verdade para os dois lados', () => {
    const state = makeState()
    hireInto(state, VOLATILE)
    const rng = createRng(3)
    const incomes: number[] = []
    for (let i = 0; i < 60; i++) {
      if (!state.character.career) hireInto(state, VOLATILE)
      incomes.push(applyCareerYear(state, rng, content).income)
    }
    expect(Math.min(...incomes)).toBeLessThan(100_000)
    expect(Math.max(...incomes)).toBeGreaterThan(100_000)
  })
})

describe('demissão e falência', () => {
  it('desempenho no chão acaba custando o emprego', () => {
    const state = employed()
    state.character.stats.intelligence = 0
    state.character.stats.charisma = 0
    const career = state.character.career
    if (career) career.performance = 0

    const rng = createRng(6)
    let fired = false
    for (let i = 0; i < 40 && !fired; i++) {
      applyCareerYear(state, rng, content)
      fired = state.character.career === null
    }
    expect(fired).toBe(true)
  })

  it('CLT nunca quebra: falência é risco de quem tem negócio', () => {
    const state = employed()
    const rng = createRng(9)
    for (let i = 0; i < 50; i++) {
      if (!state.character.career) hireInto(state, TRACK)
      applyCareerYear(state, rng, content)
    }
    expect(state.character.debt).toBe(0)
  })

  it('negócio pode quebrar e deixar dívida', () => {
    const state = makeState()
    hireInto(state, VOLATILE)
    const rng = createRng(11)
    let broke = false
    for (let i = 0; i < 200 && !broke; i++) {
      if (!state.character.career) {
        broke = state.character.debt > 0
        if (!broke) hireInto(state, VOLATILE)
      }
      if (state.character.career) applyCareerYear(state, rng, content)
    }
    expect(broke).toBe(true)
  })
})

describe('nível de entrada', () => {
  it('sem qualificação, entra no primeiro degrau', () => {
    const state = makeState()
    state.character.stats.intelligence = 10
    expect(entryLevel(state, TRACK)).toBe(0)
  })

  it('quem já cumpre os requisitos entra mais acima', () => {
    const state = makeState()
    state.character.stats.intelligence = 10
    expect(entryLevel(state, TRACK)).toBe(0)

    // Pleno pede inteligência 60 e Sênior não pede nada: qualificação sobe os dois.
    state.character.stats.intelligence = 90
    expect(entryLevel(state, TRACK)).toBe(2)
  })

  it('para no primeiro nível que não cumpre, mesmo que cumpra um posterior', () => {
    const track: CareerTrack = {
      ...TRACK,
      levels: [
        { title: 'A', salary: 10, minYears: 0, requirements: [] },
        {
          title: 'B',
          salary: 20,
          minYears: 0,
          requirements: [{ type: 'stat', stat: 'intelligence', min: 99 }],
        },
        { title: 'C', salary: 30, minYears: 0, requirements: [] },
      ],
    }
    const state = makeState()
    state.character.stats.intelligence = 50
    expect(entryLevel(state, track)).toBe(0)
  })

  it('desempenho é intransferível: níveis que o exigem não são porta de entrada', () => {
    // É o que impede alguém de entrar direto como diretor por ter carisma alto.
    const track: CareerTrack = {
      ...TRACK,
      levels: [
        { title: 'A', salary: 10, minYears: 0, requirements: [] },
        {
          title: 'B',
          salary: 20,
          minYears: 0,
          requirements: [{ type: 'performance', min: 1 }],
        },
      ],
    }
    const state = makeState()
    expect(entryLevel(state, track)).toBe(0)
  })
})

describe('recomeço na mesma trilha', () => {
  it('um ex-diretor volta perto do topo, não do zero', () => {
    const state = makeState()
    state.character.careerHistory['clt'] = 2
    // Sem histórico entraria em 0: inteligência baixa não qualifica nada.
    state.character.stats.intelligence = 10
    expect(entryLevel(state, TRACK)).toBe(0)

    state.character.careerHistory['clt'] = 2
    hireInto(state, TRACK)
    expect(state.character.career?.level).toBe(0)

    state.character.careerHistory['clt'] = 5
    expect(entryLevel(state, TRACK)).toBe(Math.min(TRACK.levels.length - 1, 3))
  })

  it('o histórico sobrevive à demissão', () => {
    const state = makeState()
    state.character.stats.intelligence = 95
    state.character.stats.charisma = 95
    const rng = createRng(4)
    for (let i = 0; i < 40; i++) {
      if (state.character.career) applyCareerYear(state, rng, content)
    }
    hireInto(state, TRACK)
    for (let i = 0; i < 40; i++) {
      if (state.character.career) applyCareerYear(state, rng, content)
    }

    const best = state.character.careerHistory['clt'] ?? 0
    expect(best).toBeGreaterThan(0)

    leaveCareer(state, content)
    hireInto(state, TRACK)
    expect(state.character.career?.level).toBeGreaterThanOrEqual(best - 2)
  })

  it('nunca entra acima do último nível da trilha', () => {
    const state = makeState()
    state.character.careerHistory['clt'] = 99
    expect(entryLevel(state, TRACK)).toBe(TRACK.levels.length - 1)
  })
})

describe('promoção respeita a tabela', () => {
  it('o efeito de promoção não fura os requisitos do nível', () => {
    // Um evento com `career: promote` promovia sem checar nada. Na prática
    // isso levava um personagem sem diploma a Analista sênior, e a educação
    // deixava de valer qualquer coisa para a carreira.
    const state = employed()
    state.character.stats.intelligence = 10
    const rng = createRng(1)

    applyEffect({ type: 'career', action: 'promote' }, state, rng, content)
    expect(state.character.career?.level).toBe(0)

    state.character.stats.intelligence = 90
    applyEffect({ type: 'career', action: 'promote' }, state, rng, content)
    expect(state.character.career?.level).toBe(1)
  })
})

describe('risco da trilha de crime', () => {
  const CRIME: CareerTrack = {
    id: 'crime',
    name: 'Crime',
    kind: 'crime',
    entryLabel: 'Entrar para o crime',
    entryHint: 'Alto retorno.',
    levels: [
      { title: 'Batedor', salary: 30_000, volatility: 0.5, minYears: 0, requirements: [] },
      { title: 'Chefe', salary: 200_000, volatility: 0.6, minYears: 2, requirements: [] },
    ],
  }
  const crimeContent = makeContent([], { careers: [CRIME] })

  it('acaba levando à cadeia — é o freio que a trilha precisa ter', () => {
    // Medindo 100 vidas por perfil, o crime era o caminho MAIS rentável do
    // jogo: CLT tem demissão, empresário tem falência, e o crime não tinha
    // mecanismo de ruína nenhum no loop de carreira, só eventos.
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    hireInto(state, CRIME)

    const rng = createRng(5)
    let preso = false
    for (let i = 0; i < 60 && !preso; i++) {
      applyCareerYear(state, rng, crimeContent)
      preso = state.character.prison !== null
    }
    expect(preso).toBe(true)
  })

  it('ser preso acaba com a carreira criminosa', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    hireInto(state, CRIME)

    const rng = createRng(5)
    for (let i = 0; i < 60; i++) {
      if (state.character.prison !== null) break
      applyCareerYear(state, rng, crimeContent)
    }
    expect(state.character.career).toBeNull()
    expect(state.character.flags['criminal_record']).toBe(true)
  })

  it('CLT não vai preso pela própria carreira', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    hireInto(state, TRACK)
    const rng = createRng(5)
    for (let i = 0; i < 60; i++) {
      if (!state.character.career) hireInto(state, TRACK)
      applyCareerYear(state, rng, content)
    }
    expect(state.character.prison).toBeNull()
  })
})
