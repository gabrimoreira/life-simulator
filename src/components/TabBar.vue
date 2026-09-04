<script setup lang="ts">
import type { TabKey } from '../views/tabs'
import { TABS } from '../views/tabs'

defineProps<{ modelValue: TabKey }>()
defineEmits<{ 'update:modelValue': [TabKey] }>()
</script>

<template>
  <nav
    class="grid shrink-0 grid-cols-5 border-t border-rule bg-panel"
    role="tablist"
    aria-label="Seções do jogo"
  >
    <button
      v-for="tab in TABS"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.key"
      class="flex min-h-[52px] flex-col items-center justify-center gap-0.5 border-t-2 px-1 text-[11px] transition-colors duration-100"
      :class="
        modelValue === tab.key
          ? 'border-ochre text-ochre'
          : 'border-transparent text-muted active:bg-rule/40'
      "
      @click="$emit('update:modelValue', tab.key)"
    >
      <!-- Os glifos são ornamento: um leitor de tela lia "parágrafo, seção,
           asterisco" antes de cada nome de aba. -->
      <span class="font-serif text-base leading-none" aria-hidden="true">{{ tab.glyph }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
