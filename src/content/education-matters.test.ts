// Antes da Fase 5 nenhuma flag `course_*` era lida por NADA: ela só era escrita
// e depois consultada para impedir matrícula dupla. Os seis cursos de graduação
// eram mecanicamente intercambiáveis, e Medicina — seis anos e R$360.000,
// exigindo inteligência 72 — abria exatamente as mesmas portas que
// Licenciatura, quatro anos e R$32.000. Estes testes existem para que isso não
// volte a ser verdade sem alguém perceber.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from './index'
import { COURSES } from './education'
import { evaluateAll } from '../engine/conditions'
import { createGame } from '../engine/generate'
import { courseFlag } from '../engine/types'
import type { GameState } from '../engine/types'

/** Todas as condições de flag de curso lidas em qualquer lugar do conteúdo. */
function courseFlagsRead(): Set<string> {
  const found = new Set<string>()
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (value === null || typeof value !== 'object') return
    const record = value as Record<string, unknown>
    if (record['type'] === 'flag' && typeof record['flag'] === 'string') {
      if (record['flag'].startsWith('course_')) found.add(record['flag'])
    }
    Object.values(record).forEach(walk)
  }
  walk(GAME_CONTENT.careers)
  walk(GAME_CONTENT.events)
  walk(GAME_CONTENT.actions)
  walk(GAME_CONTENT.achievements)
  walk(GAME_CONTENT.assets)
  return found
}

function formadoEm(courseId: string, age = 30): GameState {
  const state = createGame({ name: 'T', gender: 'female', seed: 1, birthYear: 2000 }, GAME_CONTENT)
  state.character.age = age
  state.character.education = 'bachelor'
  state.character.flags[courseFlag(courseId)] = true
  return state
}

/** Trilhas cuja entrada o personagem satisfaz. */
function trilhasAbertas(state: GameState): string[] {
  return GAME_CONTENT.careers
    .filter((track) => {
      const entry = track.levels[0]
      return entry !== undefined && evaluateAll(entry.requirements, state)
    })
    .map((track) => track.id)
}

describe('o curso importa', () => {
  it('todo curso de graduação abre alguma porta', () => {
    const read = courseFlagsRead()
    const graduacoes = COURSES.filter((course) => course.grants === 'bachelor')

    const decorativos = graduacoes
      .map((course) => course.id)
      .filter((id) => !read.has(courseFlag(id)))

    expect(decorativos, 'cursos que ninguém lê').toEqual([])
  })

  it('Medicina não abre as mesmas portas que Licenciatura', () => {
    // Este é o teste que teria falhado: os dois davam exatamente o mesmo
    // conjunto de trilhas, e um custa onze vezes mais que o outro.
    const medico = trilhasAbertas(formadoEm('medicina')).sort()
    const professor = trilhasAbertas(formadoEm('licenciatura')).sort()
    expect(medico).not.toEqual(professor)
  })

  it('cada diploma de profissão abre a sua trilha, e só a sua', () => {
    for (const [curso, trilha] of [
      ['medicina', 'medicina'],
      ['direito', 'direito'],
      ['engenharia', 'engenharia'],
    ] as const) {
      const abertas = trilhasAbertas(formadoEm(curso))
      expect(abertas, `${curso} abre ${trilha}`).toContain(trilha)

      const outras = ['medicina', 'direito', 'engenharia'].filter((t) => t !== trilha)
      for (const outra of outras) {
        expect(abertas, `${curso} NÃO abre ${outra}`).not.toContain(outra)
      }
    }
  })

  it('sem diploma nenhum, nenhuma trilha de profissão está aberta', () => {
    const state = createGame({ name: 'T', gender: 'male', seed: 2, birthYear: 2000 }, GAME_CONTENT)
    state.character.age = 30
    state.character.education = 'highschool'

    const abertas = trilhasAbertas(state)
    expect(abertas).not.toContain('medicina')
    expect(abertas).not.toContain('direito')
    expect(abertas).not.toContain('engenharia')
  })

  it('a trilha de profissão paga mais que o corporativo genérico no mesmo degrau', () => {
    // Se não pagasse, o diploma continuaria sendo custo sem retorno.
    const medicina = GAME_CONTENT.careers.find((t) => t.id === 'medicina')
    const clt = GAME_CONTENT.careers.find((t) => t.id === 'clt')
    const topoMedicina = medicina?.levels[medicina.levels.length - 1]?.salary ?? 0
    const topoClt = clt?.levels[clt.levels.length - 1]?.salary ?? 0
    expect(topoMedicina).toBeGreaterThan(topoClt)
  })

  it('a academia continua alcançável, agora com folga de anos', () => {
    // Entrada exigia idade 24 e o caminho mais rápido chegava aos 24 cravados.
    const state = formadoEm('licenciatura', 23)
    expect(trilhasAbertas(state)).toContain('academia')
  })
})
