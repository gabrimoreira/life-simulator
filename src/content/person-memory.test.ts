// Uma relação que lembra do que aconteceu.
//
// O spec pede flags por pessoa desde a linha 164 — "Cada um tem: nome, idade,
// tipo, nível de relação (0–100), flags" — e até a Fase 9 `Person` não tinha o
// campo. Uma relação era um número e um tipo: dava para saber que o amigo
// estava distante, nunca POR QUÊ. Mágoa, briga e simples distância eram o
// mesmo 30 na tela.
//
// O que este arquivo testa não é o motor (isso está em conditions.test.ts,
// effects.test.ts e relations.test.ts) e sim a CADEIA no conteúdo de verdade:
// um evento marca uma pessoa, e por causa disso aparece nela — e só nela —
// alguma coisa que não existia antes. Sem isto, `Person.flags` seria mais uma
// promessa de tipo sem consequência, que é exatamente o defeito que ela veio
// corrigir.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from './index'
import { createGame } from '../engine/generate'
import { relationActionsFor } from '../engine/relations'
import { runRelationAction } from '../engine/turn'
import type { GameState, Person } from '../engine/types'

function comMae(): { state: GameState; mae: Person } {
  const state = createGame({ name: 'T', gender: 'male', seed: 5, birthYear: 1990 }, GAME_CONTENT)
  state.character.age = 30
  state.character.money = 60_000
  const mae = state.relations.find((p) => p.kind === 'mother')
  if (!mae) throw new Error('personagem sem mãe')
  mae.relation = 80
  return { state, mae }
}

function rotulos(state: GameState, person: Person): string[] {
  return relationActionsFor(state, GAME_CONTENT, person).map((a) => a.label)
}

describe('a memória de uma pessoa abre o que não existia', () => {
  it('quem te ajudou passa a ter "Retribuir" — e só ele', () => {
    const { state, mae } = comMae()
    state.relations.push({
      id: 'irmao',
      name: 'Caio Silva',
      kind: 'sibling',
      gender: 'male',
      age: 33,
      relation: 80,
      alive: true,
      flags: {},
    })
    const irmao = state.relations[state.relations.length - 1]
    if (!irmao) throw new Error('fixture')

    expect(rotulos(state, mae)).not.toContain('Retribuir')

    // Marca só a mãe. Em jogo isto vem de `ask_money`, que é a única coisa no
    // jogo que sabe em QUEM a ação foi disparada.
    mae.flags['helped_me'] = true

    expect(rotulos(state, mae)).toContain('Retribuir')
    // O ponto inteiro do campo: o irmão continua sem, mesmo sendo família e
    // tendo a mesma relação. Uma flag global não conseguiria dizer isso.
    expect(rotulos(state, irmao)).not.toContain('Retribuir')
  })

  it('retribuir apaga a dívida, e a ação some junto', () => {
    const { state, mae } = comMae()
    mae.flags['helped_me'] = true

    expect(runRelationAction(state, GAME_CONTENT, mae.id, 'pay_back')).toBe(true)
    expect(mae.flags['helped_me']).toBe(false)
    expect(rotulos(state, mae)).not.toContain('Retribuir')
  })

  it('quem te deve passa a ter "Cobrar o que devem"', () => {
    const { state, mae } = comMae()
    expect(rotulos(state, mae)).not.toContain('Cobrar o que devem')
    mae.flags['owes_me'] = true
    expect(rotulos(state, mae)).toContain('Cobrar o que devem')
  })

  it('a ação de pedir dinheiro escreve a memória na pessoa certa', () => {
    // A cadeia de verdade, sem plantar flag na mão: `ask_money` num alvo, e a
    // marca aparece NELE. Foi assim que se descobriu que `retarget` ignorava
    // `personFlag` — o efeito rodava e não escrevia nada.
    const { state, mae } = comMae()
    let marcada = false
    for (let i = 0; i < 40 && !marcada; i++) {
      state.year += 5
      state.actionPoints = 3
      state.character.money = 0
      runRelationAction(state, GAME_CONTENT, mae.id, 'ask_money')
      marcada = mae.flags['helped_me'] === true
    }
    expect(marcada).toBe(true)
  })
})
