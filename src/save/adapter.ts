// Interface de persistencia. localStorage hoje, IndexedDB depois, sem tocar
// no store. Assincrona desde ja justamente por isso.

import type { GameState } from '../engine/types'

export const CURRENT_SAVE_VERSION = 6

export interface PersistedSave {
  saveVersion: number
  savedAt: number
  state: GameState
}

/**
 * Por que uma leitura ou escrita falhou.
 *
 * - `corrupted`: existia um save e nao deu para entender. A vida se perdeu.
 * - `unreadable` / `unwritable`: o navegador nao deixou. Modo privativo, quota
 *   estourada, armazenamento bloqueado. Nada se perdeu ainda, mas nada esta
 *   sendo guardado.
 */
export type SaveProblem =
  | { kind: 'corrupted'; raw: string }
  | { kind: 'unreadable' }
  | { kind: 'unwritable' }

/**
 * Resultado de uma leitura.
 *
 * `save: null` com `problem: null` significa "nao havia save nenhum", que e o
 * caso normal de quem abre o jogo pela primeira vez — diferente de "havia um
 * save e ele se perdeu", que e a distincao que este tipo existe para fazer.
 * Antes as duas situacoes devolviam `null` e o jogador nao era avisado de nada.
 */
export interface LoadResult {
  save: PersistedSave | null
  problem: SaveProblem | null
}

export interface SaveAdapter {
  load(): Promise<LoadResult>
  save(payload: PersistedSave): Promise<SaveProblem | null>
  clear(): Promise<void>
}
