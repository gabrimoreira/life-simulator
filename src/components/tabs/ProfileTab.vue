<script setup lang="ts">
import { computed } from 'vue'
import { FLAG_LABELS } from '../../content/flags'
import { formatMoney } from '../../engine/text'
import { EDUCATION_LABELS, SOCIAL_CLASS_LABELS, STAT_LABELS } from '../../engine/labels'
import { FAME_VISIBILITY_THRESHOLD, VISIBLE_STAT_KEYS } from '../../engine/types'
import type { Character } from '../../engine/types'
import { useGameStore } from '../../stores/game'
import StatBar from '../StatBar.vue'

const props = defineProps<{ character: Character }>()
const store = useGameStore()

// Fama só aparece para quem tem alguma: "Fama 0" para um contador é ruído.
const showFame = computed(() => props.character.stats.fame >= FAME_VISIBILITY_THRESHOLD)

const marks = computed(() =>
  Object.entries(props.character.flags)
    .filter(([key, value]) => value && key in FLAG_LABELS)
    .map(([key]) => FLAG_LABELS[key])
    .sort(),
)
</script>

<template>
  <div class="h-full overflow-y-auto px-4 py-4">
    <section>
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Atributos
      </h2>
      <div class="mt-2">
        <StatBar
          v-for="key in VISIBLE_STAT_KEYS"
          :key="key"
          :label="STAT_LABELS[key]"
          :value="character.stats[key]"
        />
        <StatBar v-if="showFame" :label="STAT_LABELS.fame" :value="character.stats.fame" />
      </div>
    </section>

    <section v-if="character.prison" class="mt-6">
      <h2 class="border-b border-ink pb-1 font-serif text-sm tracking-wide uppercase">Preso</h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt class="text-muted">Motivo</dt>
        <dd class="text-right">{{ character.prison.reason }}</dd>
        <dt class="text-muted">Cumprido</dt>
        <dd class="text-right tabular-nums">{{ character.prison.yearsServed }}</dd>
        <dt class="text-muted">Restam</dt>
        <dd class="text-right tabular-nums text-rust">{{ character.prison.yearsLeft }}</dd>
      </dl>
    </section>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Trabalho
      </h2>
      <dl v-if="store.jobTitle" class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt class="text-muted">Cargo</dt>
        <dd class="text-right">{{ store.jobTitle }}</dd>
        <dt class="text-muted">Desempenho</dt>
        <dd class="text-right tabular-nums">{{ character.career?.performance ?? 0 }}</dd>
        <dt class="text-muted">Tempo no cargo</dt>
        <dd class="text-right tabular-nums">
          {{ character.career?.yearsInLevel ?? 0 }}
          {{ (character.career?.yearsInLevel ?? 0) === 1 ? 'ano' : 'anos' }}
        </dd>
      </dl>
      <dl
        v-else-if="character.pension > 0"
        class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm"
      >
        <dt class="text-muted">Situação</dt>
        <dd class="text-right">Aposentado</dd>
        <dt class="text-muted">Pensão anual</dt>
        <dd class="text-right tabular-nums">{{ formatMoney(character.pension) }}</dd>
      </dl>
      <p v-else class="mt-2 text-sm text-muted">Sem trabalho no momento.</p>
    </section>

    <section v-if="store.studying" class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Estudando
      </h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt class="text-muted">Curso</dt>
        <dd class="text-right">{{ store.studying.name }}</dd>
        <dt class="text-muted">Faltam</dt>
        <dd class="text-right tabular-nums">
          {{ store.studying.yearsLeft }}
          {{ store.studying.yearsLeft === 1 ? 'ano' : 'anos' }}
        </dd>
        <dt class="text-muted">Pagamento</dt>
        <dd class="text-right">{{ store.studying.financed ? 'Financiado' : 'Em dia' }}</dd>
      </dl>
    </section>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Origem</h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt class="text-muted">Nascimento</dt>
        <dd class="text-right">{{ character.birthYear }}</dd>
        <dt class="text-muted">Cidade</dt>
        <dd class="text-right">{{ character.city }}/{{ character.uf }}</dd>
        <dt class="text-muted">Classe</dt>
        <dd class="text-right">{{ SOCIAL_CLASS_LABELS[character.socialClass] }}</dd>
        <dt class="text-muted">Educação</dt>
        <dd class="text-right">{{ EDUCATION_LABELS[character.education] }}</dd>
      </dl>
    </section>

    <section v-if="store.achievements.length" class="mt-6">
      <h2 class="flex items-baseline justify-between border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        <span>Conquistas</span>
        <span class="tabular-nums">{{ store.achievements.length }}</span>
      </h2>
      <ul class="mt-2 space-y-2">
        <li v-for="item in store.achievements" :key="item.id">
          <span class="block text-sm">{{ item.name }}</span>
          <span class="block text-[11px] leading-snug text-muted">{{ item.description }}</span>
        </li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Marcas</h2>
      <ul v-if="marks.length" class="mt-2 space-y-1 text-sm">
        <li v-for="mark in marks" :key="mark" class="flex gap-2">
          <span class="text-ochre">—</span>
          <span>{{ mark }}</span>
        </li>
      </ul>
      <p v-else class="mt-2 text-sm text-muted">Nada de notável até agora.</p>
    </section>
  </div>
</template>
