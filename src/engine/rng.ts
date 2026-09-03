// PRNG seedado. Este arquivo e o unico lugar do projeto onde `Math.random`
// pode aparecer, e apenas para sortear a seed de uma vida nova.

export interface Rng {
  /** [0, 1) */
  next(): number
  /** Inteiro em [min, max], inclusivo nas duas pontas. */
  int(min: number, max: number): number
  chance(p: number): boolean
  pick<T>(items: readonly T[]): T
  weighted<T>(items: readonly T[], weight: (item: T) => number): T
  getState(): number
  setState(state: number): void
}

/** mulberry32: estado de 32 bits, serializavel em um unico numero. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,

    int(min, max) {
      if (max < min) throw new Error(`rng.int: intervalo invalido [${min}, ${max}]`)
      return min + Math.floor(next() * (max - min + 1))
    },

    chance(p) {
      return next() < p
    },

    pick(items) {
      if (items.length === 0) throw new Error('rng.pick: lista vazia')
      const item = items[Math.floor(next() * items.length)]
      // `noUncheckedIndexedAccess`: o indice e sempre valido, mas o TS nao sabe.
      if (item === undefined) throw new Error('rng.pick: indice fora do intervalo')
      return item
    },

    weighted(items, weight) {
      if (items.length === 0) throw new Error('rng.weighted: lista vazia')
      let total = 0
      for (const item of items) {
        const w = weight(item)
        if (w > 0) total += w
      }
      if (total <= 0) throw new Error('rng.weighted: peso total nao positivo')

      let roll = next() * total
      for (const item of items) {
        const w = weight(item)
        if (w <= 0) continue
        roll -= w
        if (roll < 0) return item
      }
      // Alcancavel so por erro de ponto flutuante na ultima fatia.
      const last = items[items.length - 1]
      if (last === undefined) throw new Error('rng.weighted: lista vazia')
      return last
    },

    getState() {
      return state
    },

    setState(s) {
      state = s >>> 0
    },
  }
}

/** Unica chamada a `Math.random` do projeto: seed de uma vida nova. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}
