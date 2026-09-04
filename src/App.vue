<script setup lang="ts">
import { onMounted } from 'vue'
import InstallPrompt from './components/InstallPrompt.vue'
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
      <NewGameView
        v-if="!store.state"
        @start="(name, gender, seed) => store.newGame(name, gender, seed)"
      />
      <DeathView
        v-else-if="!store.state.character.alive"
        :character="store.state.character"
        :timeline="store.state.timeline"
        @restart="store.discard()"
      />
      <GameView v-else :state="store.state" />
    </template>

    <!-- Fora do v-if de tela: o convite vale em qualquer uma delas, e antes
         de tudo na primeira, que é onde está quem ainda não instalou. -->
    <InstallPrompt />
  </div>
</template>
