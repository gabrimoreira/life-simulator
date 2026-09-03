// Interpolacao de tokens no texto do conteudo.
//
// Concordancia de genero em pt-BR nao pode virar ramificacao no dado, entao o
// autor escreve o sufixo como token: "Voce foi promovid{o}" vira "promovida"
// para uma personagem mulher.

import type { GameState } from './types'

export const KNOWN_TOKENS = [
  'name',
  'city',
  'uf',
  'age',
  'money',
  'mother',
  'father',
  // concordancia de genero
  'o',
  'ele',
  'Ele',
  'dele',
  'um',
] as const

export type TokenName = (typeof KNOWN_TOKENS)[number]

const TOKEN_PATTERN = /\{(\w+)\}/g

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function formatMoney(value: number): string {
  return moneyFormatter.format(Math.round(value))
}

function relationName(state: GameState, kind: 'mother' | 'father'): string {
  const person = state.relations.find((r) => r.kind === kind)
  return person?.name ?? (kind === 'mother' ? 'sua mãe' : 'seu pai')
}

function resolve(token: string, state: GameState): string | null {
  const isMale = state.character.gender === 'male'

  switch (token) {
    case 'name':
      return state.character.name
    case 'city':
      return state.character.city
    case 'uf':
      return state.character.uf
    case 'age':
      return String(state.character.age)
    case 'money':
      return formatMoney(state.character.money)
    case 'mother':
      return relationName(state, 'mother')
    case 'father':
      return relationName(state, 'father')
    case 'o':
      return isMale ? 'o' : 'a'
    case 'ele':
      return isMale ? 'ele' : 'ela'
    case 'Ele':
      return isMale ? 'Ele' : 'Ela'
    case 'dele':
      return isMale ? 'dele' : 'dela'
    case 'um':
      return isMale ? 'um' : 'uma'
    default:
      return null
  }
}

/** Tokens desconhecidos passam intactos; `validate.ts` os pega nos testes. */
export function interpolate(text: string, state: GameState): string {
  return text.replace(TOKEN_PATTERN, (match, token: string) => resolve(token, state) ?? match)
}

/** Tokens presentes num texto, para validacao de conteudo. */
export function extractTokens(text: string): string[] {
  return [...text.matchAll(TOKEN_PATTERN)].map((m) => m[1] ?? '')
}
