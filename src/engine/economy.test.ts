import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { simulate } from '../test/player'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { netWorth } from './assets'
import {
  AGE_FINANCIALLY_INDEPENDENT,
  AGE_RETIREMENT_MIN,
  CLASS_PROFILES,
  PENSION_RATE,
  SUBSISTENCE_COST,
} from './balance'
import { hireInto, leaveCareer } from './careers'
import { createRng } from './rng'
import type { CareerTrack } from './types'

const TRILHA_TESTE: CareerTrack = {
  id: 'clt',
  name: 'Corporativo',
  kind: 'clt',
  entryLabel: 'Procurar emprego',
  entryHint: 'Previsível.',
  levels: [{ title: 'Analista', salary: 40_000, minYears: 0, requirements: [] }],
}
import { applyEconomy, costOfLiving } from './economy'
import { enroll } from './education'
import type { GameState } from './types'

const rng = () => createRng(1)
const empty = makeContent()

describe('custo de vida', () => {
  it('nunca fica abaixo da subsistência', () => {
    const state = makeState({ character: makeCharacter({ socialClass: 'middle' }) })
    expect(costOfLiving(state, 0)).toBe(SUBSISTENCE_COST)
  })

  it('o padrão de vida herdado desce até o que a renda aguenta', () => {
    // Nascer rico te torna caro, mas não te condena: um filho de classe alta
    // com salário de analista ficava no vermelho a vida inteira, sem saída.
    const rico = makeState({ character: makeCharacter({ socialClass: 'rich' }) })
    const pobre = makeState({ character: makeCharacter({ socialClass: 'poor' }) })

    expect(costOfLiving(rico, 60_000)).toBeGreaterThan(costOfLiving(pobre, 60_000))
    expect(costOfLiving(rico, 60_000)).toBeLessThan(CLASS_PROFILES.rich.costOfLiving)
  })

  it('quem ganha muito não é limitado pelo teto da origem', () => {
    const pobre = makeState({ character: makeCharacter({ socialClass: 'poor' }) })
    expect(costOfLiving(pobre, 500_000)).toBe(Math.round(500_000 * 0.42))
  })

  it('cresce junto com a renda — dinheiro alto não vira saldo parado', () => {
    const state = makeState({ character: makeCharacter({ socialClass: 'middle' }) })
    expect(costOfLiving(state, 1_000_000)).toBeGreaterThan(
      CLASS_PROFILES.middle.costOfLiving * 5,
    )
  })

  it('estudante vive mais barato', () => {
    const state = makeState({ character: makeCharacter({ socialClass: 'middle' }) })
    const normal = costOfLiving(state, 100_000)
    enroll(state, makeContent([], {
      courses: [
        {
          id: 'x',
          name: 'X',
          grants: 'bachelor',
          years: 4,
          annualCost: 0,
          requirements: [],
          completionEffects: [],
        },
      ],
    }), 'x')
    expect(costOfLiving(state, 100_000)).toBeLessThan(normal)
  })
})

describe('ano financeiro', () => {
  it('criança recebe mesada e não paga custo de vida', () => {
    const state = makeState({
      character: makeCharacter({ age: 8, money: 0, socialClass: 'middle' }),
    })
    applyEconomy(state, rng(), empty)
    expect(state.character.money).toBe(CLASS_PROFILES.middle.allowance)
  })

  it('adulto sem carreira vive de renda informal, que não cobre o custo', () => {
    const state = makeState({
      character: makeCharacter({
        age: AGE_FINANCIALLY_INDEPENDENT,
        money: 100_000,
        socialClass: 'middle',
      }),
    })
    applyEconomy(state, rng(), empty)
    // Ficar sem trabalho tem que doer devagar, não ser neutro.
    expect(state.character.money).toBeLessThan(100_000)
  })

  it('a dívida rende juros mas respeita o teto', () => {
    const state = makeState({ character: makeCharacter({ age: 40, debt: 399_000 }) })
    for (let i = 0; i < 30; i++) applyEconomy(state, rng(), empty)
    expect(state.character.debt).toBeLessThanOrEqual(400_000)
  })
})

/**
 * Regressão do pior bug da Fase 2: um jogador que fazia tudo certo — cursava
 * a faculdade, arrumava emprego, se dedicava — morria devendo R$ 310 mil,
 * porque estagiário ganhava menos que a renda informal e a mensalidade virava
 * dívida mesmo com dinheiro em caixa.
 */
