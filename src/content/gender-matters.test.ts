// O jogo pergunta o gênero — este teste cobra que ele use a resposta.
//
// Até a Fase 9 a condição `{ type: 'gender' }` aparecia em 1 de 214 eventos.
// O personagem nascia homem ou mulher, o texto se flexionava, e a vida era
// idêntica. Era a mesma promessa vazia que `stats-matter.test.ts` fechou para
// aparência e carisma na Fase 8, e este arquivo é o irmão dele.
//
// Duas coisas são medidas aqui, e a diferença entre elas importa: a contagem
// estrutural impede que alguém apague a ramificação sem perceber; a medida
// comportamental prova que ela CHEGA ao jogador, o que uma contagem de
// condições nunca prova — um evento gated em gênero e mais quatro condições
// impossíveis passaria na primeira e falharia na segunda.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from './index'
import { simulate } from '../test/player'
import type { Condition, Gender, GameEvent } from '../engine/types'

function ramificaPorGenero(conditions: Condition[]): Gender | null {
  for (const c of conditions) {
    if (c.type === 'gender') return c.gender
  }
  return null
}

function eventosDe(gender: Gender): GameEvent[] {
  return GAME_CONTENT.events.filter((e) => ramificaPorGenero(e.conditions) === gender)
}

/**
 * Todo evento que a vida de fato apresentou ao jogador.
 *
 * `firedEventIds` NÃO serve: ele só guarda os eventos `once`, e os de gênero
 * têm cooldown. `choiceLog` guarda toda escolha feita, que é exatamente a
 * lista do que o jogador viveu.
 */
function vividos(state: { choiceLog: { eventId: string }[] }): string[] {
  return state.choiceLog.map((c) => c.eventId)
}

/** Em quantas das `n` vidas ao menos um evento de gênero disparou. */
function vidasQueEncostam(gender: Gender, n: number): number {
  const gated = new Set(GAME_CONTENT.events.filter((e) => ramificaPorGenero(e.conditions) !== null).map((e) => e.id))
  let tocadas = 0
  for (let seed = 1; seed <= n; seed++) {
    const state = simulate(seed, GAME_CONTENT, {
      gender,
      actions: ['Procurar emprego', 'Procurar um relacionamento'],
      social: ['Pedir em casamento', 'Ter um filho', 'Conversar'],
    })
    if (vividos(state).some((id) => gated.has(id))) tocadas++
  }
  return tocadas
}

describe('o gênero ramifica a vida', () => {
  it('existe conteúdo para os dois lados, e não um lado só', () => {
    // Este número é o que impede a regressão silenciosa. Ele pode subir; se
    // cair, alguém apagou a ramificação e o gênero voltou a ser decoração.
    expect(eventosDe('female').length).toBeGreaterThanOrEqual(7)
    expect(eventosDe('male').length).toBeGreaterThanOrEqual(6)
  })

  it('o conteúdo de gênero não vive num canto só da vida', () => {
    // Concentrar tudo em "carreira" faria o gênero pesar só para quem trabalha.
    const categorias = new Set(
      GAME_CONTENT.events
        .filter((e) => ramificaPorGenero(e.conditions) !== null)
        .map((e) => e.category),
    )
    expect(categorias.size).toBeGreaterThanOrEqual(3)
  })

  it('uma vida qualquer encosta nisso, dos dois lados', () => {
    // 40 vidas com o jogador `first` — o piso, o que sempre escolhe a primeira
    // opção. Se ATÉ ele topa com o conteúdo de gênero na maioria das vidas,
    // ele é alcançável de verdade e não só declarável.
    const N = 40
    expect(vidasQueEncostam('female', N)).toBeGreaterThan(N * 0.5)
    expect(vidasQueEncostam('male', N)).toBeGreaterThan(N * 0.5)
  }, 30_000)

  it('a mesma seed vive vidas diferentes conforme o gênero', () => {
    // A prova direta: mesma semente, mesmo plano, personagens diferentes.
    let diferentes = 0
    const N = 30
    for (let seed = 1; seed <= N; seed++) {
      const plano = { actions: ['Procurar emprego'], social: ['Conversar'] }
      const ela = simulate(seed, GAME_CONTENT, { ...plano, gender: 'female' })
      const ele = simulate(seed, GAME_CONTENT, { ...plano, gender: 'male' })
      if (vividos(ela).join('|') !== vividos(ele).join('|')) diferentes++
    }
    expect(diferentes).toBeGreaterThan(N * 0.8)
  }, 30_000)
})
