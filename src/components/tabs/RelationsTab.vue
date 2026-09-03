<script setup lang="ts">
import { relationLabel } from '../../engine/labels'
import type { Person } from '../../engine/types'

defineProps<{ relations: Person[] }>()
</script>

<template>
  <div class="h-full overflow-y-auto px-4 py-4">
    <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Pessoas</h2>

    <ul v-if="relations.length" class="divide-y divide-rule">
      <li v-for="person in relations" :key="person.id" class="py-3">
        <div class="flex items-baseline justify-between gap-3">
          <span class="truncate text-sm">{{ person.name }}</span>
          <span class="shrink-0 text-xs text-muted">
            {{ relationLabel(person.kind, person.gender) }} · {{ person.age }}
          </span>
        </div>
        <div class="mt-1.5 h-1.5 w-full bg-rule">
          <div class="h-full bg-ochre" :style="{ width: `${person.relation}%` }" />
        </div>
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-muted">Ninguém por perto.</p>

    <p class="mt-6 border-l-2 border-rule pl-3 text-sm text-muted">
      Conversar, presentear e brigar entram na Fase 3. Aqui as relações só decaem se você não
      fizer nada — e por enquanto não há nada a fazer.
    </p>
  </div>
</template>
