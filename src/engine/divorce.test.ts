// Casar mudava uma flag e nada mais até a Fase 6: sem renda conjunta, sem
// custo de divórcio. A decisão mais consequente de uma vida não aparecia em
// lugar nenhum na economia.

import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { DIVORCE_ASSET_SHARE, DIVORCE_EXTRA_COST_WITH_CHILD } from './balance'
import { applyEconomy, spouseIncome } from './economy'
import { divorce } from './divorce'
import { createRng } from './rng'
import type { GameState, Person } from './types'

function pessoa(over: Partial<Person> & Pick<Person, 'kind'>): Person {
  return {
    id: over.id ?? over.kind,
    name: over.name ?? 'Alguém Silva',
    kind: over.kind,
    gender: over.gender ?? 'female',
    age: over.age ?? 35,
    relation: over.relation ?? 70,
    alive: over.alive ?? true,
    flags: {},
  }
}

function casado(relation = 70): GameState {
  const state = makeState({ character: makeCharacter({ age: 35, money: 200_000 }) })
  state.character.flags['married'] = true
  state.relations.push(pessoa({ kind: 'spouse', relation }))
  return state
}

describe('renda conjunta', () => {
  it('quem não tem cônjuge não recebe nada', () => {
    const state = makeState({ character: makeCharacter({ age: 35 }) })
    expect(spouseIncome(state, 100_000)).toBe(0)
  })

  it('o cônjuge contribui, e a contribuição escala com a relação', () => {
    expect(spouseIncome(casado(100), 100_000)).toBeGreaterThan(spouseIncome(casado(40), 100_000))
    expect(spouseIncome(casado(40), 100_000)).toBeGreaterThan(0)
  })

  it('cônjuge morto não põe dinheiro na mesa', () => {
    const state = casado()
    state.relations[0]!.alive = false
    expect(spouseIncome(state, 100_000)).toBe(0)
  })

  it('casamento bom melhora o ano; casamento ruim piora', () => {
    // É a tensão que o sistema existe para criar. A primeira versão fazia
    // casar PIORAR o saldo nas cinco classes sociais, porque o fator de custo
    // multiplicava o piso do custo de vida — e duas pessoas dividindo teto não
    // pagam 35% mais aluguel.
    const zerado = (state: GameState): GameState => {
      state.character.money = 0
      state.character.debt = 0
      return state
    }
    const content = makeContent()
    const saldo = (s: GameState): number => s.character.money - s.character.debt

    const solteiro = zerado(makeState({ character: makeCharacter({ age: 35, money: 0, debt: 0 }) }))
    const bem = zerado(casado(100))
    const mal = zerado(casado(35))

    applyEconomy(solteiro, createRng(1), content)
    applyEconomy(bem, createRng(1), content)
    applyEconomy(mal, createRng(1), content)

    expect(saldo(bem), 'casamento bom').toBeGreaterThan(saldo(solteiro))
    expect(saldo(mal), 'casamento ruim').toBeLessThan(saldo(solteiro))
  })
})

describe('divórcio', () => {
  it('não faz nada para quem não tem cônjuge', () => {
    const state = makeState({ character: makeCharacter({ age: 35 }) })
    expect(divorce(state)).toBeNull()
  })

  it('leva metade do caixa', () => {
    const state = casado()
    divorce(state)
    expect(state.character.money).toBe(200_000 * (1 - DIVORCE_ASSET_SHARE))
  })

  it('cobra mais de quem tem filho', () => {
    const semFilho = casado()
    const comFilho = casado()
    comFilho.relations.push(pessoa({ kind: 'child', id: 'c', age: 8 }))

    divorce(semFilho)
    divorce(comFilho)

    expect(comFilho.character.money).toBeLessThan(semFilho.character.money)
    const esperado = Math.round(
      200_000 * (1 - (DIVORCE_ASSET_SHARE + DIVORCE_EXTRA_COST_WITH_CHILD)),
    )
    expect(comFilho.character.money).toBe(esperado)
  })

  it('vende os bens antes de partir, em vez de deixar a casa inteira', () => {
    // Sem isto o jogador saía do divórcio com metade do dinheiro E o
    // apartamento, que é o contrário de dividir.
    const state = casado()
    state.character.assets.push({
      assetId: 'apartment_small',
      kind: 'property',
      value: 400_000,
      boughtYear: 2020,
    })

    divorce(state)
    expect(state.character.assets).toEqual([])
    // Caixa após a venda com deságio, partido ao meio: sobra mais que os
    // 100 mil que sobrariam sem contar o imóvel.
    expect(state.character.money).toBeGreaterThan(200_000 * (1 - DIVORCE_ASSET_SHARE))
  })

  it('limpa o estado civil e transforma o cônjuge em quem sobrou', () => {
    const state = casado(90)
    divorce(state)

    expect(state.character.flags['married']).toBe(false)
    expect(state.relations[0]?.kind).toBe('friend')
    expect(state.relations[0]?.relation).toBe(50)
    expect(state.relations[0]?.alive).toBe(true)
  })

  it('depois do divórcio o cônjuge não contribui mais', () => {
    const state = casado(100)
    expect(spouseIncome(state, 100_000)).toBeGreaterThan(0)
    divorce(state)
    expect(spouseIncome(state, 100_000)).toBe(0)
  })
})
