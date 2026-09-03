// Criacao de pessoas (familia, amigos, pares). Deterministico via Rng.

import { INITIAL_RELATION } from './balance'
import type { ContentPack } from './content-pack'
import type { Rng } from './rng'
import type { GameState, Gender, Person, RelationKind } from './types'

export function randomFirstName(
  gender: Gender,
  rng: Rng,
  content: ContentPack,
  taken: ReadonlySet<string> = new Set(),
): string {
  const pool = gender === 'male' ? content.maleNames : content.femaleNames
  const free = pool.filter((name) => !taken.has(name))
  // Se o pool esgotar, repetir e melhor do que quebrar.
  return rng.pick(free.length > 0 ? free : pool)
}

export function randomFullName(
  gender: Gender,
  rng: Rng,
  content: ContentPack,
  taken: ReadonlySet<string> = new Set(),
): string {
  return `${randomFirstName(gender, rng, content, taken)} ${rng.pick(content.surnames)}`
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

/** Primeiros nomes ja em uso na vida do personagem, ele proprio incluido. */
export function namesInUse(state: GameState): Set<string> {
  const taken = new Set([firstName(state.character.name)])
  for (const person of state.relations) taken.add(firstName(person.name))
  return taken
}

/** Idade plausivel de alguem que acabou de entrar na vida do personagem. */
function ageForKind(kind: RelationKind, characterAge: number, rng: Rng): number {
  switch (kind) {
    case 'mother':
    case 'father':
      return characterAge + rng.int(19, 42)
    case 'child':
      return 0
    case 'sibling':
      return Math.max(0, characterAge + rng.int(-8, 8))
    case 'friend':
      return Math.max(0, characterAge + rng.int(-4, 4))
    case 'partner':
    case 'spouse':
      return Math.max(16, characterAge + rng.int(-6, 6))
  }
}

function genderForKind(kind: RelationKind, rng: Rng): Gender {
  if (kind === 'mother') return 'female'
  if (kind === 'father') return 'male'
  return rng.chance(0.5) ? 'male' : 'female'
}

export function createPerson(
  kind: RelationKind,
  state: GameState,
  rng: Rng,
  content: ContentPack,
  overrides: Partial<Pick<Person, 'name' | 'gender' | 'age' | 'relation'>> = {},
): Person {
  const gender = overrides.gender ?? genderForKind(kind, rng)
  const age = overrides.age ?? ageForKind(kind, state.character.age, rng)
  const relation = overrides.relation ?? rng.int(INITIAL_RELATION.min, INITIAL_RELATION.max)
  // Filho carrega o sobrenome de quem o teve. Sem isto nascia "Ravi Machado"
  // na familia Prado, e a arvore inteira deixava de fazer sentido na tela.
  const surname =
    kind === 'child' ? state.character.name.split(' ').slice(1).join(' ') : undefined
  const name =
    overrides.name ??
    (surname !== undefined && surname !== ''
      ? `${randomFirstName(gender, rng, content, namesInUse(state))} ${surname}`
      : randomFullName(gender, rng, content, namesInUse(state)))

  return {
    // Deterministico: depende so do estado, nunca de um contador global.
    id: `${kind}-${state.relations.length}-${state.year}`,
    name,
    kind,
    gender,
    age,
    relation,
    alive: true,
  }
}
