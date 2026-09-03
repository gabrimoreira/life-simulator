<script setup lang="ts">
import { computed } from 'vue'
import { FLAG_LABELS } from '../../content/flags'
import { EDUCATION_LABELS, SOCIAL_CLASS_LABELS, STAT_LABELS } from '../../engine/labels'
import { VISIBLE_STAT_KEYS } from '../../engine/types'
import type { Character } from '../../engine/types'
import StatBar from '../StatBar.vue'

const props = defineProps<{ character: Character }>()

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
      </div>
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
