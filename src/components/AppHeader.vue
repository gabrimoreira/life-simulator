<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../engine/text'
import type { Character } from '../engine/types'

const props = defineProps<{ character: Character }>()

const money = computed(() => formatMoney(props.character.money))
</script>

<template>
  <header class="border-b border-rule bg-panel px-4 pt-3 pb-2">
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
      <span class="shrink-0">{{ character.city }}/{{ character.uf }}</span>
    </div>
  </header>
</template>
