// Economia da Fase 1: mesada ate os 18, depois renda informal menos custo de
// vida, tudo derivado da classe social. Carreiras entram na Fase 2.

import {
  AGE_FINANCIALLY_INDEPENDENT,
  CLASS_PROFILES,
  DEBT_CEILING,
  DEBT_INTEREST_RATE,
} from './balance'
import { addMoney } from './effects'
import { formatMoney } from './text'
import type { GameState } from './types'

/** Aplica o ano financeiro e devolve a linha de razao do cabecalho do ano. */
export function applyEconomy(state: GameState): string | null {
  const c = state.character
  const profile = CLASS_PROFILES[c.socialClass]

  if (c.debt > 0) {
    c.debt = Math.min(DEBT_CEILING, Math.round(c.debt * (1 + DEBT_INTEREST_RATE)))
  }

  if (c.age < AGE_FINANCIALLY_INDEPENDENT) {
    if (profile.allowance <= 0) return null
    addMoney(c, profile.allowance)
    return null // mesada nao merece linha de razao
  }

  const income = profile.baseIncome
  const cost = profile.costOfLiving
  addMoney(c, income - cost)

  const parts = [`Renda ${formatMoney(income)}`, `Custo ${formatMoney(cost)}`]
  if (c.debt > 0) parts.push(`Dívida ${formatMoney(c.debt)}`)
  return parts.join(' · ')
}
