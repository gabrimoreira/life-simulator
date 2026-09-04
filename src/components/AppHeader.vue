<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../engine/text'
import type { Character } from '../engine/types'

const props = defineProps<{ character: Character; actionPoints: number }>()

const money = computed(() => formatMoney(props.character.money))
</script>

<template>
  <!-- `viewport-fit=cover` empurra o conteúdo para baixo das barras do sistema;
       sem o inset o nome e a idade encostam no notch em standalone. -->
  <header
    class="border-b border-rule bg-panel px-4 pt-3 pb-2"
    :style="{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }"
  >
    <div class="flex items-baseline justify-between gap-3">
      <h1 class="truncate font-serif text-lg leading-tight font-semibold tracking-wide uppercase">
        {{ character.name }}
      </h1>
      <span class="shrink-0 font-serif text-lg leading-tight">
        {{ character.age }} anos
      </span>
    </div>
    <div class="mt-0.5 flex items-baseline justify-between gap-3 text-xs text-muted">
      <span :class="character.debt > 0 ? 'text-rust' : ''">
        {{ money }}
        <template v-if="character.debt > 0">· dívida {{ formatMoney(character.debt) }}</template>
      </span>
      <span class="shrink-0">
        <span v-if="character.prison" class="text-rust">
          Preso · {{ character.prison.yearsLeft }}a
        </span>
        <template v-else>{{ character.city }}/{{ character.uf }}</template>
        <span class="ml-1 text-ochre tabular-nums">{{ actionPoints }} PA</span>
      </span>
    </div>
  </header>
</template>
