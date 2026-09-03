// Adapta o engine ao Vue e cuida do save. Nenhuma regra de jogo mora aqui.

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { GAME_CONTENT } from '../content'
import { firstFailure } from '../engine/conditions'
import { createGame } from '../engine/generate'
import { interpolate } from '../engine/text'
import { advanceYear, chooseOption, currentEvent } from '../engine/turn'
import type { EventOption, GameState, Gender } from '../engine/types'
import { CURRENT_SAVE_VERSION } from '../save/adapter'
import type { SaveAdapter } from '../save/adapter'
import { createLocalStorageAdapter } from '../save/local-storage-adapter'

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
    init,
    newGame,
    nextYear,
    choose,
    discard,
  }
})
