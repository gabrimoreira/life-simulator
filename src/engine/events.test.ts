import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeEvent, makeState } from '../test/fixtures'
import { effectiveChance, eligibleEvents, pickOutcome, selectEvents } from './events'
import { createRng } from './rng'
import type { Outcome } from './types'

describe('eligibleEvents', () => {
  it('filtra por condições', () => {
    const content = makeContent([
      makeEvent({ id: 'crianca', conditions: [{ type: 'age', max: 12 }] }),
      makeEvent({ id: 'adulto', conditions: [{ type: 'age', min: 18 }] }),
    ])
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    expect(eligibleEvents(state, content).map((e) => e.id)).toEqual(['adulto'])
  })

  it('não repete evento marcado como once', () => {
    const content = makeContent([makeEvent({ id: 'unico', once: true })])
    const state = makeState({ firedEventIds: ['unico'] })
    expect(eligibleEvents(state, content)).toHaveLength(0)
  })

  it('repete evento sem once', () => {
    const content = makeContent([makeEvent({ id: 'repetivel' })])
    const state = makeState({ firedEventIds: ['repetivel'] })
    expect(eligibleEvents(state, content)).toHaveLength(1)
  })

  it('respeita a lista de exclusão do turno', () => {
    const content = makeContent([makeEvent({ id: 'a' }), makeEvent({ id: 'b' })])
    const state = makeState()
    expect(eligibleEvents(state, content, new Set(['a'])).map((e) => e.id)).toEqual(['b'])
  })
})

describe('selectEvents', () => {
  it('não sorteia o mesmo evento duas vezes no turno', () => {
    const content = makeContent([makeEvent({ id: 'a' }), makeEvent({ id: 'b' })])
    const chosen = selectEvents(makeState(), createRng(1), content, 2)
    expect(new Set(chosen.map((e) => e.id)).size).toBe(2)
  })

  it('devolve menos que o pedido quando o pool acaba', () => {
    const content = makeContent([makeEvent({ id: 'a' })])
    expect(selectEvents(makeState(), createRng(1), content, 3)).toHaveLength(1)
  })

  it('devolve vazio quando nada é elegível, sem quebrar', () => {
    const content = makeContent([makeEvent({ conditions: [{ type: 'age', min: 90 }] })])
    expect(selectEvents(makeState(), createRng(1), content, 3)).toEqual([])
  })

  it('é determinístico para a mesma seed', () => {
    const content = makeContent(
      Array.from({ length: 10 }, (_, i) => makeEvent({ id: `e${i}`, weight: i + 1 })),
    )
    const a = selectEvents(makeState(), createRng(77), content, 3).map((e) => e.id)
    const b = selectEvents(makeState(), createRng(77), content, 3).map((e) => e.id)
    expect(a).toEqual(b)
  })

  it('favorece eventos de peso alto', () => {
    const content = makeContent([
      makeEvent({ id: 'raro', weight: 1 }),
      makeEvent({ id: 'comum', weight: 50 }),
    ])
    const rng = createRng(3)
    let comum = 0
    for (let i = 0; i < 1000; i++) {
      if (selectEvents(makeState(), rng, content, 1)[0]?.id === 'comum') comum++
    }
    expect(comum).toBeGreaterThan(900)
  })
})

describe('viés de sorte nos outcomes', () => {
  const good: Outcome = { chance: 0.5, luckBias: 1, text: 'bom', effects: [] }
  const neutral: Outcome = { chance: 0.5, text: 'neutro', effects: [] }

  it('sorte 50 é neutra', () => {
    expect(effectiveChance(good, 50)).toBeCloseTo(0.5)
  })

  it('sorte alta aumenta o peso de quem tem luckBias positivo', () => {
    expect(effectiveChance(good, 100)).toBeCloseTo(1.0)
  })

  it('sorte baixa reduz, sem passar de zero', () => {
    expect(effectiveChance(good, 0)).toBeCloseTo(0)
    expect(effectiveChance({ ...good, luckBias: 3 }, 0)).toBe(0)
  })

  it('outcome sem luckBias não é afetado', () => {
    expect(effectiveChance(neutral, 0)).toBe(0.5)
    expect(effectiveChance(neutral, 100)).toBe(0.5)
  })

  it('muda a distribuição real do sorteio', () => {
    const option = { text: 'x', outcomes: [good, neutral] }
    const count = (luck: number): number => {
      const rng = createRng(9)
      let bons = 0
      for (let i = 0; i < 3000; i++) {
        if (pickOutcome(option, luck, rng).text === 'bom') bons++
      }
      return bons
    }
    expect(count(100)).toBeGreaterThan(count(0))
  })

  it('opção de um único outcome não consome o rng', () => {
    const rng = createRng(5)
    const before = rng.getState()
    pickOutcome({ text: 'x', outcomes: [neutral] }, 50, rng)
    expect(rng.getState()).toBe(before)
  })
})

describe('cooldown', () => {
  it('bloqueia o evento durante a janela e libera depois', () => {
    const content = makeContent([makeEvent({ id: 'promocao', cooldown: 5 })])
    const state = makeState({ year: 2030, lastFiredYear: { promocao: 2028 } })
    expect(eligibleEvents(state, content)).toHaveLength(0)

    state.year = 2033
    expect(eligibleEvents(state, content)).toHaveLength(1)
  })

  it('evento sem cooldown nunca é bloqueado por isso', () => {
    const content = makeContent([makeEvent({ id: 'livre' })])
    const state = makeState({ year: 2030, lastFiredYear: { livre: 2029 } })
    expect(eligibleEvents(state, content)).toHaveLength(1)
  })
})
