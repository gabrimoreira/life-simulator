<script setup lang="ts">
import type { TabKey } from '../views/tabs'
import { TABS } from '../views/tabs'

defineProps<{ modelValue: TabKey }>()
defineEmits<{ 'update:modelValue': [TabKey] }>()
</script>

<template>
  <nav
    class="grid shrink-0 grid-cols-5 border-t border-rule bg-panel"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <button
      v-for="tab in TABS"
      :key="tab.key"
      type="button"
      class="flex min-h-[52px] flex-col items-center justify-center gap-0.5 border-t-2 px-1 text-[11px] transition-colors duration-100"
      :class="
        modelValue === tab.key
          ? 'border-ochre text-ochre'
          : 'border-transparent text-muted active:bg-rule/40'
      "
      @click="$emit('update:modelValue', tab.key)"
    >
      <span class="font-serif text-base leading-none">{{ tab.glyph }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
