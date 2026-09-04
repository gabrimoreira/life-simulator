<script setup lang="ts">
// O eco da última ação, mostrado na aba onde ela foi clicada.
//
// Sem isto, o único retorno de "Treinar" era o contador de pontos mudando: o
// texto do desfecho e o resultado do dado iam para a timeline, que só é
// renderizada na aba Vida.
import { useGameStore } from '../stores/game'

const store = useGameStore()
</script>

<template>
  <div
    v-if="store.lastResult && store.lastResult.kind === 'note'"
    class="mt-4 border-l-2 border-ochre bg-panel px-3 py-2"
    role="status"
    aria-live="polite"
  >
    <p class="text-sm leading-relaxed">{{ store.lastResult.text }}</p>
    <ul
      v-if="store.lastResult.effects.length"
      class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5"
    >
      <li
        v-for="(effect, i) in store.lastResult.effects"
        :key="i"
        class="text-[11px] tabular-nums"
        :class="{
          'text-ochre': effect.tone === 'good',
          'text-rust': effect.tone === 'bad',
          'text-muted': effect.tone === 'neutral',
        }"
      >
        {{ effect.label }} {{ effect.text }}
      </li>
    </ul>
  </div>
</template>
