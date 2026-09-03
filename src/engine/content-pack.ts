// O engine nunca importa `content/` diretamente: recebe um ContentPack.
// Isso e o que deixa o motor testavel com pools falsos minusculos.

import type {
  Achievement,
  AssetDef,
  CareerTrack,
  Course,
  GameAction,
  GameEvent,
  RelationAction,
} from './types'

export interface CityEntry {
  name: string
  uf: string
  /** Peso relativo na sorteio de cidade natal. */
  weight: number
}

export interface ContentPack {
  events: GameEvent[]
  actions: GameAction[]
  careers: CareerTrack[]
  courses: Course[]
  assets: AssetDef[]
  relationActions: RelationAction[]
  achievements: Achievement[]
  maleNames: string[]
  femaleNames: string[]
  surnames: string[]
  cities: CityEntry[]
}
