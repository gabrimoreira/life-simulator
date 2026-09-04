// O lado social: parentes que envelhecem e morrem, e o que dá para fazer a
// respeito de alguém enquanto ele está vivo.

import {
  GRIEF_MAX_HAPPINESS_LOSS,
  RELATIVE_MORTALITY_BASE,
  RELATIVE_MORTALITY_GROWTH,
} from './balance'
import { firstFailure } from './conditions'
import type { ContentPack } from './content-pack'
import { applyEffects, setStat } from './effects'
import { pickOutcome } from './events'
import { mentionsPrison } from './prison'
import { relationLabel } from './labels'
import type { Rng } from './rng'
import { makeNote } from './timeline'
import type {
  Effect,
  GameState,
  Person,
  RelationAction,
  RelationRef,
  TimelineEntry,
} from './types'

export interface RelationActionView {
  id: string
  label: string
  hint: string
  cost: number
  enabled: boolean
  reason: string | null
}

export function findPerson(state: GameState, personId: string): Person | undefined {
  return state.relations.find((person) => person.id === personId)
}

// ---------------------------------------------------------------------------
// Envelhecimento e morte de quem está ao redor
// ---------------------------------------------------------------------------

/** Mesma forma da mortalidade do personagem, com saúde média fixa. */
export function relativeMortalityChance(age: number): number {
  return Math.min(1, RELATIVE_MORTALITY_BASE * Math.exp(RELATIVE_MORTALITY_GROWTH * age))
}

/**
 * Envelhece todo mundo em volta e mata quem tem que morrer. Perder alguém
 * cobra felicidade proporcional ao quanto aquela relação valia.
 */
export function applyRelationYear(state: GameState, rng: Rng): TimelineEntry[] {
  const notes: TimelineEntry[] = []

  for (const person of state.relations) {
    if (!person.alive) continue
    person.age += 1

    if (!rng.chance(relativeMortalityChance(person.age))) continue

    person.alive = false
    // Viuvez desfaz o casamento. Sem isto a flag ficava presa em true para
    // sempre, e `look_for_love` — que exige `married: false` — trancava o
    // viúvo fora de qualquer relacionamento novo pelo resto da vida.
    if (person.kind === 'spouse') state.character.flags['married'] = false

    const grief = Math.round((person.relation / 100) * GRIEF_MAX_HAPPINESS_LOSS)
    setStat(state.character, 'happiness', state.character.stats.happiness - grief)

    notes.push(
      makeNote(
        state,
        `${person.name} morreu aos ${person.age} anos.`,
        'relationship',
        grief > 0 ? [{ label: 'Felicidade', text: `-${grief}`, tone: 'bad' }] : [],
      ),
    )
  }

  return notes
}

/** Quem ainda está vivo, na ordem em que a aba Relações mostra. */
export function livingRelations(state: GameState): Person[] {
  return state.relations.filter((person) => person.alive)
}

// ---------------------------------------------------------------------------
// Ações dirigidas a uma pessoa
// ---------------------------------------------------------------------------

function retargetRef(ref: RelationRef, personId: string): RelationRef {
  return ref.by === 'target' ? { by: 'id', id: personId } : ref
}

/**
 * Troca `{by:'target'}` pelo id de quem recebeu a ação. Fazer isso aqui evita
 * arrastar um "alvo atual" por toda a assinatura de `applyEffect`.
 */
export function retarget(effects: Effect[], personId: string): Effect[] {
  return effects.map((effect) => {
    switch (effect.type) {
      case 'relation':
      case 'removeRelation':
      case 'relationKind':
        return { ...effect, target: retargetRef(effect.target, personId) }
      default:
        return effect
    }
  })
}

/** Motivo de bloqueio vindo do nível de relação com o próprio alvo. */
function relationBlocker(action: RelationAction, person: Person): string | null {
  if (action.minRelation !== undefined && person.relation < action.minRelation) {
    return `Requer relação ${action.minRelation} ou mais`
  }
  if (action.maxRelation !== undefined && person.relation > action.maxRelation) {
    return `Só quando a relação estiver ${action.maxRelation} ou menos`
  }
  return null
}

function cooldownKey(personId: string, actionId: string): string {
  return `${personId}:${actionId}`
}

function remainingCooldown(
  state: GameState,
  action: RelationAction,
  personId: string,
): number | null {
  if (action.cooldown === undefined) return null
  const last = state.lastRelationActionYear[cooldownKey(personId, action.id)]
  if (last === undefined) return null
  const left = action.cooldown - (state.year - last)
  return left > 0 ? left : null
}

function applicable(state: GameState, content: ContentPack, person: Person): RelationAction[] {
  // Mesma regra dos eventos e das acoes: preso, so aparece o que declara
  // `inPrison`. Sem isto dava para pedir alguem em casamento e ter um filho de
  // dentro da cadeia — o sub-loop cobria dois dos tres caminhos, nao os tres.
  const locked = state.character.prison !== null

  return content.relationActions.filter((action) => {
    if (!action.kinds.includes(person.kind)) return false
    if (locked !== mentionsPrison(action.conditions ?? [])) return false
    if (action.conditions && firstFailure(action.conditions, state) !== null) return false
    return true
  })
}

/** O que dá para fazer com esta pessoa neste turno, com motivo de bloqueio. */
export function relationActionsFor(
  state: GameState,
  content: ContentPack,
  person: Person,
): RelationActionView[] {
  if (!state.character.alive || !person.alive) return []

  return applicable(state, content, person).map((action) => {
    const wait = remainingCooldown(state, action, person.id)
    const reason =
      wait !== null
        ? `Disponível em ${wait} ${wait === 1 ? 'ano' : 'anos'}`
        : (relationBlocker(action, person) ??
          (action.requirements ? firstFailure(action.requirements, state) : null) ??
          (state.actionPoints < action.cost
            ? `Requer ${action.cost} ${action.cost === 1 ? 'ponto' : 'pontos'} de ação`
            : null))

    return {
      id: action.id,
      label: action.label,
      hint: action.hint,
      cost: action.cost,
      enabled: reason === null,
      reason,
    }
  })
}

export function performRelationAction(
  state: GameState,
  content: ContentPack,
  rng: Rng,
  personId: string,
  actionId: string,
): TimelineEntry | null {
  const person = findPerson(state, personId)
  if (!person || !person.alive || !state.character.alive) return null

  const action = applicable(state, content, person).find((a) => a.id === actionId)
  if (!action) return null

  // A UI já desabilita o que não pode; o engine não confia nisso.
  if (relationBlocker(action, person) !== null) return null
  if (action.requirements && firstFailure(action.requirements, state) !== null) return null
  if (remainingCooldown(state, action, personId) !== null) return null
  if (state.actionPoints < action.cost) return null

  state.actionPoints -= action.cost
  state.lastRelationActionYear[cooldownKey(personId, actionId)] = state.year

  const outcome = pickOutcome(
    { text: action.label, outcomes: action.outcomes },
    state.character.stats.luck,
    rng,
  )
  const logs = applyEffects(retarget(outcome.effects, personId), state, rng, content)

  // O texto do conteúdo fala de "ela"/"ele" genérico; o nome entra no prefixo.
  const label = relationLabel(person.kind, person.gender)
  return makeNote(state, `${label} ${person.name.split(' ')[0]}: ${outcome.text}`, 'relationship', logs)
}
