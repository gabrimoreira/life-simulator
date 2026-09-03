// Ativos: compra, venda e o ano que passa por cima deles.
//
// Todo ativo tem manutencao. Dinheiro parado num imovel nao e neutro — e a
// diferenca entre patrimonio e saldo.

import { ASSET_SALE_HAIRCUT, ASSET_VALUE_FLOOR } from './balance'
import type { ContentPack } from './content-pack'
import { addMoney, applyEffects } from './effects'
import type { Rng } from './rng'
import { formatMoney } from './text'
import { makeNote } from './timeline'
import type { AssetDef, GameState, OwnedAsset, TimelineEntry } from './types'

export function findAsset(content: ContentPack, assetId: string): AssetDef | undefined {
  return content.assets.find((asset) => asset.id === assetId)
}

export function assetName(content: ContentPack, assetId: string): string {
  return findAsset(content, assetId)?.name ?? assetId
}

export function owns(state: GameState, assetId: string): boolean {
  return state.character.assets.some((owned) => owned.assetId === assetId)
}

/** Soma do valor de mercado de tudo que a pessoa tem. */
export function assetsValue(state: GameState): number {
  return state.character.assets.reduce((sum, owned) => sum + owned.value, 0)
}

/** Caixa + ativos − dívida. É este número que diz se a vida deu certo. */
export function netWorth(state: GameState): number {
  return state.character.money + assetsValue(state) - state.character.debt
}

export function buyAsset(state: GameState, content: ContentPack, assetId: string): boolean {
  const asset = findAsset(content, assetId)
  if (!asset || owns(state, assetId)) return false
  if (state.character.money < asset.price) return false

  addMoney(state.character, -asset.price)
  state.character.assets.push({
    assetId: asset.id,
    kind: asset.kind,
    value: asset.price,
    boughtYear: state.year,
  })
  return true
}

/**
 * Vende pelo valor de mercado menos o desconto de pressa. Vender nunca devolve
 * exatamente o que se pagou — corretagem, imposto, o comprador negociando.
 */
export function sellAsset(state: GameState, assetId: string): number | null {
  const index = state.character.assets.findIndex((owned) => owned.assetId === assetId)
  if (index < 0) return null

  const owned = state.character.assets[index]
  if (!owned) return null

  const proceeds = Math.round(owned.value * (1 - ASSET_SALE_HAIRCUT))
  state.character.assets.splice(index, 1)
  addMoney(state.character, proceeds)
  return proceeds
}

/** Um ano de valorizacao e manutencao. Devolve a linha de razao dos ativos. */
export function applyAssetYear(
  state: GameState,
  rng: Rng,
  content: ContentPack,
): { upkeep: number; notes: TimelineEntry[] } {
  const notes: TimelineEntry[] = []
  let upkeep = 0

  for (const owned of state.character.assets) {
    const asset = findAsset(content, owned.assetId)
    if (!asset) continue

    const swing = (rng.next() * 2 - 1) * asset.volatility
    owned.value = Math.max(
      Math.round(asset.price * ASSET_VALUE_FLOOR),
      Math.round(owned.value * (1 + asset.appreciation + swing)),
    )
    upkeep += Math.round(owned.value * asset.upkeepRate)
    if (asset.annualEffects) applyEffects(asset.annualEffects, state, rng, content)
  }

  if (upkeep > 0) addMoney(state.character, -upkeep)

  // Um investimento que virou pó merece uma linha; um carro depreciando, não.
  for (const owned of [...state.character.assets]) {
    const asset = findAsset(content, owned.assetId)
    if (!asset || asset.kind !== 'investment') continue
    if (owned.value > asset.price * (ASSET_VALUE_FLOOR + 0.02)) continue

    state.character.assets = state.character.assets.filter((a) => a !== owned)
    notes.push(
      makeNote(state, `${asset.name} virou pó. Você perdeu o que tinha ali.`, 'random', [
        { label: asset.name, text: `−${formatMoney(asset.price)}`, tone: 'bad' },
      ]),
    )
  }

  return { upkeep, notes }
}

export function ownedWithDef(
  state: GameState,
  content: ContentPack,
): { owned: OwnedAsset; def: AssetDef }[] {
  const out: { owned: OwnedAsset; def: AssetDef }[] = []
  for (const owned of state.character.assets) {
    const def = findAsset(content, owned.assetId)
    if (def) out.push({ owned, def })
  }
  return out
}
