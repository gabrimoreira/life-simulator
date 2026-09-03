// Adapta o engine ao Vue e cuida do save. Nenhuma regra de jogo mora aqui.

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { GAME_CONTENT } from '../content'
import { CLASS_PROFILES } from '../engine/balance'
import { ACTION_GROUP_LABELS, availableActions } from '../engine/actions'
import type { ActionGroup } from '../engine/types'
import { careerTitle, currentLevel } from '../engine/careers'
import { courseName } from '../engine/education'
import { firstFailure } from '../engine/conditions'
import { createGame } from '../engine/generate'
import { interpolate } from '../engine/text'
import { advanceYear, chooseOption, currentEvent, runAction } from '../engine/turn'
import type { EventOption, GameState, Gender } from '../engine/types'
import { CURRENT_SAVE_VERSION } from '../save/adapter'
import type { SaveAdapter } from '../save/adapter'
import { createLocalStorageAdapter } from '../save/local-storage-adapter'

export interface ActionGroupView {
  key: ActionGroup
  label: string
  actions: ReturnType<typeof availableActions>
}

export interface OptionStatus {
  text: string
  enabled: boolean
  reason: string | null
}

export const useGameStore = defineStore('game', () => {
  const adapter: SaveAdapter = createLocalStorageAdapter()

  const state = ref<GameState | null>(null)
  const ready = ref(false)
  const activeTab = ref<'life' | 'actions' | 'relations' | 'assets' | 'profile'>('life')

  const character = computed(() => state.value?.character ?? null)
  const alive = computed(() => state.value?.character.alive ?? false)
  const hasGame = computed(() => state.value !== null)

  const pendingEvent = computed(() => {
    if (!state.value) return null
    return currentEvent(state.value, GAME_CONTENT)
  })

  const pendingEventText = computed(() => {
    if (!state.value || !pendingEvent.value) return ''
    return interpolate(pendingEvent.value.text, state.value)
  })

  /** Opções do evento atual já com o motivo de bloqueio resolvido. */
  const pendingOptions = computed<OptionStatus[]>(() => {
    const current = state.value
    const event = pendingEvent.value
    if (!current || !event) return []

    return event.options.map((option: EventOption) => {
      const reason = option.requirements ? firstFailure(option.requirements, current) : null
      return {
        text: interpolate(option.text, current),
        enabled: reason === null,
        reason,
      }
    })
  })

  async function persist(): Promise<void> {
    if (!state.value) return
    await adapter.save({
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: Date.now(),
      state: JSON.parse(JSON.stringify(state.value)) as GameState,
    })
  }

  async function init(): Promise<void> {
    const saved = await adapter.load()
    state.value = saved?.state ?? null
    ready.value = true
  }

  async function newGame(name: string, gender: Gender): Promise<void> {
    state.value = createGame({ name, gender }, GAME_CONTENT)
    activeTab.value = 'life'
    await persist()
  }

  async function nextYear(): Promise<void> {
    if (!state.value) return
    advanceYear(state.value, GAME_CONTENT)
    await persist()
  }

  async function choose(optionIndex: number): Promise<void> {
    if (!state.value) return
    chooseOption(state.value, GAME_CONTENT, optionIndex)
    await persist()
  }

  const actionGroups = computed<ActionGroupView[]>(() => {
    const current = state.value
    if (!current) return []

    const all = availableActions(current, GAME_CONTENT)
    const order: ActionGroup[] = ['career', 'education', 'health', 'social', 'crime']

    return order
      .map((key) => ({
        key,
        label: ACTION_GROUP_LABELS[key],
        actions: all.filter((action) => action.group === key),
      }))
      .filter((group) => group.actions.length > 0)
  })

  const jobTitle = computed(() => (state.value ? careerTitle(state.value, GAME_CONTENT) : null))

  /** Salário base do cargo atual, ou a renda informal de quem não tem cargo. */
  const currentSalary = computed(() => {
    const current = state.value
    if (!current) return 0
    const level = currentLevel(current, GAME_CONTENT)
    if (level) return level.salary
    return CLASS_PROFILES[current.character.socialClass].baseIncome
  })

  const studying = computed(() => {
    const enrollment = state.value?.character.enrollment
    if (!enrollment) return null
    return {
      name: courseName(GAME_CONTENT, enrollment.courseId),
      yearsLeft: enrollment.yearsLeft,
      financed: enrollment.financed,
    }
  })

  async function act(actionId: string): Promise<void> {
    if (!state.value) return
    if (!runAction(state.value, GAME_CONTENT, actionId)) return
    await persist()
  }

  async function discard(): Promise<void> {
    state.value = null
    activeTab.value = 'life'
    await adapter.clear()
  }

  return {
    state,
    ready,
    activeTab,
    character,
    alive,
    hasGame,
    pendingEvent,
    pendingEventText,
    pendingOptions,
    actionGroups,
    jobTitle,
    currentSalary,
    studying,
    act,
    init,
    newGame,
    nextYear,
    choose,
    discard,
  }
})
