<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { TimelineEntry } from '../engine/types'

const props = defineProps<{ entries: TimelineEntry[] }>()

const scroller = ref<HTMLElement | null>(null)

// A timeline lê de cima para baixo, como um prontuário: o novo entra no fim.
watch(
  () => props.entries.length,
  async () => {
    await nextTick()
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  },
  { immediate: true },
)
</script>

<template>
  <!-- `aria-live="polite"`: as notas do ano, incluindo conquistas, chegam sem
       nenhuma interação. Sem isto um leitor de tela não anunciava nada. -->
  <div
    ref="scroller"
    class="h-full scroll-pane px-4 pt-3 pb-20"
    role="log"
    aria-live="polite"
    aria-label="Linha do tempo"
  >
    <template v-for="(entry, index) in entries" :key="index">
      <div v-if="entry.kind === 'year'" class="pt-5 first:pt-0">
        <div class="flex items-baseline gap-3">
          <span class="font-serif text-xl leading-none tabular-nums">{{ entry.year }}</span>
          <span class="text-xs text-muted">{{ entry.age }} anos</span>
          <span class="h-px flex-1 bg-rule" />
        </div>
        <p v-if="entry.summary" class="mt-1 text-[11px] text-muted tabular-nums">
          {{ entry.summary }}
        </p>
      </div>

      <div v-else-if="entry.kind === 'note'" class="mt-2.5">
        <p class="text-sm leading-relaxed">{{ entry.text }}</p>
        <ul v-if="entry.effects.length" class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <li
            v-for="(effect, i) in entry.effects"
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

      <div v-else class="mt-6 border-t-2 border-ink pt-3">
        <p class="font-serif text-lg">Você morreu aos {{ entry.age }} anos.</p>
        <p class="mt-0.5 text-sm text-muted">Causa: {{ entry.cause }}.</p>
      </div>
    </template>
  </div>
</template>
