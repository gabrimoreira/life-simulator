import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

describe('rng', () => {
  it('produz a mesma sequência para a mesma seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    const seqA = Array.from({ length: 50 }, () => a.next())
    const seqB = Array.from({ length: 50 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produz sequências diferentes para seeds diferentes', () => {
    const a = createRng(1)
    const b = createRng(2)
    expect(a.next()).not.toEqual(b.next())
  })

  it('mantém next() dentro de [0, 1)', () => {
    const rng = createRng(999)
    for (let i = 0; i < 2000; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('int() respeita as duas pontas, inclusive', () => {
    const rng = createRng(7)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(rng.int(1, 3))
    expect([...seen].sort()).toEqual([1, 2, 3])
  })

  it('retoma exatamente de um estado salvo', () => {
    const rng = createRng(42)
    for (let i = 0; i < 10; i++) rng.next()

    const snapshot = rng.getState()
    const expected = Array.from({ length: 20 }, () => rng.next())

    const restored = createRng(0)
    restored.setState(snapshot)
    const actual = Array.from({ length: 20 }, () => restored.next())

    expect(actual).toEqual(expected)
  })

  it('weighted respeita os pesos', () => {
    const rng = createRng(2024)
    const items = [
      { id: 'raro', w: 1 },
      { id: 'comum', w: 99 },
    ]
    let comum = 0
    for (let i = 0; i < 5000; i++) {
      if (rng.weighted(items, (item) => item.w).id === 'comum') comum++
    }
    expect(comum / 5000).toBeGreaterThan(0.95)
  })

  it('weighted ignora itens de peso zero', () => {
    const rng = createRng(5)
    const items = [
      { id: 'zerado', w: 0 },
      { id: 'valido', w: 1 },
    ]
    for (let i = 0; i < 100; i++) {
      expect(rng.weighted(items, (item) => item.w).id).toBe('valido')
    }
  })

  it('rejeita listas vazias em vez de devolver undefined', () => {
    const rng = createRng(1)
    expect(() => rng.pick([])).toThrow()
    expect(() => rng.weighted([], () => 1)).toThrow()
  })
})
