// Progressao escolar automatica da Fase 1. Cursos, bolsas e financiamento
// entram na Fase 2 como escolhas.

import { AGE_ELEMENTARY_DONE, AGE_HIGHSCHOOL_DONE, HIGHSCHOOL_MIN_INTELLIGENCE } from './balance'
import type { GameState, TimelineEntry } from './types'

/** Avanca o nivel escolar quando a idade chega, e devolve a nota da timeline. */
export function applyEducation(state: GameState): TimelineEntry | null {
  const c = state.character

  if (c.age === AGE_ELEMENTARY_DONE && c.education === 'none') {
    c.education = 'elementary'
    return {
      kind: 'note',
      year: state.year,
      text: 'Você concluiu o Ensino Fundamental.',
      category: 'school',
      effects: [{ label: 'Educação', text: 'Ensino Fundamental', tone: 'good' }],
    }
  }

  if (c.age === AGE_HIGHSCHOOL_DONE && c.education === 'elementary') {
    if (c.stats.intelligence < HIGHSCHOOL_MIN_INTELLIGENCE) {
      return {
        kind: 'note',
        year: state.year,
        text: 'Você não conseguiu concluir o Ensino Médio e largou os estudos.',
        category: 'school',
        effects: [],
      }
    }
    c.education = 'highschool'
    return {
      kind: 'note',
      year: state.year,
      text: 'Você concluiu o Ensino Médio.',
      category: 'school',
      effects: [{ label: 'Educação', text: 'Ensino Médio', tone: 'good' }],
    }
  }

  return null
}
