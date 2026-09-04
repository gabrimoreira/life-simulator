<script setup lang="ts">
import { onMounted } from 'vue'
import FatalError from './components/FatalError.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import SaveWarning from './components/SaveWarning.vue'
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
  <!-- O recorte da tela é tratado UMA vez, aqui.
       `viewport-fit=cover` empurra o conteúdo para baixo da barra do sistema, e
       cada componente da borda vinha resolvendo isso por conta própria: o
       cabeçalho, o aviso de save e a barra de abas todos aplicavam o próprio
       `env(safe-area-inset-*)`. Empilhados, o inset entrava duas vezes; e o
       convite de instalação, que fica depois da barra de abas, ficava fora de
       qualquer proteção. -->
  <div
    class="mx-auto flex h-dvh max-w-[480px] flex-col border-rule sm:border-x"
    :style="{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }"
  >
    <!-- Acima de tudo: o aviso vale em qualquer tela, inclusive na de novo
         jogo, que é exatamente onde cai quem acabou de perder um save. -->
    <SaveWarning />

    <!-- Fora do v-if de tela: o convite vale em qualquer uma delas, e antes de
         tudo na primeira, que é onde está quem ainda não instalou. No topo, e
         não no rodapé: embaixo ele caía DEPOIS da barra de abas, empurrando a
         navegação para o meio da tela. -->
    <InstallPrompt />

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

    <!-- Por cima de tudo, inclusive do modal de evento: é justamente lá que
         a exceção costuma acontecer. -->
    <FatalError />
  </div>
</template>
