// Tipos do motor. Nada aqui importa Vue, e nada aqui contem logica.

export type StatKey =
  | 'health'
  | 'intelligence'
  | 'looks'
  | 'charisma'
  | 'happiness'
  | 'reputation'
  | 'luck'

export const STAT_KEYS: readonly StatKey[] = [
  'health',
  'intelligence',
  'looks',
  'charisma',
  'happiness',
  'reputation',
  'luck',
]

/** `luck` fica oculta do jogador: enviesa outcomes, nunca aparece na UI. */
export const VISIBLE_STAT_KEYS: readonly StatKey[] = [
  'health',
  'intelligence',
  'looks',
  'charisma',
  'happiness',
  'reputation',
]

export type EducationLevel = 'none' | 'elementary' | 'highschool' | 'bachelor' | 'postgrad'

/** Ordem importa: `education/atLeast` compara por indice. */
export const EDUCATION_ORDER: readonly EducationLevel[] = [
  'none',
  'elementary',
  'highschool',
  'bachelor',
  'postgrad',
]

export type SocialClass = 'poor' | 'lowerMiddle' | 'middle' | 'upperMiddle' | 'rich'

export type Gender = 'male' | 'female'

export type RelationKind = 'mother' | 'father' | 'sibling' | 'friend' | 'partner' | 'spouse' | 'child'

export type EventCategory =
  | 'childhood'
  | 'school'
  | 'career'
  | 'relationship'
  | 'health'
  | 'random'

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

export interface Person {
  id: string
  name: string
  kind: RelationKind
  gender: Gender
  age: number
  /** 0..100 */
  relation: number
  alive: boolean
}

export interface Character {
  name: string
  gender: Gender
  birthYear: number
  age: number
  city: string
  uf: string
  socialClass: SocialClass
  stats: Record<StatKey, number>
  /** Dinheiro liquido em BRL. Nunca negativo: falta vira `debt`. */
  money: number
  debt: number
  education: EducationLevel
  flags: Record<string, boolean>
  alive: boolean
  deathCause: string | null
  deathAge: number | null
}

export interface EffectLog {
  label: string
  text: string
  tone: 'good' | 'bad' | 'neutral'
}

export type TimelineEntry =
  /** Cabecalho do ano. `summary` e a linha de razao (renda/custo), se houver. */
  | { kind: 'year'; year: number; age: number; summary: string | null }
  | {
      kind: 'note'
      year: number
      text: string
      category: EventCategory | null
      effects: EffectLog[]
    }
  | { kind: 'death'; year: number; age: number; cause: string }

export interface ChoiceRecord {
  year: number
  eventId: string
  optionIndex: number
}

export type TurnPhase = 'idle' | 'resolving'

export interface GameState {
  seed: number
  /** Estado serializado do mulberry32. Reproduz a vida inteira junto do `choiceLog`. */
  rngState: number
  year: number
  character: Character
  relations: Person[]
  timeline: TimelineEntry[]
  firedEventIds: string[]
  /** Ultimo ano em que cada evento disparou, para respeitar `cooldown`. */
  lastFiredYear: Record<string, number>
  choiceLog: ChoiceRecord[]
  pendingEventIds: string[]
  turnPhase: TurnPhase
}

// ---------------------------------------------------------------------------
// Conteudo declarativo
// ---------------------------------------------------------------------------

export type RelationRef = { by: 'kind'; kind: RelationKind } | { by: 'id'; id: string }

export type Condition =
  | { type: 'age'; min?: number; max?: number }
  | { type: 'stat'; stat: StatKey; min?: number; max?: number }
  | { type: 'money'; min?: number; max?: number }
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'gender'; gender: Gender }
  | { type: 'socialClass'; oneOf: SocialClass[] }
  | { type: 'education'; level: EducationLevel; atLeast: boolean }
  | { type: 'hasRelation'; kind: RelationKind }
  | { type: 'not'; condition: Condition }
  | { type: 'anyOf'; conditions: Condition[] }

export type Effect =
  | { type: 'stat'; stat: StatKey; op: 'delta' | 'set'; value: number }
  | { type: 'money'; delta: number }
  | { type: 'debt'; delta: number }
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'education'; level: EducationLevel }
  | { type: 'relation'; target: RelationRef; delta: number }
  | { type: 'addRelation'; kind: RelationKind }
  | { type: 'removeRelation'; target: RelationRef }
  | { type: 'death'; cause: string }

export interface Outcome {
  /** 0..1. As chances de um mesmo option somam 1. */
  chance: number
  text: string
  /**
   * Quanto a Sorte enviesa este outcome. Positivo = sorte favorece.
   * chance efetiva = chance * (1 + luckBias * (luck - 50) / 50), renormalizado.
   */
  luckBias?: number
  effects: Effect[]
}

export interface EventOption {
  text: string
  /** Se falhar, a opcao aparece desabilitada com o motivo vindo de `describe()`. */
  requirements?: Condition[]
  outcomes: Outcome[]
}

export interface GameEvent {
  id: string
  category: EventCategory
  weight: number
  /** Dispara no maximo uma vez por vida. */
  once?: boolean
  /**
   * Anos minimos entre dois disparos. Sem isso um evento repetivel de peso
   * alto — uma promocao, por exemplo — cai em anos consecutivos e a vida vira
   * um loop.
   */
  cooldown?: number
  /** TODAS precisam passar. */
  conditions: Condition[]
  text: string
  options: EventOption[]
}

// ---------------------------------------------------------------------------

/** Garante exaustividade em switch sobre union discriminada. */
export function assertNever(value: never, context: string): never {
  throw new Error(`${context}: caso nao tratado ${JSON.stringify(value)}`)
}
