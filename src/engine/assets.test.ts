import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeState } from '../test/fixtures'
import { applyAssetYear, assetsValue, buyAsset, netWorth, owns, sellAsset } from './assets'
import { ASSET_SALE_HAIRCUT } from './balance'
import { createRng } from './rng'
import type { AssetDef } from './types'

const CASA: AssetDef = {
  id: 'casa',
  name: 'Casa',
  kind: 'property',
  hint: 'Uma casa.',
  price: 100_000,
  upkeepRate: 0.04,
  appreciation: 0.05,
  volatility: 0,
  requirements: [],
}

const CARRO: AssetDef = {
  id: 'carro',
  name: 'Carro',
  kind: 'vehicle',
  hint: 'Um carro.',
  price: 50_000,
  upkeepRate: 0.1,
  appreciation: -0.1,
  volatility: 0,
  requirements: [],
}

const APOSTA: AssetDef = {
  id: 'aposta',
  name: 'Aposta',
  kind: 'investment',
  hint: 'Arriscado.',
  price: 100_000,
  upkeepRate: 0,
  appreciation: -0.6,
  volatility: 0.1,
  requirements: [],
}

const content = makeContent([], { assets: [CASA, CARRO, APOSTA] })
const rng = () => createRng(1)

describe('compra', () => {
  it('desconta o preço e registra o bem pelo valor pago', () => {
    const state = makeState({ character: makeCharacter({ money: 150_000 }) })
    expect(buyAsset(state, content, 'casa')).toBe(true)
    expect(state.character.money).toBe(50_000)
    expect(state.character.assets).toHaveLength(1)
    expect(state.character.assets[0]).toMatchObject({ assetId: 'casa', value: 100_000 })
  })

  it('desnormaliza o tipo, para as condições não precisarem do catálogo', () => {
    const state = makeState({ character: makeCharacter({ money: 150_000 }) })
    buyAsset(state, content, 'casa')
    expect(state.character.assets[0]?.kind).toBe('property')
  })

  it('recusa sem dinheiro', () => {
    const state = makeState({ character: makeCharacter({ money: 10 }) })
    expect(buyAsset(state, content, 'casa')).toBe(false)
    expect(state.character.assets).toHaveLength(0)
  })

  it('recusa comprar duas vezes o mesmo bem', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    buyAsset(state, content, 'casa')
    expect(buyAsset(state, content, 'casa')).toBe(false)
  })

  it('recusa ativo que não existe', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    expect(buyAsset(state, content, 'iate')).toBe(false)
  })
})

describe('venda', () => {
  it('devolve o valor de mercado menos o custo de vender', () => {
    const state = makeState({ character: makeCharacter({ money: 100_000 }) })
    buyAsset(state, content, 'casa')
    const proceeds = sellAsset(state, 'casa')
    expect(proceeds).toBe(Math.round(100_000 * (1 - ASSET_SALE_HAIRCUT)))
    expect(owns(state, 'casa')).toBe(false)
  })

  it('vender o que não se tem é inócuo', () => {
    expect(sellAsset(makeState(), 'casa')).toBeNull()
  })
})

describe('o ano passando por cima dos bens', () => {
  it('imóvel valoriza e cobra manutenção', () => {
    const state = makeState({ character: makeCharacter({ money: 200_000 }) })
    buyAsset(state, content, 'casa')
    const { upkeep } = applyAssetYear(state, rng(), content)

    expect(state.character.assets[0]?.value).toBe(105_000)
    expect(upkeep).toBe(Math.round(105_000 * 0.04))
    expect(state.character.money).toBe(100_000 - upkeep)
  })

  it('veículo deprecia — não é investimento', () => {
    const state = makeState({ character: makeCharacter({ money: 200_000 }) })
    buyAsset(state, content, 'carro')
    for (let i = 0; i < 5; i++) applyAssetYear(state, rng(), content)
    expect(state.character.assets[0]?.value).toBeLessThan(50_000)
  })

  it('bem nenhum não cobra nada', () => {
    const state = makeState()
    expect(applyAssetYear(state, rng(), content).upkeep).toBe(0)
  })

  it('investimento que despenca vira pó e sai da lista, com nota', () => {
    const state = makeState({ character: makeCharacter({ money: 200_000 }) })
    buyAsset(state, content, 'aposta')

    const shared = createRng(3)
    let notes: ReturnType<typeof applyAssetYear>['notes'] = []
    for (let i = 0; i < 15 && state.character.assets.length > 0; i++) {
      notes = applyAssetYear(state, shared, content).notes
    }

    expect(state.character.assets).toHaveLength(0)
    expect(notes.length).toBeGreaterThan(0)
  })

  it('imóvel nunca vira pó, por pior que fique', () => {
    const state = makeState({ character: makeCharacter({ money: 500_000 }) })
    buyAsset(state, content, 'carro')
    const shared = createRng(2)
    for (let i = 0; i < 60; i++) applyAssetYear(state, shared, content)
    // Deprecia até o piso, mas continua sendo um carro.
    expect(state.character.assets).toHaveLength(1)
    expect(state.character.assets[0]?.value).toBeGreaterThan(0)
  })
})

describe('patrimônio', () => {
  it('soma caixa e bens e desconta a dívida', () => {
    const state = makeState({ character: makeCharacter({ money: 100_000, debt: 30_000 }) })
    buyAsset(state, content, 'casa')
    expect(assetsValue(state)).toBe(100_000)
    expect(state.character.money).toBe(0)
    expect(netWorth(state)).toBe(70_000)
  })

  it('sem nada, é o próprio caixa', () => {
    const state = makeState({ character: makeCharacter({ money: 5_000, debt: 0 }) })
    expect(netWorth(state)).toBe(5_000)
  })
})
