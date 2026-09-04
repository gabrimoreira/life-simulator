// O adapter nunca teve teste. Ele engolia três falhas diferentes em silêncio,
// e a pior delas — save corrompido — fazia o jogador perder uma vida de
// setenta anos e cair na tela de novo jogo sem nenhuma explicação.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CURRENT_SAVE_VERSION } from './adapter'
import type { PersistedSave } from './adapter'
import { createLocalStorageAdapter } from './local-storage-adapter'
import { makeCharacter, makeState } from '../test/fixtures'

const KEY = 'teste.save'

function saveValido(): PersistedSave {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    savedAt: Date.now(),
    state: makeState({ character: makeCharacter({ name: 'Original' }) }),
  }
}

/** localStorage de mentira, para poder falhar de propósito. */
function instalarStorage(overrides: Partial<Storage> = {}): Map<string, string> {
  const dados = new Map<string, string>()
  const base: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
    getItem: (k) => dados.get(k) ?? null,
    setItem: (k, v) => void dados.set(k, v),
    removeItem: (k) => void dados.delete(k),
  }
  vi.stubGlobal('localStorage', { ...base, ...overrides })
  return dados
}

beforeEach(() => void instalarStorage())
afterEach(() => void vi.unstubAllGlobals())

describe('leitura', () => {
  it('sem save nenhum não é problema nenhum', () => {
    // A distinção que o tipo existe para fazer: "primeira vez que abre o jogo"
    // não é a mesma coisa que "havia uma vida e ela se perdeu".
    return createLocalStorageAdapter(KEY)
      .load()
      .then((r) => {
        expect(r.save).toBeNull()
        expect(r.problem).toBeNull()
      })
  })

  it('devolve o save que estava lá', async () => {
    const dados = instalarStorage()
    dados.set(KEY, JSON.stringify(saveValido()))

    const { save, problem } = await createLocalStorageAdapter(KEY).load()
    expect(problem).toBeNull()
    expect(save?.state.character.name).toBe('Original')
  })

  it('JSON quebrado vira `corrupted`, com o texto cru junto', async () => {
    const dados = instalarStorage()
    dados.set(KEY, '{isso não é json')

    const { save, problem } = await createLocalStorageAdapter(KEY).load()
    expect(save).toBeNull()
    expect(problem?.kind).toBe('corrupted')
    // O texto cru vai junto porque perder a vida sem nem a chance de guardar o
    // arquivo é pior que o bug que a corrompeu.
    if (problem?.kind === 'corrupted') expect(problem.raw).toBe('{isso não é json')
  })

  it('JSON válido com forma errada também é `corrupted`', async () => {
    // JSON que abre não é save que serve: a checagem de forma roda depois da
    // migração, e é ela que decide.
    const dados = instalarStorage()
    dados.set(KEY, JSON.stringify({ saveVersion: 6, savedAt: 1, state: { nada: true } }))

    const { save, problem } = await createLocalStorageAdapter(KEY).load()
    expect(save).toBeNull()
    expect(problem?.kind).toBe('corrupted')
  })

  it('armazenamento bloqueado vira `unreadable`, e não `corrupted`', async () => {
    // Modo privativo não perdeu nada: só não vai guardar. Confundir os dois
    // faria o jogo dizer que a vida se perdeu quando ela nunca existiu.
    instalarStorage({
      getItem: () => {
        throw new Error('bloqueado')
      },
    })

    const { save, problem } = await createLocalStorageAdapter(KEY).load()
    expect(save).toBeNull()
    expect(problem?.kind).toBe('unreadable')
  })
})

describe('escrita', () => {
  it('gravar com sucesso não devolve problema', async () => {
    const problem = await createLocalStorageAdapter(KEY).save(saveValido())
    expect(problem).toBeNull()
  })

  it('quota estourada vira `unwritable` em vez de silêncio', async () => {
    // Antes isto era engolido, e o jogador descobria que não estava salvando
    // ao recarregar a página — quando já era tarde.
    instalarStorage({
      setItem: () => {
        throw new Error('quota')
      },
    })

    const problem = await createLocalStorageAdapter(KEY).save(saveValido())
    expect(problem?.kind).toBe('unwritable')
  })

  it('o que foi gravado volta igual', async () => {
    const adapter = createLocalStorageAdapter(KEY)
    await adapter.save(saveValido())
    const { save } = await adapter.load()
    expect(save?.state.character.name).toBe('Original')
  })

  it('clear apaga', async () => {
    const adapter = createLocalStorageAdapter(KEY)
    await adapter.save(saveValido())
    await adapter.clear()
    const { save, problem } = await adapter.load()
    expect(save).toBeNull()
    expect(problem).toBeNull()
  })
})
