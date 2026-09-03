import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { makeContent, makeEvent } from '../test/fixtures'
import type { ContentPack } from './content-pack'
import { firstFailure } from './conditions'
import { createGame } from './generate'
import { createRng } from './rng'
import { advanceYear, chooseOption, currentEvent } from './turn'
import type { GameEvent, GameState } from './types'

/** Estratégia determinística: a primeira opção que o personagem pode pagar. */
function firstAllowedOption(event: GameEvent, state: GameState): number {
  for (let i = 0; i < event.options.length; i++) {
    const option = event.options[i]
    if (!option) continue
    if (!option.requirements || firstFailure(option.requirements, state) === null) return i
  }
  throw new Error(`evento "${event.id}" não tem nenhuma opção disponível`)
}

function resolvePending(state: GameState, content: ContentPack): void {
  let guard = 0
  while (state.pendingEventIds.length > 0) {
    if (guard++ > 50) throw new Error('fila de eventos não esvaziou')
    const event = currentEvent(state, content)
    if (!event) throw new Error('evento pendente sem definição no conteúdo')
    chooseOption(state, content, firstAllowedOption(event, state))
  }
}

/** Jogador realista: escolhe ao acaso entre as opções que pode pagar. */
function playLifeRandomly(seed: number): GameState {
  const content = GAME_CONTENT
  const state = createGame({ name: 'Teste', gender: 'female', seed, birthYear: 2000 }, content)
  const player = createRng(seed ^ 0xabcdef)
  let guard = 0

  while (state.character.alive) {
    if (guard++ > 200) throw new Error('vida não terminou')
    advanceYear(state, content)
    while (state.pendingEventIds.length > 0) {
      const event = currentEvent(state, content)
      if (!event) throw new Error('evento pendente sem definição no conteúdo')
      const allowed: number[] = []
      for (let i = 0; i < event.options.length; i++) {
        const option = event.options[i]
        if (!option) continue
        if (!option.requirements || firstFailure(option.requirements, state) === null) allowed.push(i)
      }
      chooseOption(state, content, player.pick(allowed))
    }
  }
  return state
}

function playLife(seed: number, content: ContentPack = GAME_CONTENT): GameState {
  const state = createGame({ name: 'Teste', gender: 'female', seed, birthYear: 2000 }, content)
  let guard = 0
  while (state.character.alive) {
    if (guard++ > 200) throw new Error('vida não terminou')
    advanceYear(state, content)
    resolvePending(state, content)
  }
  return state
}

