// Divorcio. Mora fora de `relations.ts` porque `effects.ts` precisa chamar
// isto, e `relations.ts` importa `effects.ts` — o mesmo ciclo que
// `careers-bridge.ts` resolve para a prisao, pela mesma razao.

import {
  ASSET_SALE_HAIRCUT,
  DIVORCE_ASSET_SHARE,
  DIVORCE_EXTRA_COST_WITH_CHILD,
} from './balance'
import { addMoney } from './money-bridge'
import { formatMoney } from './text'
import { makeNote } from './timeline'
import type { GameState, TimelineEntry } from './types'

/**
 * Parte o patrimonio e limpa o estado civil.
 *
 * Vende o que nao da para dividir — carro, apartamento, iate — porque o
 * contrario deixaria o jogador sair de um divorcio com a casa inteira e metade
 * do dinheiro. E o caixa depois da venda que e partido.
 *
 * Quem tem filho paga mais: pensao e duas casas em vez de uma, cobradas de uma
 * vez porque o jogo nao tem despesa recorrente com prazo.
 *
 * O conjuge vira amigo em vez de sumir: gente com quem se viveu vinte anos nao
 * desaparece do mundo, e a relacao guarda o estrago.
 */
export function divorce(state: GameState): TimelineEntry | null {
  const c = state.character
  const conjuge = state.relations.find((p) => p.kind === 'spouse' && p.alive)
  if (!conjuge) return null

  const bruto = c.assets.reduce((sum, asset) => sum + asset.value, 0)
  const arrecadado = Math.round(bruto * (1 - ASSET_SALE_HAIRCUT))
  c.assets = []
  addMoney(c, arrecadado)

  const temFilho = state.relations.some((p) => p.kind === 'child' && p.alive)
  const fatia = DIVORCE_ASSET_SHARE + (temFilho ? DIVORCE_EXTRA_COST_WITH_CHILD : 0)
  const perdido = Math.round(c.money * fatia)
  addMoney(c, -perdido)

  conjuge.kind = 'friend'
  conjuge.relation = Math.max(0, conjuge.relation - 40)
  c.flags['married'] = false

  return makeNote(state, 'O divórcio saiu.', 'relationship', [
    { label: 'Patrimônio', text: `−${formatMoney(perdido)}`, tone: 'bad' },
    ...(bruto > 0 ? [{ label: 'Bens', text: 'vendidos e partidos', tone: 'bad' as const }] : []),
  ])
}
