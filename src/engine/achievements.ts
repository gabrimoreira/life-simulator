// Conquistas. Nenhuma lógica de avaliação nova: são condições declarativas
// como qualquer outra, checadas no fim de cada turno — inclusive no turno da
// morte, que é quando várias delas fazem sentido.

import { evaluateAll } from './conditions'
import type { ContentPack } from './content-pack'
import { makeNote } from './timeline'
import type { Achievement, GameState, TimelineEntry } from './types'

export function findAchievement(
  content: ContentPack,
  id: string,
): Achievement | undefined {
  return content.achievements.find((achievement) => achievement.id === id)
}

/** Conquistas já obtidas, na ordem do catálogo. */
export function earnedAchievements(state: GameState, content: ContentPack): Achievement[] {
  const earned = new Set(state.achievements)
  return content.achievements.filter((achievement) => earned.has(achievement.id))
}

/**
 * Avalia o catálogo e registra o que foi conquistado agora. Devolve as notas
 * das novas — uma conquista que não aparece na timeline no momento em que
 * acontece não é uma conquista, é uma linha escondida numa aba.
 */
export function checkAchievements(state: GameState, content: ContentPack): TimelineEntry[] {
  const earned = new Set(state.achievements)
  const notes: TimelineEntry[] = []

  for (const achievement of content.achievements) {
    if (earned.has(achievement.id)) continue
    if (!evaluateAll(achievement.conditions, state)) continue

    state.achievements.push(achievement.id)
    notes.push(
      makeNote(state, `Conquista: ${achievement.name}.`, null, [
        { label: achievement.name, text: achievement.description, tone: 'good' },
      ]),
    )
  }

  return notes
}
