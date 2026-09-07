/* eslint-disable @typescript-eslint/require-await --
 * Os tres metodos sao `async` porque `SaveAdapter` os declara assincronos, e
 * nao porque esperam alguma coisa: o localStorage e sincrono. O contrato existe
 * para o dia em que o adapter falar com IndexedDB ou com a rede, e trocar
 * `async` por `Promise.resolve()` aqui so esconderia isso.
 */
import type { LoadResult, PersistedSave, SaveAdapter, SaveProblem } from './adapter'
import { migrate } from './migrations'

const STORAGE_KEY = 'lifesim.save'

export function createLocalStorageAdapter(key: string = STORAGE_KEY): SaveAdapter {
  return {
    async load(): Promise<LoadResult> {
      let raw: string | null
      try {
        raw = localStorage.getItem(key)
      } catch {
        // Modo privativo ou armazenamento bloqueado: o jogo roda, so nao
        // persiste. Nada se perdeu, e o jogador precisa saber disso.
        return { save: null, problem: { kind: 'unreadable' } }
      }

      if (raw === null) return { save: null, problem: null }

      try {
        const migrado = migrate(JSON.parse(raw))
        // `migrate` devolve null quando a forma nao bate depois da migracao —
        // JSON valido nao garante um save valido.
        if (migrado === null) return { save: null, problem: { kind: 'corrupted', raw } }
        return { save: migrado, problem: null }
      } catch {
        // O texto cru vai junto para o jogador poder baixa-lo: uma vida de
        // setenta anos sumir sem nem a chance de guardar o arquivo e pior que
        // o bug que a corrompeu.
        return { save: null, problem: { kind: 'corrupted', raw } }
      }
    },

    async save(payload: PersistedSave): Promise<SaveProblem | null> {
      try {
        localStorage.setItem(key, JSON.stringify(payload))
        return null
      } catch {
        // Sem espaco ou sem permissao. Antes isto era silencioso, e o jogador
        // descobria que nao estava salvando ao recarregar a pagina.
        return { kind: 'unwritable' }
      }
    },

    async clear() {
      try {
        localStorage.removeItem(key)
      } catch {
        // idem
      }
    },
  }
}
