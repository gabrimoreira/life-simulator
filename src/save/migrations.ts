// Migração de save. A v1 era identidade; a v2 acrescentou carreira, matrícula,
// fama e pontos de ação; a v3 trouxe bens e ações de relação.
//
// As migrações rodam sobre o JSON cru e a checagem de forma acontece DEPOIS,
// sobre o resultado. Fazer o contrário obrigaria a manter o tipo de cada
// versão antiga do GameState vivo no código para sempre.

import { ACTION_POINTS_PER_TURN } from '../engine/balance'
import type { GameState } from '../engine/types'
import { CURRENT_SAVE_VERSION } from './adapter'
import type { PersistedSave } from './adapter'

type RawState = Record<string, unknown>

/** De `versao` para `versao + 1`. */
const MIGRATIONS: Record<number, (state: RawState) => RawState> = {
  1: (state) => {
    const character = isRecord(state['character']) ? { ...state['character'] } : {}
    const stats = isRecord(character['stats']) ? { ...character['stats'] } : {}

    return {
      ...state,
      actionPoints: ACTION_POINTS_PER_TURN,
      lastActionYear: {},
      character: {
        ...character,
        // Ninguém era famoso antes de a fama existir.
        stats: { ...stats, fame: 0 },
        career: null,
        careerHistory: {},
        enrollment: null,
      },
    }
  },

  2: (state) => {
    const character = isRecord(state['character']) ? { ...state['character'] } : {}
    return {
      ...state,
      lastRelationActionYear: {},
      // Ninguém tinha bens antes de existirem bens.
      character: { ...character, assets: [] },
    }
  },
}

function isRecord(value: unknown): value is RawState {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Checagem de forma mínima: save corrompido vira `null`, nunca um crash. */
function looksLikeState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  const character = value['character']
  if (!isRecord(character)) return false

  return (
    typeof value['seed'] === 'number' &&
    typeof value['rngState'] === 'number' &&
    typeof value['year'] === 'number' &&
    typeof value['actionPoints'] === 'number' &&
    isRecord(value['lastFiredYear']) &&
    isRecord(value['lastActionYear']) &&
    isRecord(value['lastRelationActionYear']) &&
    Array.isArray(character['assets']) &&
    isRecord(character['stats']) &&
    typeof (character['stats'] as RawState)['fame'] === 'number' &&
    'career' in character &&
    isRecord(character['careerHistory']) &&
    'enrollment' in character &&
    Array.isArray(value['timeline']) &&
    Array.isArray(value['relations'])
  )
}

/** Normaliza qualquer save conhecido para a versão atual. */
export function migrate(raw: unknown): PersistedSave | null {
  if (!isRecord(raw)) return null

  const version = typeof raw['saveVersion'] === 'number' ? raw['saveVersion'] : 0
  if (version < 1 || version > CURRENT_SAVE_VERSION) return null
  if (!isRecord(raw['state'])) return null

  let state: RawState = raw['state']
  for (let v = version; v < CURRENT_SAVE_VERSION; v++) {
    const step = MIGRATIONS[v]
    if (!step) return null
    state = step(state)
  }

  if (!looksLikeState(state)) return null

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: typeof raw['savedAt'] === 'number' ? raw['savedAt'] : 0,
    state,
  }
}
