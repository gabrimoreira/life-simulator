// O envelhecimento nao tinha teste ate a Fase 5, e foi ele que produziu o pior
// bug do projeto: na primeira versao a saude so drenava, e a mediana de vida
// era 15 anos. Estes testes existem para que uma mexida na curva quebre algo.

import { describe, expect, it } from 'vitest'
import { applyAging, checkDeath, healthBaseline, mortalityChance } from './aging'
import {
  CHRONIC_HEALTH_PENALTY,
  HAPPINESS_MEAN,
  HEALTH_PEAK_AGE,
  MAX_AGE,
  MORTALITY_HEALTH_MAX_MULT,
  MORTALITY_HEALTH_MIN_MULT,
  RELATION_ANNUAL_DECAY,
  TRAINED_HEALTH_BONUS,
} from './balance'
import { FLAG_CHRONIC_CONDITION, FLAG_TRAINS_REGULARLY } from './flags'
import { createPerson } from './people'
import { createRng } from './rng'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'

describe('healthBaseline', () => {
  it('fica no teto ate a idade de pico e so cai depois', () => {
    expect(healthBaseline(0)).toBe(100)
    expect(healthBaseline(HEALTH_PEAK_AGE)).toBe(100)
    expect(healthBaseline(HEALTH_PEAK_AGE + 10)).toBeLessThan(100)
  })

  it('e monotonica nao-crescente ao longo da vida inteira', () => {
    let previous = Infinity
    for (let age = 0; age <= MAX_AGE; age += 1) {
      const value = healthBaseline(age)
      expect(value).toBeLessThanOrEqual(previous)
      previous = value
    }
  })

  it('nunca fica negativa, nem na idade maxima', () => {
    expect(healthBaseline(MAX_AGE)).toBeGreaterThanOrEqual(0)
  })

  it('treinar levanta o teto e uma condicao cronica o abaixa', () => {
    const plain = healthBaseline(60)
    expect(healthBaseline(60, { [FLAG_TRAINS_REGULARLY]: true })).toBe(plain + TRAINED_HEALTH_BONUS)
    expect(healthBaseline(60, { [FLAG_CHRONIC_CONDITION]: true })).toBe(
      plain - CHRONIC_HEALTH_PENALTY,
    )
  })

  it('as duas marcas se somam em vez de uma anular a outra', () => {
    const both = healthBaseline(60, {
      [FLAG_TRAINS_REGULARLY]: true,
      [FLAG_CHRONIC_CONDITION]: true,
    })
    expect(both).toBe(healthBaseline(60) + TRAINED_HEALTH_BONUS - CHRONIC_HEALTH_PENALTY)
  })
})

describe('mortalityChance', () => {
  it('cresce com a idade, mantida a saude', () => {
    let previous = -1
    for (let age = 0; age <= MAX_AGE; age += 5) {
      const chance = mortalityChance(age, 70)
      expect(chance).toBeGreaterThan(previous)
      previous = chance
    }
  })

  it('cai quando a saude sobe, mantida a idade', () => {
    expect(mortalityChance(70, 90)).toBeLessThan(mortalityChance(70, 20))
  })

  it('respeita o piso e o teto do multiplicador de saude', () => {
    const base = mortalityChance(50, 100) / MORTALITY_HEALTH_MIN_MULT
    // Saude 100 ja bateria em 0, entao o piso e quem manda.
    expect(mortalityChance(50, 100)).toBeCloseTo(base * MORTALITY_HEALTH_MIN_MULT, 10)
    // Saude 0 pediria multiplicador 2, que e exatamente o teto.
    expect(mortalityChance(50, 0)).toBeCloseTo(base * MORTALITY_HEALTH_MAX_MULT, 10)
  })

  it('nunca passa de 1', () => {
    expect(mortalityChance(MAX_AGE, 0)).toBeLessThanOrEqual(1)
  })

  it('e baixa o bastante na infancia para nao dizimar criancas', () => {
    // A regressao historica: criancas morriam antes de chegar na escola.
    expect(mortalityChance(10, 70)).toBeLessThan(0.01)
  })
})

