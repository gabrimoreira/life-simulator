// Interface de persistencia. localStorage hoje, IndexedDB depois, sem tocar
// no store. Assincrona desde ja justamente por isso.

import type { GameState } from '../engine/types'

export const CURRENT_SAVE_VERSION = 3

export interface PersistedSave {
  saveVersion: number
  savedAt: number
  state: GameState
}

export interface SaveAdapter {
  load(): Promise<PersistedSave | null>
  save(payload: PersistedSave): Promise<void>
  clear(): Promise<void>
}
