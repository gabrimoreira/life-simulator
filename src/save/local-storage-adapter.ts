import type { PersistedSave, SaveAdapter } from './adapter'
import { migrate } from './migrations'

const STORAGE_KEY = 'lifesim.save'

export function createLocalStorageAdapter(key: string = STORAGE_KEY): SaveAdapter {
  return {
    async load() {
      try {
        const raw = localStorage.getItem(key)
        if (raw === null) return null
        return migrate(JSON.parse(raw))
      } catch {
        // Save corrompido, quota, modo privativo: comeca do zero em vez de travar.
        return null
      }
    },

    async save(payload: PersistedSave) {
      try {
        localStorage.setItem(key, JSON.stringify(payload))
      } catch {
        // Sem espaco ou sem permissao. O jogo continua, so nao persiste.
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
