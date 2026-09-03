import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { skipPendingEvents } from '../test/fixtures'
import { createGame } from '../engine/generate'
import { advanceYear } from '../engine/turn'
import { ACTION_POINTS_PER_TURN } from '../engine/balance'
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
      skipPendingEvents(state)
    }
    expect(state.character.debt).toBeLessThanOrEqual(400_000)
  })
})

describe('compatibilidade de forma', () => {
  it('rejeita save sem lastFiredYear em vez de quebrar no turno', () => {
    const save = makeSave()
    const stale = JSON.parse(JSON.stringify(save))
    delete stale.state.lastFiredYear
    expect(migrate(stale)).toBeNull()
  })
})

describe('migração v3 -> v4', () => {
  /** Um save v3 é o v4 sem nada que a Fase 4 acrescentou. */
  function v3Save(): Record<string, unknown> {
    const save = JSON.parse(JSON.stringify(makeSave()))
    delete save.state.achievements
    delete save.state.character.pension
    delete save.state.character.prison
    return { ...save, saveVersion: 3 }
  }

  it('preenche pensão, prisão e conquistas', () => {
    const depois = migrate(v3Save())
    expect(depois?.saveVersion).toBe(CURRENT_SAVE_VERSION)
    expect(depois?.state.character.pension).toBe(0)
    expect(depois?.state.character.prison).toBeNull()
    expect(depois?.state.achievements).toEqual([])
  })

  it('sem pensão numérica o saldo virava NaN no primeiro ano', () => {
    const migrado = migrate(v3Save())
    if (!migrado) throw new Error('migração falhou')
    migrado.state.character.career = null
    advanceYear(migrado.state, GAME_CONTENT)
    expect(Number.isFinite(migrado.state.character.money)).toBe(true)
  })
})

describe('migração v2 -> v3', () => {
  /** Um save v2 é o v3 sem nada que a Fase 3 acrescentou. */
  function v2Save(): Record<string, unknown> {
    const save = JSON.parse(JSON.stringify(makeSave()))
    delete save.state.lastRelationActionYear
    delete save.state.character.assets
    return { ...save, saveVersion: 2 }
  }

  it('preenche bens e cooldown de relação sem perder o resto', () => {
    const depois = migrate(v2Save())
    expect(depois?.saveVersion).toBe(CURRENT_SAVE_VERSION)
    expect(depois?.state.character.assets).toEqual([])
    expect(depois?.state.lastRelationActionYear).toEqual({})
    expect(depois?.state.character.pension).toBe(0)
    expect(depois?.state.achievements).toEqual([])
    expect(depois?.state.character.name).toBe(makeSave().state.character.name)
  })

  it('o save migrado continua jogável', () => {
    const migrado = migrate(v2Save())
    if (!migrado) throw new Error('migração falhou')
    expect(() => {
      advanceYear(migrado.state, GAME_CONTENT)
    }).not.toThrow()
  })
})

describe('migração v1 -> v4, em cadeia', () => {
  /** Um save v1 é o v2 sem nada que a Fase 2 acrescentou. */
  function v1Save(): Record<string, unknown> {
    const save = JSON.parse(JSON.stringify(makeSave()))
    delete save.state.actionPoints
    delete save.state.lastActionYear
    delete save.state.character.career
    delete save.state.character.enrollment
    delete save.state.character.stats.fame
    delete save.state.character.careerHistory
    delete save.state.character.assets
    delete save.state.lastRelationActionYear
    delete save.state.achievements
    delete save.state.character.pension
    delete save.state.character.prison
    return { ...save, saveVersion: 1 }
  }

  it('preenche os campos novos sem perder o que já existia', () => {
    const antes = v1Save() as { state: { character: { name: string }; seed: number } }
    const depois = migrate(v1Save())

    expect(depois?.saveVersion).toBe(CURRENT_SAVE_VERSION)
    expect(depois?.state.actionPoints).toBe(ACTION_POINTS_PER_TURN)
    expect(depois?.state.lastActionYear).toEqual({})
    expect(depois?.state.character.career).toBeNull()
    expect(depois?.state.character.enrollment).toBeNull()
    // A cadeia inteira roda: v1 -> v2 -> v3.
    expect(depois?.state.character.assets).toEqual([])
    expect(depois?.state.lastRelationActionYear).toEqual({})
    expect(depois?.state.character.pension).toBe(0)
    expect(depois?.state.achievements).toEqual([])
    // Ninguém era famoso antes de a fama existir.
    expect(depois?.state.character.stats.fame).toBe(0)
    // E nada do save antigo se perdeu no caminho.
    expect(depois?.state.character.name).toBe(antes.state.character.name)
    expect(depois?.state.seed).toBe(antes.state.seed)
  })

  it('o save migrado continua jogável', () => {
    const migrado = migrate(v1Save())
    if (!migrado) throw new Error('migração falhou')
    expect(() => {
      advanceYear(migrado.state, GAME_CONTENT)
    }).not.toThrow()
    expect(migrado.state.character.age).toBeGreaterThan(0)
  })

  it('um save na versão atual passa direto, sem migração', () => {
    const save = makeSave()
    expect(migrate(JSON.parse(JSON.stringify(save)))).toEqual(save)
  })
})