describe('ciclo de vida', () => {
  it('nasce, vive e morre', () => {
    const state = playLife(1234)
    expect(state.character.alive).toBe(false)
    expect(state.character.deathCause).toBeTruthy()
    expect(state.character.deathAge).toBeGreaterThan(0)
    expect(state.timeline.at(-1)?.kind).toBe('death')
  })

  it('registra um cabeçalho de ano por ano vivido', () => {
    const state = playLife(99)
    const years = state.timeline.filter((entry) => entry.kind === 'year')
    // +1 porque o nascimento também tem cabeçalho.
    expect(years).toHaveLength((state.character.deathAge ?? 0) + 1)
  })

  it('não avança depois da morte', () => {
    const state = playLife(7)
    const before = state.timeline.length
    advanceYear(state, GAME_CONTENT)
    expect(state.timeline.length).toBe(before)
  })

  it('fecha o turno sozinho quando nenhum evento é elegível', () => {
    const content = makeContent([makeEvent({ conditions: [{ type: 'age', min: 200 }] })])
    const state = createGame({ name: 'X', gender: 'male', seed: 1, birthYear: 2000 }, content)
    advanceYear(state, content)
    expect(state.pendingEventIds).toEqual([])
    expect(state.turnPhase).toBe('idle')
  })

  it('bloqueia a escolha de uma opção sem requisitos atendidos', () => {
    const content = makeContent([
      makeEvent({
        id: 'caro',
        options: [
          {
            text: 'Comprar',
            requirements: [{ type: 'money', min: 10_000_000 }],
            outcomes: [{ chance: 1, text: 'ok', effects: [] }],
          },
          { text: 'Deixar', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
        ],
      }),
    ])
    const state = createGame({ name: 'X', gender: 'male', seed: 3, birthYear: 2000 }, content)
    advanceYear(state, content)
    expect(state.pendingEventIds).toHaveLength(1)
    expect(() => chooseOption(state, content, 0)).toThrow(/bloqueada/)
  })

  it('morte no meio do turno descarta os eventos restantes', () => {
    const content = makeContent([
      makeEvent({
        id: 'fatal',
        weight: 100,
        options: [
          {
            text: 'Morrer',
            outcomes: [{ chance: 1, text: 'Fim.', effects: [{ type: 'death', cause: 'teste' }] }],
          },
          { text: 'Viver', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
        ],
      }),
      makeEvent({ id: 'outro', weight: 100 }),
    ])
    const state = createGame({ name: 'X', gender: 'male', seed: 11, birthYear: 2000 }, content)

    // Fila montada à mão: esperar o sorteio colocar o evento fatal na frente
    // amarraria o teste à sequência exata do rng, que muda a cada ajuste de
    // geração de personagem.
    advanceYear(state, content)
    state.pendingEventIds = ['fatal', 'outro']
    state.turnPhase = 'resolving'

    chooseOption(state, content, 0)
    expect(state.character.alive).toBe(false)
    expect(state.pendingEventIds).toEqual([])
    expect(state.turnPhase).toBe('idle')
  })
})

describe('determinismo', () => {
  it('mesma seed e mesmas escolhas produzem a mesma vida', () => {
    const a = playLife(20240101)
    const b = playLife(20240101)
    expect(JSON.stringify(b)).toBe(JSON.stringify(a))
  })

  it('seeds diferentes produzem vidas diferentes', () => {
    const a = playLife(1)
    const b = playLife(2)
    expect(JSON.stringify(b)).not.toBe(JSON.stringify(a))
  })

  it('sobreviver a um round-trip de save não muda o futuro', () => {
    const uninterrupted = createGame(
      { name: 'Teste', gender: 'male', seed: 555, birthYear: 2000 },
      GAME_CONTENT,
    )
    for (let i = 0; i < 25; i++) {
      advanceYear(uninterrupted, GAME_CONTENT)
      resolvePending(uninterrupted, GAME_CONTENT)
    }

    // Mesma vida, mas serializada e recarregada no meio do caminho.
    const reloaded = createGame(
      { name: 'Teste', gender: 'male', seed: 555, birthYear: 2000 },
      GAME_CONTENT,
    )
    for (let i = 0; i < 12; i++) {
      advanceYear(reloaded, GAME_CONTENT)
      resolvePending(reloaded, GAME_CONTENT)
    }
    const revived: GameState = JSON.parse(JSON.stringify(reloaded))
    for (let i = 12; i < 25; i++) {
      advanceYear(revived, GAME_CONTENT)
      resolvePending(revived, GAME_CONTENT)
    }

    expect(JSON.stringify(revived)).toBe(JSON.stringify(uninterrupted))
  })

  it('o choiceLog acompanha cada escolha feita', () => {
    const state = playLife(31337)
    const notes = state.timeline.filter((entry) => entry.kind === 'note')
    expect(state.choiceLog.length).toBeGreaterThan(0)
    // Toda escolha vira nota; educação também gera notas, então notas >= escolhas.
    expect(notes.length).toBeGreaterThanOrEqual(state.choiceLog.length)
  })
})

describe('balanceamento grosso', () => {
  const sample = Array.from({ length: 120 }, (_, i) => playLifeRandomly(i + 1))

  it('a idade média de morte cai numa faixa plausível', () => {
    const ages = sample.map((state) => state.character.deathAge ?? 0)
    const average = ages.reduce((sum, age) => sum + age, 0) / ages.length
    expect(average).toBeGreaterThan(50)
    expect(average).toBeLessThan(85)
  })

  it('ninguém passa da idade máxima', () => {
    for (const state of sample) {
      expect(state.character.deathAge ?? 0).toBeLessThanOrEqual(110)
    }
  })

  it('morrer com a saúde zerada é exceção, não a regra', () => {
    // Saúde zerada dominando as mortes significa que ela só drena: é o sintoma
    // de um sistema sem recuperação, e foi exatamente o bug da primeira versão.
    const zeroed = sample.filter((s) => s.character.deathCause === 'saúde debilitada').length
    expect(zeroed / sample.length).toBeLessThan(0.2)
  })

  it('as causas de morte são variadas', () => {
    const causes = new Set(sample.map((s) => s.character.deathCause))
    expect(causes.size).toBeGreaterThanOrEqual(5)
  })
})
