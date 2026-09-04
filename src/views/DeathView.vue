<script setup lang="ts">
import { computed, ref } from 'vue'
import { FLAG_LABELS } from '../content/flags'
import { EDUCATION_LABELS, SOCIAL_CLASS_LABELS, STAT_LABELS } from '../engine/labels'
import { formatMoney } from '../engine/text'
import { VISIBLE_STAT_KEYS } from '../engine/types'
import { relationLabel } from '../engine/labels'
import type { Character, TimelineEntry } from '../engine/types'
import { useGameStore } from '../stores/game'

const props = defineProps<{ character: Character; timeline: TimelineEntry[] }>()
defineEmits<{ restart: [] }>()

const store = useGameStore()
const confirming = ref(false)
const chosen = computed(() => props.timeline.filter((entry) => entry.kind === 'note').length)

// As mesmas Marcas do Perfil: elas descrevem a vida e sumiam justamente na
// tela que existe para resumi-la.
const marks = computed(() =>
  Object.entries(props.character.flags)
    .filter(([key, value]) => value && key in FLAG_LABELS)
    .map(([key]) => FLAG_LABELS[key])
    .sort(),
)
</script>

<template>
  <div
    class="h-full scroll-pane px-6 py-10"
    :style="{
      paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
      paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
    }"
  >
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
        <dd class="text-right tabular-nums" :class="store.worth < 0 ? 'text-rust' : ''">
          {{ formatMoney(store.worth) }}
        </dd>
        <dt class="text-muted">Carreira</dt>
        <dd class="text-right">{{ store.peakJob ?? 'Nunca teve cargo' }}</dd>
        <dt class="text-muted">Filhos</dt>
        <dd class="text-right tabular-nums">{{ store.lifeSummary?.children ?? 0 }}</dd>
        <dt v-if="store.lifeSummary?.hadRecord" class="text-muted">Ficha</dt>
        <dd v-if="store.lifeSummary?.hadRecord" class="text-right text-rust">Suja</dd>
        <dt class="text-muted">Momentos vividos</dt>
        <dd class="text-right tabular-nums">{{ chosen }}</dd>
      </dl>
    </section>

    <section v-if="marks.length" class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Marcas</h2>
      <ul class="mt-2 space-y-1 text-sm">
        <li v-for="mark in marks" :key="mark" class="flex gap-2">
          <span class="text-ochre">—</span>
          <span>{{ mark }}</span>
        </li>
      </ul>
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

    <section v-if="store.achievements.length" class="mt-6">
      <h2 class="flex items-baseline justify-between border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        <span>Conquistas</span>
        <span class="tabular-nums">
          {{ store.achievements.length }}/{{ store.allAchievements.length }}
        </span>
      </h2>
      <ul class="mt-2 space-y-2">
        <li v-for="item in store.achievements" :key="item.id">
          <span class="block text-sm">{{ item.name }}</span>
          <span class="block text-[11px] leading-snug text-muted">{{ item.description }}</span>
        </li>
      </ul>
    </section>

    <section v-if="store.canContinueLineage" class="mt-8">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Continuar a linhagem
      </h2>
      <p class="mt-2 text-[11px] leading-relaxed text-muted">
        Seu filho herda uma parte do patrimônio e metade dos seus atributos. O resto ele constrói
        sozinho.
      </p>
      <ul class="mt-2 divide-y divide-rule">
        <li v-for="heir in store.heirs" :key="heir.id">
          <button
            type="button"
            class="flex min-h-[56px] w-full items-baseline justify-between gap-3 py-3 text-left transition-colors duration-100 active:bg-panel"
            @click="store.continueAsHeir(heir.id)"
          >
            <span class="truncate text-sm">{{ heir.name }}</span>
            <span class="shrink-0 text-xs text-muted">
              {{ relationLabel(heir.kind, heir.gender) }} · {{ heir.age }} anos
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- A vida inteira ficava só no `.length`: o jogador acabava de vivê-la e
         ela sumia no clique seguinte, sem uma última leitura. -->
    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        A vida inteira
      </h2>
      <div class="mt-2 max-h-[40vh] scroll-pane border border-rule px-3 py-2">
        <template v-for="(entry, index) in timeline" :key="index">
          <p v-if="entry.kind === 'year'" class="mt-2 font-serif text-sm tabular-nums first:mt-0">
            {{ entry.year }} · {{ entry.age }} anos
          </p>
          <p v-else-if="entry.kind === 'note'" class="text-[11px] leading-relaxed text-muted">
            {{ entry.text }}
          </p>
        </template>
      </div>
    </section>

    <!-- Com herdeiro disponível, recomeçar do zero descarta a linhagem inteira
         e não tem volta: aqui vale o segundo toque. -->
    <div v-if="confirming" class="mt-8 border-l-2 border-rust pl-3">
      <p class="text-[11px] leading-snug text-rust">
        Começar do zero apaga esta família e o patrimônio que ela deixou. Tem certeza?
      </p>
      <div class="mt-2 flex gap-2">
        <button
          type="button"
          class="min-h-[48px] flex-1 border border-ink px-3 text-xs active:bg-panel"
          @click="confirming = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="min-h-[48px] flex-1 bg-rust px-3 text-xs text-paper active:opacity-80"
          @click="$emit('restart')"
        >
          Confirmar
        </button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="mt-8 min-h-[56px] w-full font-serif text-lg tracking-wide uppercase active:opacity-80"
      :class="store.canContinueLineage ? 'border border-ink' : 'bg-ochre text-paper'"
      @click="store.canContinueLineage ? (confirming = true) : $emit('restart')"
    >
      {{ store.canContinueLineage ? 'Começar do zero' : 'Nova vida' }}
    </button>
    <p v-if="!store.canContinueLineage" class="mt-3 text-center text-xs text-muted">
      Sem filhos vivos, a história termina aqui.
    </p>
  </div>
</template>
