<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from './stores/game'
import DeathView from './views/DeathView.vue'
import GameView from './views/GameView.vue'
import NewGameView from './views/NewGameView.vue'

const store = useGameStore()

onMounted(() => {
  void store.init()
})
</script>

<template>
  <div class="mx-auto flex h-dvh max-w-[480px] flex-col border-rule sm:border-x">
    <template v-if="store.ready">
      <NewGameView v-if="!store.state" @start="(name, gender) => store.newGame(name, gender)" />
      <DeathView
        v-else-if="!store.state.character.alive"
        :character="store.state.character"
        :timeline="store.state.timeline"
        @restart="store.discard()"
      />
      <GameView v-else :state="store.state" />
    </template>
  </div>
</template>