describe('applyAging', () => {
  it('puxa a saude na direcao do teto da idade, dos dois lados', () => {
    const low = makeState({ character: makeCharacter({ age: 30 }) })
    low.character.stats.health = 20
    applyAging(low, createRng(1))
    expect(low.character.stats.health).toBeGreaterThan(20)

    const high = makeState({ character: makeCharacter({ age: 80 }) })
    high.character.stats.health = 95
    applyAging(high, createRng(1))
    expect(high.character.stats.health).toBeLessThan(95)
  })

  it('quem treina termina o ano com mais saude que quem nao treina', () => {
    const trained = makeState({ character: makeCharacter({ age: 60 }) })
    trained.character.stats.health = 50
    trained.character.flags[FLAG_TRAINS_REGULARLY] = true

    const idle = makeState({ character: makeCharacter({ age: 60 }) })
    idle.character.stats.health = 50

    applyAging(trained, createRng(1))
    applyAging(idle, createRng(1))
    expect(trained.character.stats.health).toBeGreaterThan(idle.character.stats.health)
  })

  it('uma condicao cronica cobra saude todo ano', () => {
    const sick = makeState({ character: makeCharacter({ age: 60 }) })
    sick.character.stats.health = 50
    sick.character.flags[FLAG_CHRONIC_CONDITION] = true

    const well = makeState({ character: makeCharacter({ age: 60 }) })
    well.character.stats.health = 50

    applyAging(sick, createRng(1))
    applyAging(well, createRng(1))
    expect(sick.character.stats.health).toBeLessThan(well.character.stats.health)
  })

  it('a felicidade regride a media pelos dois lados', () => {
    const euphoric = makeState({ character: makeCharacter({ age: 30 }) })
    euphoric.character.stats.happiness = 95
    applyAging(euphoric, createRng(1))
    expect(euphoric.character.stats.happiness).toBeLessThan(95)
    expect(euphoric.character.stats.happiness).toBeGreaterThan(HAPPINESS_MEAN)

    const sad = makeState({ character: makeCharacter({ age: 30 }) })
    sad.character.stats.happiness = 5
    applyAging(sad, createRng(1))
    expect(sad.character.stats.happiness).toBeGreaterThan(5)
    expect(sad.character.stats.happiness).toBeLessThan(HAPPINESS_MEAN)
  })

  it('a aparencia so decai depois da idade de corte', () => {
    const young = makeState({ character: makeCharacter({ age: 25 }) })
    young.character.stats.looks = 60
    applyAging(young, createRng(1))
    expect(young.character.stats.looks).toBe(60)

    const older = makeState({ character: makeCharacter({ age: 70 }) })
    older.character.stats.looks = 60
    applyAging(older, createRng(1))
    expect(older.character.stats.looks).toBeLessThan(60)
  })

  it('relacao com quem esta vivo decai, com quem morreu nao', () => {
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    const content = makeContent()
    const alive = createPerson('friend', state, createRng(2), content, { relation: 80 })
    const dead = createPerson('friend', state, createRng(3), content, { relation: 80 })
    dead.alive = false
    state.relations.push(alive, dead)

    applyAging(state, createRng(1))
    expect(alive.relation).toBe(80 - RELATION_ANNUAL_DECAY)
    expect(dead.relation).toBe(80)
  })

  it('a relacao nunca fica negativa', () => {
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    const person = createPerson('friend', state, createRng(2), makeContent(), { relation: 1 })
    state.relations.push(person)

    applyAging(state, createRng(1))
    expect(person.relation).toBe(0)
  })
})

