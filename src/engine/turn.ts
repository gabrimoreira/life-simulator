// Orquestracao de um turno (= um ano).
//
// O turno e bifasico de proposito: um evento pode matar o personagem, entao a
// checagem de morte so pode rodar depois que todas as escolhas foram feitas.
//
//   advanceYear() -> envelhece, cobra, escolariza, enfileira 1..3 eventos
//   chooseOption() -> resolve o evento da frente da fila
//   (fila vazia)  -> finishTurn() checa a morte
//
// A instancia de Rng nunca escapa daqui: `withRng` garante que `rngState`
// volta pro save depois de cada operacao.

import { resetActionPoints } from './actions'
import { checkAchievements } from './achievements'
import { applyAging, checkDeath } from './aging'
import { applyAssetYear } from './assets'
import { EVENTS_PER_TURN } from './balance'
import { firstFailure } from './conditions'
import type { ContentPack } from './content-pack'
import { applyEconomy } from './economy'
import { applySchooling } from './education'
import { applyEffects } from './effects'
import { findEvent, pickOutcome, selectEvents } from './events'
import { performAction } from './actions'
import { applyPrisonYear, isInPrison } from './prison'
import { applyRelationYear, performRelationAction } from './relations'
import { createRng } from './rng'
import type { Rng } from './rng'
import { formatMoney, interpolate } from './text'
import type { GameEvent, GameState } from './types'

/** A manutencao dos bens entra na mesma linha de razao da renda e do custo. */
function joinSummary(economy: string | null, upkeep: number): string | null {
  if (upkeep <= 0) return economy
  const bens = `Bens ${formatMoney(upkeep)}`
  return economy === null ? bens : `${economy} · ${bens}`
}

function withRng<T>(state: GameState, fn: (rng: Rng) => T): T {
  const rng = createRng(state.rngState)
  const result = fn(rng)
  state.rngState = rng.getState()
  return result
}

/** Evento aguardando escolha, ou null se o turno nao esta bloqueado. */
export function currentEvent(state: GameState, content: ContentPack): GameEvent | null {
  const id = state.pendingEventIds[0]
  if (id === undefined) return null
  return findEvent(content, id) ?? null
}

function finishTurn(state: GameState, content: ContentPack): void {
  withRng(state, (rng) => checkDeath(state, rng))

  // Depois da checagem de morte, de propósito: várias conquistas só fazem
  // sentido no turno em que a vida acaba.
  for (const note of checkAchievements(state, content)) state.timeline.push(note)

  const c = state.character
  if (!c.alive) {
    state.pendingEventIds = []
    state.timeline.push({
      kind: 'death',
      year: state.year,
      age: c.age,
      cause: c.deathCause ?? 'causas desconhecidas',
    })
  }

  state.turnPhase = 'idle'
}

/**
 * Avanca um ano. Se sobrar evento na fila, o turno fica em `resolving` ate o
 * jogador escolher; senao fecha na hora.
 */
export function advanceYear(state: GameState, content: ContentPack): void {
  if (!state.character.alive) return
  if (state.turnPhase === 'resolving') return

  state.character.age += 1
  state.year += 1

  resetActionPoints(state)

  withRng(state, (rng) => applyAging(state, rng))
  const relationNotes = withRng(state, (rng) => applyRelationYear(state, rng))
  // Preso nao tem renda nem custo de vida: e sustentado pelo Estado. A cadeia
  // cobra em tempo, saude e gente que se afasta, nao em dinheiro.
  const prisonNotes = applyPrisonYear(state)
  const economy = isInPrison(state)
    ? { summary: null, notes: [] }
    : withRng(state, (rng) => applyEconomy(state, rng, content))
  const assets = withRng(state, (rng) => applyAssetYear(state, rng, content))

  state.timeline.push({
    kind: 'year',
    year: state.year,
    age: state.character.age,
    summary: joinSummary(economy.summary, assets.upkeep),
  })

  for (const note of [...prisonNotes, ...economy.notes, ...assets.notes, ...relationNotes]) {
    state.timeline.push(note)
  }

  const schoolingNote = applySchooling(state)
  if (schoolingNote) state.timeline.push(schoolingNote)

  const events = withRng(state, (rng) =>
    selectEvents(state, rng, content, rng.int(EVENTS_PER_TURN.min, EVENTS_PER_TURN.max)),
  )

  state.pendingEventIds = events.map((event) => event.id)
  for (const event of events) {
    state.lastFiredYear[event.id] = state.year
    if (event.once === true && !state.firedEventIds.includes(event.id)) {
      state.firedEventIds.push(event.id)
    }
  }

  if (state.pendingEventIds.length === 0) {
    finishTurn(state, content)
  } else {
    state.turnPhase = 'resolving'
  }
}

/** Executa uma acao dirigida a uma pessoa e joga o resultado na timeline. */
export function runRelationAction(
  state: GameState,
  content: ContentPack,
  personId: string,
  actionId: string,
): boolean {
  if (!state.character.alive) return false
  if (state.turnPhase === 'resolving') return false

  const note = withRng(state, (rng) =>
    performRelationAction(state, content, rng, personId, actionId),
  )
  if (!note) return false

  state.timeline.push(note)
  return true
}

/** Executa uma acao da aba Acoes e joga o resultado na timeline. */
export function runAction(state: GameState, content: ContentPack, actionId: string): boolean {
  if (!state.character.alive) return false
  // Enquanto ha evento pendente o turno esta bloqueado: nao da para agir.
  if (state.turnPhase === 'resolving') return false

  const note = withRng(state, (rng) => performAction(state, content, rng, actionId))
  if (!note) return false

  state.timeline.push(note)
  return true
}

/** Resolve o evento da frente da fila com a opcao escolhida. */
export function chooseOption(state: GameState, content: ContentPack, optionIndex: number): void {
  const event = currentEvent(state, content)
  if (!event) return

  const option = event.options[optionIndex]
  if (option === undefined) {
    throw new Error(`chooseOption: opcao ${optionIndex} nao existe em "${event.id}"`)
  }

  // A UI ja desabilita opcoes bloqueadas; o engine nao confia nisso.
  const blocker = option.requirements ? firstFailure(option.requirements, state) : null
  if (blocker !== null) {
    throw new Error(`chooseOption: opcao ${optionIndex} de "${event.id}" bloqueada (${blocker})`)
  }

  state.choiceLog.push({ year: state.year, eventId: event.id, optionIndex })

  const outcome = withRng(state, (rng) => pickOutcome(option, state.character.stats.luck, rng))
  const effects = withRng(state, (rng) => applyEffects(outcome.effects, state, rng, content))

  state.timeline.push({
    kind: 'note',
    year: state.year,
    text: interpolate(outcome.text, state),
    category: event.category,
    effects,
  })

  state.pendingEventIds = state.pendingEventIds.slice(1)

  // Um efeito de morte esvazia a fila: o resto do ano nao acontece.
  if (!state.character.alive || state.pendingEventIds.length === 0) {
    finishTurn(state, content)
  }
}
