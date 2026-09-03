<script setup lang="ts">
import { computed } from 'vue'
import { EDUCATION_LABELS, SOCIAL_CLASS_LABELS, STAT_LABELS } from '../engine/labels'
import { formatMoney } from '../engine/text'
import { VISIBLE_STAT_KEYS } from '../engine/types'
import type { Character, TimelineEntry } from '../engine/types'

const props = defineProps<{ character: Character; timeline: TimelineEntry[] }>()
defineEmits<{ restart: [] }>()

const chosen = computed(() => props.timeline.filter((entry) => entry.kind === 'note').length)
const net = computed(() => props.character.money - props.character.debt)
</script>

<template>
  <div class="h-full overflow-y-auto px-6 py-10">
    <p class="font-serif text-xs tracking-[0.2em] text-muted uppercase">Fim da linha</p>
    <h1 class="mt-1 font-serif text-3xl leading-tight">{{ character.name }}</h1>
    <p class="mt-1 font-serif text-lg text-muted tabular-nums">
      {{ character.birthYear }} — {{ character.birthYear + (character.deathAge ?? 0) }}
    </p>
    <div class="mt-4 h-px bg-ink" />

    <p class="mt-4 text-sm leading-relaxed">
      Morreu aos {{ character.deathAge }} anos, em {{ character.city }}/{{ character.uf }}, de
      {{ character.deathCause }}.
    </p>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Balanço</h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt class="text-muted">Origem</dt>
        <dd class="text-right">{{ SOCIAL_CLASS_LABELS[character.socialClass] }}</dd>
        <dt class="text-muted">Educação</dt>
        <dd class="text-right">{{ EDUCATION_LABELS[character.education] }}</dd>
        <dt class="text-muted">Patrimônio</dt>
        <dd class="text-right tabular-nums" :class="net < 0 ? 'text-rust' : ''">
          {{ formatMoney(net) }}
        </dd>
        <dt class="text-muted">Momentos vividos</dt>
        <dd class="text-right tabular-nums">{{ chosen }}</dd>
      </dl>
    </section>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Como você terminou
      </h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <template v-for="key in VISIBLE_STAT_KEYS" :key="key">
          <dt class="text-muted">{{ STAT_LABELS[key] }}</dt>
          <dd class="text-right tabular-nums">{{ character.stats[key] }}</dd>
        </template>
      </dl>
    </section>

    <button
      type="button"
      class="mt-8 min-h-[56px] w-full bg-ochre font-serif text-lg tracking-wide text-paper uppercase active:opacity-80"
      @click="$emit('restart')"
    >
      Nova vida
    </button>
    <p class="mt-3 text-center text-xs text-muted">
      Jogar como um filho, herdando parte do patrimônio, chega na Fase 3.
    </p>
  </div>
</template>