describe('checkDeath', () => {
  it('saude zerada mata na hora', () => {
    const state = makeState({ character: makeCharacter({ age: 30 }) })
    state.character.stats.health = 0
    checkDeath(state, createRng(1))
    expect(state.character.alive).toBe(false)
    expect(state.character.deathAge).toBe(30)
  })

  it('a idade maxima mata mesmo com saude cheia', () => {
    const state = makeState({ character: makeCharacter({ age: MAX_AGE }) })
    state.character.stats.health = 100
    checkDeath(state, createRng(1))
    expect(state.character.alive).toBe(false)
  })

  it('nao ressuscita nem reescreve quem ja morreu', () => {
    const state = makeState({ character: makeCharacter({ age: 40 }) })
    state.character.alive = false
    state.character.deathCause = 'causa original'
    state.character.deathAge = 39
    state.character.stats.health = 0

    checkDeath(state, createRng(1))
    expect(state.character.deathCause).toBe('causa original')
    expect(state.character.deathAge).toBe(39)
  })

  it('e deterministico sob a mesma seed', () => {
    const run = (): boolean => {
      const state = makeState({ character: makeCharacter({ age: 85 }) })
      state.character.stats.health = 40
      checkDeath(state, createRng(12345))
      return state.character.alive
    }
    expect(run()).toBe(run())
  })
})

describe('caracterizacao da longevidade', () => {
  /** Vive so de envelhecer: sem eventos, sem acoes, sem carreira. */
  function lifespan(seed: number): number {
    const state = makeState({ character: makeCharacter({ age: 0 }) })
    const rng = createRng(seed)
    while (state.character.alive && state.character.age < MAX_AGE) {
      state.character.age += 1
      applyAging(state, rng)
      checkDeath(state, rng)
    }
    return state.character.deathAge ?? state.character.age
  }

  const ages = Array.from({ length: 400 }, (_, i) => lifespan(i + 1)).sort((a, b) => a - b)
  const median = ages[Math.floor(ages.length / 2)] ?? 0
  const survivedChildhood = ages.filter((age) => age >= 18).length / ages.length

  it('a mediana de vida e de adulto idoso, nao de adolescente', () => {
    // Foi 15 na primeira versao, quando a saude so drenava. Se este teste
    // quebrar por baixo, a curva de saude regrediu.
    expect(median).toBeGreaterThanOrEqual(60)
    expect(median).toBeLessThanOrEqual(95)
  })

  it('quase todo mundo chega a maioridade', () => {
    expect(survivedChildhood).toBeGreaterThan(0.97)
  })

  it('ninguem passa da idade maxima', () => {
    expect(Math.max(...ages)).toBeLessThanOrEqual(MAX_AGE)
  })
})

describe('anos seguidos de infelicidade', () => {
  /** Roda um ano com a felicidade forcada, para o contador nao depender do RNG. */
  function ano(state: ReturnType<typeof makeState>, happiness: number): void {
    state.character.stats.happiness = happiness
    applyAging(state, createRng(1))
  }

  it('conta anos seguidos abaixo do limiar', () => {
    const state = makeState({ character: makeCharacter({ age: 30 }) })
    expect(state.character.unhappyYears).toBe(0)

    ano(state, 5)
    expect(state.character.unhappyYears).toBe(1)
    ano(state, 5)
    expect(state.character.unhappyYears).toBe(2)
    ano(state, 5)
    expect(state.character.unhappyYears).toBe(3)
  })

  it('zera no primeiro ano bom — e sequencia, nao acumulado de vida', () => {
    const state = makeState({ character: makeCharacter({ age: 30 }) })
    ano(state, 5)
    ano(state, 5)
    expect(state.character.unhappyYears).toBe(2)

    ano(state, 90)
    expect(state.character.unhappyYears).toBe(0)
  })

  it('conta onde o ano TERMINOU, depois da reversao a media', () => {
    // A reversao a media roda ANTES da contagem e o stat e arredondado, e as
    // duas coisas juntas deslocam o limiar real: round(0,92x + 4) < 30 exige
    // x <= 27. Quem esta em 28 termina o ano em 30 e NAO conta.
    //
    // O limiar nominal e 30 e o efetivo e 27. A diferenca e pequena e importa
    // para quem escreve conteudo de crise, entao fica medida aqui em vez de
    // ser descoberta de novo mais tarde.
    const naoConta = makeState({ character: makeCharacter({ age: 30 }) })
    ano(naoConta, 28)
    expect(naoConta.character.unhappyYears).toBe(0)

    const conta = makeState({ character: makeCharacter({ age: 30 }) })
    ano(conta, 27)
    expect(conta.character.unhappyYears).toBe(1)
  })
})