describe('vida de quem joga com um plano', () => {
  const PLANO = [
    'Cursar mais um ano',
    'Procurar emprego com carteira',
    'Se dedicar ao trabalho',
    'Treinar',
  ]

  /**
   * Este plano vai FUNDO: gasta os três pontos de ação na primeira coisa do
   * `PLANO` que estiver disponível, em vez de espalhar. É o que `repeatActions`
   * expressa, e o que separa esta medida da do `player-bracket`.
   */
  function viveComPlano(seed: number): GameState {
    return simulate(seed, GAME_CONTENT, {
      actions: PLANO,
      repeatActions: 3,
      name: 'Planejador',
    })
  }

  const sample = Array.from({ length: 40 }, (_, i) => viveComPlano(i + 1))

  it('quase ninguém termina no vermelho', () => {
    // `netWorth` e não `money - debt`: quem financia um imóvel fica com a
    // dívida no passivo E o apartamento no ativo. Medir só o caixa acusaria
    // de falido justamente quem fez a compra mais sensata da vida.
    const broke = sample.filter((s) => netWorth(s) < 0)
    expect(broke.length / sample.length).toBeLessThan(0.15)
  })

  it('a maioria chega a se formar', () => {
    const graduated = sample.filter(
      (s) => s.character.education === 'bachelor' || s.character.education === 'postgrad',
    )
    expect(graduated.length / sample.length).toBeGreaterThan(0.5)
  })

  it('a carreira progride além do primeiro degrau', () => {
    const levels = sample.map((s) => s.character.careerHistory['clt'] ?? 0)
    const median = levels.sort((a, b) => a - b)[Math.floor(levels.length / 2)] ?? 0
    expect(median).toBeGreaterThanOrEqual(2)
  })

  it('quem termina devendo não estava sentado em dinheiro o tempo todo', () => {
    // Esta asserção já foi `money === 0 sempre que debt > 0`, e estava errada
    // por dois motivos que os testes de `amortização de dívida` abaixo deixam
    // explícitos: o engine mantém uma RESERVA de propósito em vez de zerar a
    // conta, e amortiza uma vez por ano — antes dos eventos. Um evento que
    // paga bem no último ano de vida deixa caixa e dívida lado a lado até uma
    // amortização que nunca chega. Passava por sorte de seed; parou de passar
    // quando entraram eventos novos que pagam alto.
    //
    // O que importa de verdade é a escala: dívida grande convivendo com caixa
    // grande por anos seria o sintoma real de amortização quebrada.
    const sentados = sample.filter(
      (s) => s.character.debt > 50_000 && s.character.money > s.character.debt * 3,
    )
    expect(sentados.length / sample.length).toBeLessThan(0.1)
  })
})

describe('teto de dívida', () => {
  it('vale para dívida de gasto, não só para juros', () => {
    // O teto só cobria juros; 70 anos de déficit furavam ele por fora.
    const state = makeState({
      character: makeCharacter({ age: 30, money: 0, debt: 0, socialClass: 'rich' }),
    })
    for (let i = 0; i < 60; i++) applyEconomy(state, rng(), empty)
    expect(state.character.debt).toBeLessThanOrEqual(400_000)
  })
})

describe('amortização de dívida', () => {
  it('quem tem caixa sobrando quita a dívida em vez de pagar juros', () => {
    // Um herdeiro com R$ 2,2 milhões em caixa e R$ 50 mil de dívida rendendo
    // juros ano após ano foi o que revelou isto num playthrough.
    const state = makeState({
      character: makeCharacter({ age: 40, money: 2_000_000, debt: 50_000 }),
    })
    applyEconomy(state, rng(), empty)
    expect(state.character.debt).toBe(0)
  })

  it('mantém uma reserva: não zera a conta para quitar', () => {
    const state = makeState({
      character: makeCharacter({ age: 40, money: 30_000, debt: 200_000 }),
    })
    applyEconomy(state, rng(), empty)
    expect(state.character.debt).toBeGreaterThan(0)
    expect(state.character.money).toBeGreaterThanOrEqual(0)
  })

  it('sem caixa, a dívida segue rendendo juros', () => {
    const state = makeState({ character: makeCharacter({ age: 40, money: 0, debt: 100_000 }) })
    applyEconomy(state, rng(), empty)
    expect(state.character.debt).toBeGreaterThan(100_000)
  })
})

describe('aposentadoria', () => {
  it('quem sai da carreira depois da idade mínima leva uma pensão', () => {
    const state = makeState({ character: makeCharacter({ age: AGE_RETIREMENT_MIN }) })
    const content = makeContent([], { careers: [TRILHA_TESTE] })
    hireInto(state, TRILHA_TESTE)

    leaveCareer(state, content)
    expect(state.character.pension).toBe(Math.round(40_000 * PENSION_RATE))
  })

  it('sair antes da idade mínima não gera pensão', () => {
    const state = makeState({ character: makeCharacter({ age: 30 }) })
    const content = makeContent([], { careers: [TRILHA_TESTE] })
    hireInto(state, TRILHA_TESTE)

    leaveCareer(state, content)
    expect(state.character.pension).toBe(0)
  })

  it('a pensão vale mais que a informalidade', () => {
    // Aposentar-se era puro prejuízo: a renda caía para o bico informal e o
    // jogo pedia, na prática, para o jogador nunca parar de trabalhar.
    const aposentado = makeState({
      character: makeCharacter({ age: 70, money: 0, socialClass: 'middle', pension: 60_000 }),
    })
    const informal = makeState({
      character: makeCharacter({ age: 70, money: 0, socialClass: 'middle' }),
    })

    applyEconomy(aposentado, rng(), empty)
    applyEconomy(informal, rng(), empty)

    expect(aposentado.character.money).toBeGreaterThan(informal.character.money)
  })
})
