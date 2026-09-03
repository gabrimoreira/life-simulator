// Migracao de save. A v1 e identidade, mas o caminho existe desde o dia um:
// e muito mais barato do que descobrir que precisava dele com jogadores ativos.

import type { GameState } from '../engine/types'
import { CURRENT_SAVE_VERSION } from './adapter'
import type { PersistedSave } from './adapter'

type Migration = (state: GameState) => GameState

/** De `versao` para `versao + 1`. */
const MIGRATIONS: Record<number, Migration> = {
  // 1: (state) => ({ ...state, campoNovo: valorPadrao }),
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Checagem de forma minima: save corrompido vira `null`, nunca um crash. */
function looksLikeState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  return (
    typeof value['seed'] === 'number' &&
    typeof value['rngState'] === 'number' &&
    typeof value['year'] === 'number' &&
    isRecord(value['character']) &&
    isRecord(value['lastFiredYear']) &&
    Array.isArray(value['timeline']) &&
    Array.isArray(value['relations'])
  )
}

/** Normaliza qualquer save conhecido para a versao atual. */
export function migrate(raw: unknown): PersistedSave | null {
  if (!isRecord(raw)) return null

  const version = typeof raw['saveVersion'] === 'number' ? raw['saveVersion'] : 0
  if (version < 1 || version > CURRENT_SAVE_VERSION) return null
  if (!looksLikeState(raw['state'])) return null

  let state = raw['state']
  for (let v = version; v < CURRENT_SAVE_VERSION; v++) {
    const step = MIGRATIONS[v]
    if (!step) return null
    state = step(state)
  }

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: typeof raw['savedAt'] === 'number' ? raw['savedAt'] : 0,
    state,
  }
}
