// Quem consegue entrar em quê.
//
// O spec lista cinco setores de carteira assinada — "corporativo, tech, saúde,
// jurídico, serviços" — e até a Fase 8 existiam três. Faltavam justamente os
// dois das pontas: tecnologia, que não pede diploma, e serviços, que não pede
// nada. Sem eles o personagem pobre e sem estudo não tinha carreira nenhuma
// para entrar, e quem saía da cadeia com ficha suja não tinha nenhuma porta de
// emprego formal — a checagem de antecedentes fecha todas as outras.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from './index'
import { evaluateAll } from '../engine/conditions'
import { createGame } from '../engine/generate'
import type { CareerTrack, GameState } from '../engine/types'

function pessoa(edit: (state: GameState) => void): GameState {
  const state = createGame({ name: 'T', gender: 'male', seed: 3, birthYear: 1990 }, GAME_CONTENT)
  state.character.age = 25
  edit(state)
  return state
}

/** Trilhas cuja porta de entrada esta pessoa consegue abrir hoje. */
function abertas(state: GameState): CareerTrack[] {
  return GAME_CONTENT.careers.filter((track) => {
    const entrada = track.levels[0]
    return entrada !== undefined && evaluateAll(entrada.requirements, state)
  })
}

describe('as portas de entrada', () => {
  it('quem não tem nada tem para onde ir', () => {
    // Sem médio, sem dinheiro, sem inteligência acima da média, sem beleza.
    const zerado = pessoa((state) => {
      state.character.education = 'none'
      state.character.socialClass = 'poor'
      state.character.money = 0
      for (const key of ['intelligence', 'charisma', 'looks', 'reputation'] as const) {
        state.character.stats[key] = 30
      }
    })
    const nomes = abertas(zerado).map((t) => t.id)
    expect(nomes).toContain('clt_servicos')
  })

  it('serviços paga pouco, e é isso que o mantém sendo o último recurso', () => {
    const servicos = GAME_CONTENT.careers.find((t) => t.id === 'clt_servicos')
    const corporativo = GAME_CONTENT.careers.find((t) => t.id === 'clt')
    expect(servicos?.levels[0]?.salary).toBeLessThan(corporativo?.levels[0]?.salary ?? 0)
    // E o teto também: subir em serviços não pode valer mais que estudar.
    const topo = (t?: CareerTrack): number => t?.levels[t.levels.length - 1]?.salary ?? 0
    expect(topo(servicos)).toBeLessThan(topo(corporativo))
  })

  it('ficha suja fecha o emprego formal, menos uma porta', () => {
    const limpo = pessoa((state) => {
      state.character.education = 'highschool'
      state.character.stats.intelligence = 60
    })
    const sujo = pessoa((state) => {
      state.character.education = 'highschool'
      state.character.stats.intelligence = 60
      state.character.flags['criminal_record'] = true
    })

    const cltDe = (state: GameState): string[] =>
      abertas(state)
        .filter((t) => t.kind === 'clt')
        .map((t) => t.id)

    // A ficha fecha portas de verdade...
    expect(cltDe(sujo).length).toBeLessThan(cltDe(limpo).length)
    // ...mas não todas: sem isto, sair da cadeia era voltar para a
    // informalidade para sempre, e a trilha de crime virava a única saída.
    expect(cltDe(sujo)).toContain('clt_tech')
  })

  it('os cinco setores de carteira assinada do spec existem', () => {
    const clt = GAME_CONTENT.careers.filter((t) => t.kind === 'clt').map((t) => t.id)
    for (const setor of ['clt', 'clt_tech', 'medicina', 'direito', 'clt_servicos']) {
      expect(clt).toContain(setor)
    }
  })
})
