// Ano financeiro: renda da carreira (ou informal), custo de vida e juros.

import {
  AGE_FINANCIALLY_INDEPENDENT,
  CHRONIC_ANNUAL_COST,
  CLASS_PROFILES,
  COST_OF_LIVING_INCOME_SHARE,
  INHERITED_LIFESTYLE_CAP,
  DEBT_CEILING,
  DEBT_INTEREST_RATE,
  DEBT_PAYDOWN_BUFFER_YEARS,
  STUDENT_COST_OF_LIVING_SHARE,
  SPOUSE_COST_FACTOR,
  SPOUSE_INCOME_SHARE,
  SUBSISTENCE_COST,
} from './balance'
import { applyCareerYear } from './careers'
import type { ContentPack } from './content-pack'
import { addMoney } from './effects'
import { FLAG_CHRONIC_CONDITION } from './flags'
import type { Rng } from './rng'
import { formatMoney } from './text'
import type { GameState, TimelineEntry } from './types'

export interface EconomyYear {
  /** Linha de razao do cabecalho do ano, ou null quando nao ha o que mostrar. */
  summary: string | null
  notes: TimelineEntry[]
}

/**
 * Quem ganha mais gasta mais: o custo de vida e o maior entre o piso da classe
 * social e uma fatia da renda. Sem isso, salario alto vira saldo infinito.
 */
export function costOfLiving(state: GameState, income: number): number {
  // O padrao de vida da familia e uma expectativa, nao uma sentenca: ele desce
  // ate o que a renda aguenta, mas nunca abaixo da subsistencia.
  const inherited = CLASS_PROFILES[state.character.socialClass].costOfLiving
  const affordable = Math.max(SUBSISTENCE_COST, income * INHERITED_LIFESTYLE_CAP)
  const floor = Math.min(inherited, affordable)

  const full = Math.max(floor, income * COST_OF_LIVING_INCOME_SHARE)
  const share = state.character.enrollment !== null ? STUDENT_COST_OF_LIVING_SHARE : 1
  // Duas pessoas custam mais que uma. É a contrapartida da renda conjunta:
  // sem ela, casar seria dinheiro de graça.
  const household = hasSpouse(state) ? SPOUSE_COST_FACTOR : 1
  return Math.round(full * share * household)
}

/** Cônjuge vivo. A flag `married` sozinha mente: ela sobrevive à viuvez. */
function hasSpouse(state: GameState): boolean {
  return state.relations.some((person) => person.kind === 'spouse' && person.alive)
}

/**
 * O que o cônjuge põe na mesa.
 *
 * Escala com a relação porque casamento ruim rende menos — gente que não se
 * fala não divide conta direito. Zero para quem não tem cônjuge vivo.
 */
export function spouseIncome(state: GameState, ownIncome: number): number {
  const spouse = state.relations.find((person) => person.kind === 'spouse' && person.alive)
  if (!spouse) return 0
  return Math.round(ownIncome * SPOUSE_INCOME_SHARE * (spouse.relation / 100))
}

export function applyEconomy(state: GameState, rng: Rng, content: ContentPack): EconomyYear {
  const c = state.character
  const profile = CLASS_PROFILES[c.socialClass]

  // Amortiza antes de cobrar juros: quem tem caixa sobrando paga a divida.
  if (c.debt > 0 && c.money > 0) {
    const reserva = SUBSISTENCE_COST * DEBT_PAYDOWN_BUFFER_YEARS
    const disponivel = Math.max(0, c.money - reserva)
    const pago = Math.min(c.debt, disponivel)
    c.money -= pago
    c.debt -= pago
  }

  if (c.debt > 0) {
    c.debt = Math.min(DEBT_CEILING, Math.round(c.debt * (1 + DEBT_INTEREST_RATE)))
  }

  // Antes da independencia financeira nao ha carreira nem custo proprio.
  if (c.age < AGE_FINANCIALLY_INDEPENDENT) {
    if (profile.allowance > 0) addMoney(c, profile.allowance)
    return { summary: null, notes: [] }
  }

  // `applyCareerYear` roda ANTES de checar `c.career` porque ele mesmo pode
  // demitir ou quebrar a empresa no meio do ano — e o salário daquele ano
  // ainda foi ganho.
  const hadCareer = c.career !== null
  const career = applyCareerYear(state, rng, content)
  // Sem carreira, vale o melhor entre a aposentadoria e a informalidade.
  const own = hadCareer ? career.income : Math.max(c.pension, profile.baseIncome)
  const spouse = spouseIncome(state, own)
  const income = own + spouse
  // Doenca cronica nao e so uma marca no Perfil: ela cobra todo ano.
  const medical = c.flags[FLAG_CHRONIC_CONDITION] === true ? CHRONIC_ANNUAL_COST : 0
  // Sobre a renda PROPRIA: o padrão de vida é ditado pela posição de quem
  // vive, e o que o cônjuge traz entra como folga em vez de virar expectativa.
  const cost = costOfLiving(state, own) + medical

  addMoney(c, income - cost)

  const parts = [`Renda ${formatMoney(income)}`, `Custo ${formatMoney(cost)}`]
  if (spouse > 0) parts.splice(1, 0, `Cônjuge ${formatMoney(spouse)}`)
  if (medical > 0) parts.push(`Saúde ${formatMoney(medical)}`)
  if (c.debt > 0) parts.push(`Dívida ${formatMoney(c.debt)}`)

  return { summary: parts.join(' · '), notes: career.notes }
}
