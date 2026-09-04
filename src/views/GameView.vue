<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import EventModal from '../components/EventModal.vue'
import TabBar from '../components/TabBar.vue'
import TimelineFeed from '../components/TimelineFeed.vue'
import ActionsTab from '../components/tabs/ActionsTab.vue'
import AssetsTab from '../components/tabs/AssetsTab.vue'
import ProfileTab from '../components/tabs/ProfileTab.vue'
import RelationsTab from '../components/tabs/RelationsTab.vue'
import { useGameStore } from '../stores/game'
import type { GameState } from '../engine/types'

const props = defineProps<{ state: GameState }>()
const store = useGameStore()

// Em qualquer aba. Antes só existia na aba Vida, e o jogador tinha que voltar
// para lá só para continuar — as abas ganharam `pb-20` para o botão flutuar
// sem cobrir o último item da lista.
const showAdvance = computed(
  () => store.pendingEvent === null && props.state.character.alive,
)
</script>

<template>
  <div class="flex h-full flex-col">
    <AppHeader :character="state.character" :action-points="state.actionPoints" />

    <main class="relative min-h-0 flex-1">
      <!-- A `TabBar` declarava `role="tablist"` e não existia painel nenhum do
           outro lado: um leitor de tela anunciava cinco abas que não
           controlavam nada. -->
      <div id="tab-panel" class="h-full" role="tabpanel" :aria-labelledby="`tab-${store.activeTab}`">
        <TimelineFeed v-if="store.activeTab === 'life'" :entries="state.timeline" />
        <ActionsTab v-else-if="store.activeTab === 'actions'" />
        <RelationsTab v-else-if="store.activeTab === 'relations'" :relations="state.relations" />
        <AssetsTab v-else-if="store.activeTab === 'assets'" :character="state.character" />
        <ProfileTab v-else :character="state.character" />
      </div>

      <div v-if="showAdvance" class="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <button
          type="button"
          class="pointer-events-auto min-h-[52px] w-full border border-ink bg-ochre font-serif text-base tracking-wide text-paper uppercase active:opacity-80"
          @click="store.nextYear()"
        >
          Avançar ano
        </button>
      </div>
    </main>


    <TabBar v-model="store.activeTab" />

    <EventModal
      v-if="store.pendingEvent"
      :text="store.pendingEventText"
      :options="store.pendingOptions"
      @choose="store.choose($event)"
    />
  </div>
</template>
