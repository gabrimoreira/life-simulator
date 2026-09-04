// O spec prometia que Aparência afeta relacionamentos e que Carisma afeta
// negociação. Não era conteúdo faltando: até a Fase 8 um outcome só podia ser
// enviesado por Sorte (`luckBias`), então a promessa era impossível de
// escrever. Estes testes provam que ela agora vale no conteúdo real, e não só
// no tipo — e que ninguém a apagou sem perceber.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from './index'
import { createGame } from '../engine/generate'
import { runAction } from '../engine/turn'
import { STAT_KEYS } from '../engine/types'
import type { GameState, Outcome, StatKey } from '../engine/types'

/** Todo outcome do jogo, de qualquer lugar que tenha outcomes. */
function todosOutcomes(): Outcome[] {
  const found: Outcome[] = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (value === null || typeof value !== 'object') return
    const record = value as Record<string, unknown>
    if (typeof record['chance'] === 'number' && typeof record['text'] === 'string') {
      found.push(record as unknown as Outcome)
    }
    Object.values(record).forEach(walk)
  }
  walk(GAME_CONTENT.events)
  walk(GAME_CONTENT.actions)
  walk(GAME_CONTENT.relationActions)
  return found
}

/** Quantos outcomes do conteúdo real dependem de cada atributo. */
function enviesadosPor(stat: StatKey): number {
  return todosOutcomes().filter((outcome) => outcome.bias?.[stat] !== undefined).length
}

function personagem(stats: Partial<Record<StatKey, number>>): GameState {
  const state = createGame({ name: 'T', gender: 'female', seed: 7, birthYear: 1990 }, GAME_CONTENT)
  state.character.age = 30
  for (const key of STAT_KEYS) {
    const value = stats[key]
    if (value !== undefined) state.character.stats[key] = value
  }
  return state
}

/**
 * Roda a mesma ação muitas vezes e conta quantas vezes o resultado bateu.
 *
 * Pula o ano entre tentativas para o cooldown não engolir as repetições, e
 * chama `runAction` de verdade: o que está sendo testado é o caminho inteiro,
 * não `effectiveChance` isolada.
 */
function taxaDeSucesso(
  state: GameState,
  actionId: string,
  trechoDoSucesso: string,
  tentativas: number,
  antes?: (state: GameState) => void,
): number {
  let sucessos = 0
  for (let i = 0; i < tentativas; i++) {
    state.year += 5
    state.actionPoints = 3
    antes?.(state)
    if (!runAction(state, GAME_CONTENT, actionId)) continue
    const last = state.timeline[state.timeline.length - 1]
    if (last?.kind === 'note' && last.text.includes(trechoDoSucesso)) sucessos++
  }
  return sucessos / tentativas
}

describe('aparência afeta relacionamento', () => {
  it('bonito encontra alguém com mais frequência que feio', () => {
    // Sem parceiro a ação some do pool, então cada tentativa começa solteira.
    const solteiro = (state: GameState): void => {
      state.relations = state.relations.filter((p) => p.kind !== 'partner')
    }
    const trecho = 'conheceu alguém'

    const bonito = taxaDeSucesso(personagem({ looks: 95 }), 'look_for_love', trecho, 300, solteiro)
    const feio = taxaDeSucesso(personagem({ looks: 5 }), 'look_for_love', trecho, 300, solteiro)

    expect(bonito).toBeGreaterThan(feio + 0.15)
  })

  it('algum outcome do conteúdo real depende de aparência', () => {
    expect(enviesadosPor('looks')).toBeGreaterThan(0)
  })
})

describe('carisma afeta negociação', () => {
  it('quem sabe conversar consegue mais aumentos', () => {
    const comCargo = (stats: Partial<Record<StatKey, number>>): GameState => {
      const state = personagem(stats)
      const track = GAME_CONTENT.careers[0]
      if (track === undefined) throw new Error('conteúdo sem carreiras')
      state.character.career = {
        trackId: track.id,
        kind: track.kind,
        level: 1,
        yearsInLevel: 3,
        yearsInTrack: 5,
        performance: 50,
      }
      return state
    }
    const trecho = 'Conseguiu.'

    const falante = taxaDeSucesso(comCargo({ charisma: 95, reputation: 50 }), 'ask_raise', trecho, 300)
    const calado = taxaDeSucesso(comCargo({ charisma: 5, reputation: 50 }), 'ask_raise', trecho, 300)

    expect(falante).toBeGreaterThan(calado + 0.15)
  })

  it('algum outcome do conteúdo real depende de carisma', () => {
    expect(enviesadosPor('charisma')).toBeGreaterThan(0)
  })
})

describe('a sorte continua sendo um viés entre outros', () => {
  it('ainda existe conteúdo enviesado por sorte', () => {
    expect(enviesadosPor('luck')).toBeGreaterThan(0)
  })
})
