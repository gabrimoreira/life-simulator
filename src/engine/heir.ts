// Continuar como um filho. É o gancho de rejogabilidade: a vida acabou, mas a
// linhagem não — e o que você acumulou passa adiante, junto com metade dos
// seus atributos.

import {
  AGE_ELEMENTARY_DONE,
  AGE_FINANCIALLY_INDEPENDENT,
  AGE_HIGHSCHOOL_DONE,
  ACTION_POINTS_PER_TURN,
  HEIR_STAT_INHERITANCE,
  HEIR_STAT_NOISE,
  INHERITANCE_SHARE,
} from './balance'
import { netWorth } from './assets'
import { clampStat } from './effects'
import { createRng } from './rng'
import { formatMoney } from './text'
import { STAT_KEYS } from './types'
import type { Character, EducationLevel, GameState, Person, StatKey } from './types'

/** Filhos vivos, que é quem pode continuar a história. */
export function heirCandidates(state: GameState): Person[] {
  return state.relations.filter((person) => person.kind === 'child' && person.alive)
}

export function canContinue(state: GameState): boolean {
  return !state.character.alive && heirCandidates(state).length > 0
}

/** Escolaridade que a idade já garante, sem simular a infância de novo. */
function educationForAge(age: number): EducationLevel {
  if (age >= AGE_HIGHSCHOOL_DONE) return 'highschool'
  if (age >= AGE_ELEMENTARY_DONE) return 'elementary'
  return 'none'
}

export function createHeir(state: GameState, heirId: string): GameState | null {
  const heir = heirCandidates(state).find((person) => person.id === heirId)
  if (!heir) return null

  // A linhagem continua o mesmo fio de RNG: a vida do filho é tão reproduzível
  // quanto a do pai a partir da seed original.
  const rng = createRng(state.rngState)
  const parent = state.character

  const share = Math.max(0, netWorth(state)) * INHERITANCE_SHARE
  const inheritance = Math.round(share / heirCandidates(state).length)

  const stats = {} as Record<StatKey, number>
  for (const key of STAT_KEYS) {
    if (key === 'fame') {
      // Fama não se herda: o filho de alguém famoso ainda não é ninguém.
      stats[key] = rng.int(0, 8)
      continue
    }
    // Regressão à média: sem ela, uma linhagem otimizada viraria uma escada
    // infinita de superpessoas.
    const inherited = parent.stats[key] * HEIR_STAT_INHERITANCE
    const mean = 50 * (1 - HEIR_STAT_INHERITANCE)
    stats[key] = clampStat(inherited + mean + rng.int(-HEIR_STAT_NOISE, HEIR_STAT_NOISE))
  }

  const character: Character = {
    name: heir.name,
    gender: heir.gender,
    birthYear: state.year - heir.age,
    age: heir.age,
    city: parent.city,
    uf: parent.uf,
    socialClass: parent.socialClass,
    stats,
    money: inheritance,
    debt: 0,
    education: educationForAge(heir.age),
    career: null,
    careerHistory: {},
    enrollment: null,
    assets: [],
    flags: {},
    alive: true,
    deathCause: null,
    deathAge: null,
  }

  // A família do filho é a família que sobrou: o cônjuge do falecido vira o
  // outro pai, e os outros filhos viram irmãos.
  const relations: Person[] = []
  for (const person of state.relations) {
    if (!person.alive || person.id === heir.id) continue

    if (person.kind === 'spouse') {
      relations.push({
        ...person,
        kind: person.gender === 'female' ? 'mother' : 'father',
      })
      continue
    }
    if (person.kind === 'child') {
      relations.push({ ...person, kind: 'sibling' })
      continue
    }
    // Avós, tios e amigos do falecido não são a vida do filho.
  }

  const heirState: GameState = {
    seed: state.seed,
    rngState: rng.getState(),
    year: state.year,
    actionPoints: ACTION_POINTS_PER_TURN,
    character,
    relations,
    timeline: [],
    firedEventIds: [],
    lastFiredYear: {},
    lastActionYear: {},
    lastRelationActionYear: {},
    choiceLog: [],
    pendingEventIds: [],
    turnPhase: 'idle',
  }

  heirState.timeline.push({
    kind: 'year',
    year: state.year,
    age: heir.age,
    summary: null,
  })
  heirState.timeline.push({
    kind: 'note',
    year: state.year,
    text:
      `${parent.name} morreu. Você tem ${heir.age} anos e herdou ` +
      `${formatMoney(inheritance)}${heir.age < AGE_FINANCIALLY_INDEPENDENT ? ', que ficam com você quando der a idade' : ''}.`,
    category: 'relationship',
    effects: [{ label: 'Herança', text: formatMoney(inheritance), tone: 'good' }],
  })

  return heirState
}
