// Aba Ações: pontos de ação e o que fazer com eles.
//
// Uma ação é a mesma coisa que um evento — condições, requisitos, outcomes
// ponderados, efeitos — só muda quem puxa o gatilho. Por isso reusa Outcome e
// Effect em vez de trazer maquinário novo.
//
// Ações DERIVADAS (matricular, cursar, entrar numa carreira) não são conteúdo:
// são regra. "Você pode se matricular num curso para o qual tem requisito" não
// é um dado que alguém escreve, é uma consequência de existirem cursos.

import { assetName, buyAsset, findAsset, sellAsset } from './assets'
import { ACTION_POINTS_PER_TURN, ASSET_SALE_HAIRCUT } from './balance'
import { hireInto } from './careers'
import { firstFailure } from './conditions'
import type { ContentPack } from './content-pack'
import { applyEffects } from './effects'
import { pickOutcome } from './events'
import { courseName, dropOut, enroll, studyYear } from './education'
import type { Rng } from './rng'
import { formatMoney } from './text'
import { makeNote } from './timeline'
import { courseFlag } from './types'
import type { ActionGroup, Condition, GameState, Outcome, TimelineEntry } from './types'

export const ENROLL_PREFIX = 'enroll:'
export const CAREER_PREFIX = 'career:'
export const BUY_PREFIX = 'buy:'
export const SELL_PREFIX = 'sell:'
export const STUDY_ACTION_ID = 'study'
export const DROP_OUT_ACTION_ID = 'drop_out'

export interface ActionSpec {
  id: string
  group: ActionGroup
  label: string
  hint: string
  cost: number
  conditions: Condition[]
  requirements?: Condition[]
  cooldown?: number
  /** null = ação derivada, resolvida por regra em vez de outcomes sorteados. */
  outcomes: Outcome[] | null
}

export interface ActionView {
  id: string
  group: ActionGroup
  label: string
  hint: string
  cost: number
  enabled: boolean
  /** Motivo do bloqueio, ou null quando a ação está liberada. */
  reason: string | null
}

export const ACTION_GROUP_LABELS: Record<ActionGroup, string> = {
  health: 'Saúde',
  education: 'Educação',
  career: 'Carreira',
  assets: 'Bens',
  social: 'Social',
  crime: 'Crime',
}

export function resetActionPoints(state: GameState): void {
  state.actionPoints = ACTION_POINTS_PER_TURN
}

/** Matricular-se em cada curso ainda possível, e entrar em cada carreira. */
function derivedActions(state: GameState, content: ContentPack): ActionSpec[] {
  const specs: ActionSpec[] = []

  if (state.character.enrollment !== null) {
    const name = courseName(content, state.character.enrollment.courseId)
    const left = state.character.enrollment.yearsLeft
    specs.push({
      id: STUDY_ACTION_ID,
      group: 'education',
      label: `Cursar mais um ano de ${name}`,
      hint: `${left} ${left === 1 ? 'ano restante' : 'anos restantes'}. Pular o ano não te reprova, só não te forma.`,
      cost: 1,
      conditions: [],
      outcomes: null,
    })
    specs.push({
      id: DROP_OUT_ACTION_ID,
      group: 'education',
      label: `Largar ${name}`,
      hint: 'Você para de pagar e perde tudo o que já cursou.',
      cost: 0,
      conditions: [],
      outcomes: null,
    })
  } else {
    for (const course of content.courses) {
      // Some da lista quem já concluiu o curso ou já passou daquele nível.
      if (state.character.flags[courseFlag(course.id)] === true) continue
      specs.push({
        id: `${ENROLL_PREFIX}${course.id}`,
        group: 'education',
        label: `Matricular-se em ${course.name}`,
        hint:
          course.annualCost > 0
            ? `${course.years} anos. Sem dinheiro em caixa, a mensalidade vira dívida.`
            : `${course.years} anos, sem mensalidade.`,
        cost: 1,
        conditions: [{ type: 'age', min: 17 }],
        requirements: course.requirements,
        outcomes: null,
      })
    }
  }

  for (const asset of content.assets) {
    const owned = state.character.assets.find((a) => a.assetId === asset.id)

    if (owned) {
      const proceeds = Math.round(owned.value * (1 - ASSET_SALE_HAIRCUT))
      specs.push({
        id: `${SELL_PREFIX}${asset.id}`,
        group: 'assets',
        label: `Vender ${asset.name.toLowerCase()}`,
        hint: `Vale ${formatMoney(owned.value)}; você recebe ${formatMoney(proceeds)}.`,
        cost: 0,
        conditions: [],
        outcomes: null,
      })
      continue
    }

    specs.push({
      id: `${BUY_PREFIX}${asset.id}`,
      group: 'assets',
      label: `Comprar ${asset.name.toLowerCase()}`,
      hint: `${formatMoney(asset.price)}. ${asset.hint}`,
      cost: 1,
      conditions: asset.requirements,
      requirements: [{ type: 'money', min: asset.price }],
      outcomes: null,
    })
  }

  if (state.character.career === null) {
    for (const track of content.careers) {
      const entry = track.levels[0]
      if (!entry) continue
      specs.push({
        id: `${CAREER_PREFIX}${track.id}`,
        group: 'career',
        label: track.entryLabel,
        hint: track.entryHint,
        cost: 1,
        conditions: [],
        requirements: entry.requirements,
        outcomes: null,
      })
    }
  }

  return specs
}

