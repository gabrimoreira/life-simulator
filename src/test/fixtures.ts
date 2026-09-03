// Helpers de teste. Um ContentPack minusculo e um estado previsivel deixam os
// testes do engine independentes do conteudo real do jogo.

import type { ContentPack } from '../engine/content-pack'
import { STAT_KEYS } from '../engine/types'
import type { Character, GameEvent, GameState, StatKey } from '../engine/types'

export function makeCharacter(overrides: Partial<Character> = {}): Character {
  const stats = {} as Record<StatKey, number>
  for (const key of STAT_KEYS) stats[key] = 50

  return {
    name: 'Teste',
    gender: 'female',
    birthYear: 2000,
    age: 20,
    city: 'Recife',
    uf: 'PE',
    socialClass: 'middle',
    stats,
    money: 10_000,
    debt: 0,
    education: 'highschool',
    career: null,
    careerHistory: {},
    enrollment: null,
    flags: {},
    alive: true,
    deathCause: null,
    deathAge: null,
    ...overrides,
  }
}

export function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    seed: 1,
    rngState: 1,
    year: 2020,
    actionPoints: 3,
    character: makeCharacter(),
    relations: [],
    timeline: [],
    firedEventIds: [],
    lastFiredYear: {},
    lastActionYear: {},
    choiceLog: [],
    pendingEventIds: [],
    turnPhase: 'idle',
    ...overrides,
  }
}

export function makeContent(
  events: GameEvent[] = [],
  extra: Partial<ContentPack> = {},
): ContentPack {
  return {
    events,
    actions: [],
    careers: [],
    courses: [],
    maleNames: ['João', 'Pedro'],
    femaleNames: ['Ana', 'Maria'],
    surnames: ['Silva', 'Souza'],
    cities: [{ name: 'Recife', uf: 'PE', weight: 1 }],
    ...extra,
  }
}

/** Evento trivial: uma opcao, um outcome, sem efeito. */
export function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id: 'test_event',
    category: 'random',
    weight: 1,
    conditions: [],
    text: 'Aconteceu alguma coisa.',
    options: [
      { text: 'Ok', outcomes: [{ chance: 1, text: 'Passou.', effects: [] }] },
      { text: 'Também ok', outcomes: [{ chance: 1, text: 'Passou também.', effects: [] }] },
    ],
    ...overrides,
  }
}
