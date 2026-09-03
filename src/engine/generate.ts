// Nascimento: origem, stats iniciais, familia.

import {
  ACTION_POINTS_PER_TURN,
  CLASS_PROFILES,
  PARENT_AGE_AT_BIRTH,
  PARENT_MIN_AGE_AT_FIRST_CHILD,
  SIBLING_AGE_AT_BIRTH,
  SIBLING_COUNT,
  STAT_ROLLS,
} from './balance'
import type { ContentPack } from './content-pack'
import { clampStat } from './effects'
import { createPerson } from './people'
import { createRng, randomSeed } from './rng'
import type { Rng } from './rng'
import { STAT_KEYS } from './types'
import type { Character, GameState, Gender, SocialClass, StatKey } from './types'

export interface NewGameOptions {
  name: string
  gender: Gender
  seed?: number
  birthYear?: number
}

/** Media de N rolagens: puxa a distribuicao pro centro em vez de uniforme. */
function rollStat(rng: Rng): number {
  let sum = 0
  for (let i = 0; i < STAT_ROLLS; i++) sum += rng.int(0, 100)
  return Math.round(sum / STAT_ROLLS)
}

function rollSocialClass(rng: Rng): SocialClass {
  const classes = Object.keys(CLASS_PROFILES) as SocialClass[]
  return rng.weighted(classes, (key) => CLASS_PROFILES[key].weight)
}

export function createGame(options: NewGameOptions, content: ContentPack): GameState {
  const seed = options.seed ?? randomSeed()
  const rng = createRng(seed)
  const birthYear = options.birthYear ?? new Date().getFullYear()

  const socialClass = rollSocialClass(rng)
  const profile = CLASS_PROFILES[socialClass]
  const city = rng.weighted(content.cities, (c) => c.weight)

  const stats = {} as Record<StatKey, number>
  for (const key of STAT_KEYS) {
    // Ninguem nasce famoso. Fama e a unica stat que comeca no chao.
    stats[key] = key === 'fame' ? rng.int(0, 5) : clampStat(rollStat(rng) + (profile.statBias[key] ?? 0))
  }

  const character: Character = {
    name: options.name.trim() || 'Anônimo',
    gender: options.gender,
    birthYear,
    age: 0,
    city: city.name,
    uf: city.uf,
    socialClass,
    stats,
    money: profile.startingMoney,
    debt: 0,
    education: 'none',
    career: null,
    careerHistory: {},
    pension: 0,
    enrollment: null,
    assets: [],
    flags: {},
    alive: true,
    deathCause: null,
    deathAge: null,
  }

  const state: GameState = {
    seed,
    rngState: rng.getState(),
    year: birthYear,
    actionPoints: ACTION_POINTS_PER_TURN,
    character,
    relations: [],
    timeline: [],
    firedEventIds: [],
    lastFiredYear: {},
    lastActionYear: {},
    lastRelationActionYear: {},
    choiceLog: [],
    pendingEventIds: [],
    turnPhase: 'idle',
  }

  const surname = rng.pick(content.surnames)

  // As idades dos irmaos saem primeiro porque restringem a idade dos pais: um
  // pai precisa ser mais velho que o filho mais velho por uma margem humana.
  const siblingAges = Array.from({ length: rng.int(SIBLING_COUNT.min, SIBLING_COUNT.max) }, () =>
    rng.int(SIBLING_AGE_AT_BIRTH.min, SIBLING_AGE_AT_BIRTH.max),
  )
  const oldestSibling = siblingAges.length > 0 ? Math.max(...siblingAges) : 0
  const parentMin = Math.max(
    PARENT_AGE_AT_BIRTH.min,
    oldestSibling + PARENT_MIN_AGE_AT_FIRST_CHILD,
  )
  const parentMax = Math.max(parentMin, PARENT_AGE_AT_BIRTH.max)

  // Um de cada vez: `createPerson` deriva o id e os nomes ja usados de
  // `state.relations`, entao empurrar dois de uma vez faria os dois enxergarem
  // a mesma lista vazia.
  for (const kind of ['mother', 'father'] as const) {
    const parent = createPerson(kind, state, rng, content, { age: rng.int(parentMin, parentMax) })
    // Familia divide sobrenome com o personagem.
    parent.name = `${parent.name.split(' ')[0]} ${surname}`
    state.relations.push(parent)
  }

  for (const age of siblingAges) {
    const sibling = createPerson('sibling', state, rng, content, { age })
    sibling.name = `${sibling.name.split(' ')[0]} ${surname}`
    state.relations.push(sibling)
  }

  state.timeline.push({ kind: 'year', year: birthYear, age: 0, summary: null })
  state.timeline.push({
    kind: 'note',
    year: birthYear,
    text: `Você nasceu em ${city.name}, ${city.uf}. Família de ${profile.label}.`,
    category: 'childhood',
    effects: [],
  })

  state.rngState = rng.getState()
  return state
}
