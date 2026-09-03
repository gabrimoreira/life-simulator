// Fabrica de entradas da timeline. Existe para garantir que TODO texto que
// chega ao jogador passa pela interpolacao — inclusive os que o engine escreve
// sozinho, como promocao e conclusao de curso.

import { interpolate } from './text'
import type { EffectLog, EventCategory, GameState, TimelineEntry } from './types'

export function makeNote(
  state: GameState,
  text: string,
  category: EventCategory | null,
  effects: EffectLog[] = [],
): TimelineEntry {
  return {
    kind: 'note',
    year: state.year,
    text: interpolate(text, state),
    category,
    effects,
  }
}
