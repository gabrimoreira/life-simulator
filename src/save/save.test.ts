import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { createGame } from '../engine/generate'
import { advanceYear } from '../engine/turn'
import { CURRENT_SAVE_VERSION } from './adapter'
import type { PersistedSave } from './adapter'
import { migrate } from './migrations'

function makeSave(): PersistedSave {
  const state = createGame(
    { name: 'Teste', gender: 'female', seed: 42, birthYear: 2000 },
    GAME_CONTENT,
  )
  advanceYear(state, GAME_CONTENT)
  return { saveVersion: CURRENT_SAVE_VERSION, savedAt: 1_700_000_000, state }
}

describe('migrate', () => {
  it('faz round-trip de um save válido sem perder nada', () => {
    const original = makeSave()
    const restored = migrate(JSON.parse(JSON.stringify(original)))
    expect(restored).toEqual(original)
  })

  it('preserva o estado do rng, que é o que reproduz a vida', () => {
    const original = makeSave()
    const restored = migrate(JSON.parse(JSON.stringify(original)))
    expect(restored?.state.rngState).toBe(original.state.rngState)
    expect(restored?.state.seed).toBe(original.state.seed)
  })

  it('rejeita lixo em vez de devolver um estado meio montado', () => {
    expect(migrate(null)).toBeNull()
    expect(migrate('texto')).toBeNull()
    expect(migrate({})).toBeNull()
    expect(migrate({ saveVersion: 1 })).toBeNull()
    expect(migrate({ saveVersion: 1, state: { seed: 1 } })).toBeNull()
  })

  it('rejeita save de versão futura', () => {
    const save = makeSave()
    expect(migrate({ ...save, saveVersion: CURRENT_SAVE_VERSION + 1 })).toBeNull()
  })
})

describe('economia de longo prazo', () => {
  it('a dívida não explode ao longo de uma vida inteira', () => {
    // Juros compostos sem teto transformavam um financiamento estudantil em
    // dezenas de milhões, deixando o patrimônio final sem significado nenhum.
    const state = createGame(
      { name: 'Endividada', gender: 'female', seed: 8, birthYear: 2000 },
      GAME_CONTENT,
    )
    state.character.debt = 90_000
    for (let i = 0; i < 70; i++) {
      if (!state.character.alive) break
      advanceYear(state, GAME_CONTENT)
      state.pendingEventIds = []
    }
    expect(state.character.debt).toBeLessThanOrEqual(400_000)
  })
})

describe('compatibilidade de forma', () => {
  it('rejeita save v1 antigo, sem lastFiredYear, em vez de quebrar no turno', () => {
    const save = makeSave()
    const stale = JSON.parse(JSON.stringify(save))
    delete stale.state.lastFiredYear
    expect(migrate(stale)).toBeNull()
  })
})