function contentActions(content: ContentPack): ActionSpec[] {
  return content.actions.map((action) => ({
    id: action.id,
    group: action.group,
    label: action.label,
    hint: action.hint,
    cost: action.cost,
    conditions: action.conditions,
    ...(action.requirements ? { requirements: action.requirements } : {}),
    ...(action.cooldown !== undefined ? { cooldown: action.cooldown } : {}),
    outcomes: action.outcomes,
  }))
}

export function findAction(
  state: GameState,
  content: ContentPack,
  actionId: string,
): ActionSpec | undefined {
  return [...derivedActions(state, content), ...contentActions(content)].find(
    (spec) => spec.id === actionId,
  )
}

function onCooldown(state: GameState, spec: ActionSpec): number | null {
  if (spec.cooldown === undefined) return null
  const last = state.lastActionYear[spec.id]
  if (last === undefined) return null
  const remaining = spec.cooldown - (state.year - last)
  return remaining > 0 ? remaining : null
}

/** Ações visíveis neste turno, já com o motivo de bloqueio resolvido. */
export function availableActions(state: GameState, content: ContentPack): ActionView[] {
  if (!state.character.alive) return []

  const specs = [...derivedActions(state, content), ...contentActions(content)]
  const views: ActionView[] = []

  for (const spec of specs) {
    if (firstFailure(spec.conditions, state) !== null) continue

    const wait = onCooldown(state, spec)
    const requirement = spec.requirements ? firstFailure(spec.requirements, state) : null
    const reason =
      wait !== null
        ? `Disponível em ${wait} ${wait === 1 ? 'ano' : 'anos'}`
        : (requirement ??
          (state.actionPoints < spec.cost
            ? `Requer ${spec.cost} ${spec.cost === 1 ? 'ponto' : 'pontos'} de ação`
            : null))

    views.push({
      id: spec.id,
      group: spec.group,
      label: spec.label,
      hint: spec.hint,
      cost: spec.cost,
      enabled: reason === null,
      reason,
    })
  }

  return views
}

function performDerived(
  state: GameState,
  content: ContentPack,
  rng: Rng,
  spec: ActionSpec,
): TimelineEntry | null {
  if (spec.id === STUDY_ACTION_ID) return studyYear(state, content, rng)

  if (spec.id === DROP_OUT_ACTION_ID) {
    const name = state.character.enrollment
      ? courseName(content, state.character.enrollment.courseId)
      : 'o curso'
    if (!dropOut(state)) return null
    return makeNote(state, `Você largou ${name}.`, 'school', [
      { label: 'Curso', text: 'abandonado', tone: 'bad' },
    ])
  }

  if (spec.id.startsWith(ENROLL_PREFIX)) {
    const courseId = spec.id.slice(ENROLL_PREFIX.length)
    if (!enroll(state, content, courseId)) return null
    const enrollment = state.character.enrollment
    const name = courseName(content, courseId)
    return makeNote(
      state,
      enrollment?.financed === true
        ? `Você entrou em ${name}, financiad{o}.`
        : `Você entrou em ${name}.`,
      'school',
      [{ label: 'Matrícula', text: name, tone: 'good' }],
    )
  }

  if (spec.id.startsWith(BUY_PREFIX)) {
    const assetId = spec.id.slice(BUY_PREFIX.length)
    const asset = findAsset(content, assetId)
    if (!asset || !buyAsset(state, content, assetId)) return null
    return makeNote(state, `Você comprou ${asset.name.toLowerCase()}.`, null, [
      { label: asset.name, text: `−${formatMoney(asset.price)}`, tone: 'neutral' },
    ])
  }

  if (spec.id.startsWith(SELL_PREFIX)) {
    const assetId = spec.id.slice(SELL_PREFIX.length)
    const name = assetName(content, assetId)
    const proceeds = sellAsset(state, assetId)
    if (proceeds === null) return null
    return makeNote(state, `Você vendeu ${name.toLowerCase()}.`, null, [
      { label: name, text: `+${formatMoney(proceeds)}`, tone: 'good' },
    ])
  }

  if (spec.id.startsWith(CAREER_PREFIX)) {
    const trackId = spec.id.slice(CAREER_PREFIX.length)
    const track = content.careers.find((t) => t.id === trackId)
    const entry = track?.levels[0]
    if (!track || !entry) return null
    hireInto(state, track)
    return makeNote(state, `Você começou como ${entry.title.toLowerCase()}.`, 'career', [
      { label: 'Cargo', text: entry.title, tone: 'good' },
    ])
  }

  return null
}

/**
 * Executa uma ação. Devolve a entrada da timeline, ou null se a ação não
 * estava disponível — o store não precisa revalidar nada.
 */
export function performAction(
  state: GameState,
  content: ContentPack,
  rng: Rng,
  actionId: string,
): TimelineEntry | null {
  const spec = findAction(state, content, actionId)
  if (!spec) return null

  // A UI já desabilita o que não pode; o engine não confia nisso.
  if (firstFailure(spec.conditions, state) !== null) return null
  if (spec.requirements && firstFailure(spec.requirements, state) !== null) return null
  if (onCooldown(state, spec) !== null) return null
  if (state.actionPoints < spec.cost) return null

  state.actionPoints -= spec.cost
  state.lastActionYear[spec.id] = state.year

  if (spec.outcomes === null) return performDerived(state, content, rng, spec)

  const outcome = pickOutcome(
    { text: spec.label, outcomes: spec.outcomes },
    state.character.stats.luck,
    rng,
  )
  const logs = applyEffects(outcome.effects, state, rng, content)
  return makeNote(state, outcome.text, null, logs)
}
