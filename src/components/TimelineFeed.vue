<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { EventCategory, TimelineEntry } from '../engine/types'

const props = defineProps<{ entries: TimelineEntry[] }>()

const scroller = ref<HTMLElement | null>(null)

// `TimelineEntry.category` era gravada em toda nota desde a Fase 1 e nunca
// lida — nem por regra, nem por tela. Numa vida de setenta anos a timeline
// passa de trezentas linhas, e reler só o que aconteceu de carreira era
// impossível.
const FILTERS: readonly { key: EventCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'career', label: 'Carreira' },
  { key: 'relationship', label: 'Relações' },
  { key: 'health', label: 'Saúde' },
  { key: 'school', label: 'Estudo' },
  { key: 'crime', label: 'Crime' },
]

const filter = ref<EventCategory | 'all'>('all')

/**
 * Com filtro ativo, o cabeçalho do ano só fica se sobrou nota debaixo dele —
 * senão a tela vira uma lista de anos vazios.
 */
const visible = computed<TimelineEntry[]>(() => {
  if (filter.value === 'all') return props.entries

  const out: TimelineEntry[] = []
  for (const entry of props.entries) {
    if (entry.kind === 'note') {
      if (entry.category === filter.value) out.push(entry)
      continue
    }
    if (entry.kind === 'death') {
      out.push(entry)
      continue
    }
    // Cabeçalho de ano: entra provisoriamente e sai se nada vier atrás.
    const last = out[out.length - 1]
    if (last?.kind === 'year') out.pop()
    out.push(entry)
  }
  const last = out[out.length - 1]
  if (last?.kind === 'year') out.pop()
  return out
})

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
  <div class="flex h-full flex-col">
    <div class="flex shrink-0 gap-3 overflow-x-auto border-b border-rule px-4 py-1.5">
      <button
        v-for="option in FILTERS"
        :key="option.key"
        type="button"
        class="shrink-0 py-1 text-[11px] tracking-wide uppercase transition-colors duration-100"
        :class="filter === option.key ? 'text-ochre' : 'text-muted'"
        :aria-pressed="filter === option.key"
        @click="filter = option.key"
      >
        {{ option.label }}
      </button>
    </div>

  <div
    ref="scroller"
    class="min-h-0 flex-1 scroll-pane px-4 pt-3 pb-20"
    role="log"
    aria-live="polite"
    aria-label="Linha do tempo"
  >
    <template v-for="(entry, index) in visible" :key="index">
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
  </div>
</template>
