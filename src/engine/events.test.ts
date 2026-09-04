import { describe, expect, it } from 'vitest'
import { makeCharacter, makeContent, makeEvent, makeState } from '../test/fixtures'
import { effectiveChance, eligibleEvents, pickOutcome, selectEvents } from './events'
import { createRng } from './rng'
import { STAT_KEYS } from './types'
import type { Outcome, StatKey } from './types'

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

describe('viés de atributo nos outcomes', () => {
  /** Só os atributos importam aqui; o resto do personagem não entra na conta. */
  const stats = (partial: Partial<Record<StatKey, number>>): Record<StatKey, number> =>
    Object.fromEntries(STAT_KEYS.map((key) => [key, partial[key] ?? 50])) as Record<
      StatKey,
      number
    >

  const good: Outcome = { chance: 0.5, bias: { luck: 1 }, text: 'bom', effects: [] }
  const neutral: Outcome = { chance: 0.5, text: 'neutro', effects: [] }

  it('atributo 50 é neutro', () => {
    expect(effectiveChance(good, stats({ luck: 50 }))).toBeCloseTo(0.5)
  })

  it('atributo alto aumenta o peso de quem tem viés positivo', () => {
    expect(effectiveChance(good, stats({ luck: 100 }))).toBeCloseTo(1.0)
  })

  it('atributo baixo reduz, sem passar de zero', () => {
    expect(effectiveChance(good, stats({ luck: 0 }))).toBeCloseTo(0)
    expect(effectiveChance({ ...good, bias: { luck: 3 } }, stats({ luck: 0 }))).toBe(0)
  })

  it('outcome sem viés não é afetado', () => {
    expect(effectiveChance(neutral, stats({ luck: 0 }))).toBe(0.5)
    expect(effectiveChance(neutral, stats({ luck: 100 }))).toBe(0.5)
  })

  // O ponto da Fase 8: a Sorte deixou de ser o único atributo capaz de pesar.
  it('qualquer atributo pode enviesar, não só a sorte', () => {
    const negociacao: Outcome = { chance: 0.4, bias: { charisma: 0.5 }, text: 'ok', effects: [] }
    expect(effectiveChance(negociacao, stats({ charisma: 100 }))).toBeCloseTo(0.6)
    expect(effectiveChance(negociacao, stats({ charisma: 0 }))).toBeCloseTo(0.2)
    // Sorte alta não compra o que era para ser conversa.
    expect(effectiveChance(negociacao, stats({ luck: 100 }))).toBeCloseTo(0.4)
  })

  it('vieses de atributos diferentes somam', () => {
    const flerte: Outcome = {
      chance: 0.5,
      bias: { looks: 0.4, charisma: 0.4 },
      text: 'ok',
      effects: [],
    }
    expect(effectiveChance(flerte, stats({ looks: 100, charisma: 100 }))).toBeCloseTo(0.9)
    // Um compensa o outro: bonito e sem conversa fica no meio.
    expect(effectiveChance(flerte, stats({ looks: 100, charisma: 0 }))).toBeCloseTo(0.5)
  })

  it('peso negativo faz o atributo alto atrapalhar', () => {
    const anonimato: Outcome = { chance: 0.5, bias: { fame: -0.6 }, text: 'ok', effects: [] }
    expect(effectiveChance(anonimato, stats({ fame: 100 }))).toBeCloseTo(0.2)
  })

  it('muda a distribuição real do sorteio', () => {
    const option = { text: 'x', outcomes: [good, neutral] }
    const count = (luck: number): number => {
      const rng = createRng(9)
      let bons = 0
      for (let i = 0; i < 3000; i++) {
        if (pickOutcome(option, stats({ luck }), rng).text === 'bom') bons++
      }
      return bons
    }
    expect(count(100)).toBeGreaterThan(count(0))
  })

  it('opção de um único outcome não consome o rng', () => {
    const rng = createRng(5)
    const before = rng.getState()
    pickOutcome({ text: 'x', outcomes: [neutral] }, stats({}), rng)
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
