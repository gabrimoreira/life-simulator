<script setup lang="ts">
import { ref } from 'vue'
import { relationLabel } from '../../engine/labels'
import { useGameStore } from '../../stores/game'

const store = useGameStore()

// Uma pessoa aberta por vez: com sete pessoas e seis ações cada, tudo aberto
// seria uma parede de quarenta botões.
const open = ref<string | null>(null)

function toggle(id: string): void {
  open.value = open.value === id ? null : id
}
</script>

<template>
  <div class="h-full overflow-y-auto px-4 py-4">
    <div class="flex items-baseline justify-between border-b border-ink pb-1">
      <h2 class="font-serif text-sm tracking-wide uppercase">Pessoas</h2>
      <span class="font-serif text-lg tabular-nums">{{ store.state?.actionPoints ?? 0 }}</span>
    </div>

    <ul v-if="store.people.length" class="divide-y divide-rule">
      <li v-for="person in store.people" :key="person.id">
        <button
          type="button"
          class="w-full py-3 text-left transition-colors duration-100 active:bg-panel"
          @click="toggle(person.id)"
        >
          <div class="flex items-baseline justify-between gap-3">
            <span class="truncate text-sm">{{ person.name }}</span>
            <span class="shrink-0 text-xs text-muted">
              {{ relationLabel(person.kind, person.gender) }} · {{ person.age }}
            </span>
          </div>
          <div class="mt-1.5 h-1.5 w-full bg-rule">
            <div class="h-full bg-ochre" :style="{ width: `${person.relation}%` }" />
          </div>
        </button>

        <ul v-if="open === person.id" class="mb-3 border-l-2 border-ochre pl-3">
          <li v-for="action in store.actionsForPerson(person)" :key="action.id">
            <button
              type="button"
              class="flex min-h-[48px] w-full items-start justify-between gap-3 py-2 text-left transition-colors duration-100"
              :class="action.enabled ? 'active:bg-panel' : 'cursor-not-allowed text-muted'"
              :disabled="!action.enabled"
              @click="store.actOnPerson(person.id, action.id)"
            >
              <span class="min-w-0 flex-1">
                <span class="block text-sm leading-snug">{{ action.label }}</span>
                <span class="mt-0.5 block text-[11px] leading-snug text-muted">
                  {{ action.hint }}
                </span>
                <span v-if="action.reason" class="mt-0.5 block text-[11px] text-rust">
                  {{ action.reason }}
                </span>
              </span>
              <span
                class="shrink-0 pt-0.5 font-serif text-xs tabular-nums"
                :class="action.enabled ? 'text-ochre' : 'text-muted'"
              >
                {{ action.cost === 0 ? '—' : `${action.cost} PA` }}
              </span>
            </button>
          </li>
        </ul>
      </li>
    </ul>

    <p v-else class="mt-3 text-sm text-muted">Ninguém por perto.</p>

    <p class="mt-6 border-l-2 border-rule pl-3 text-[11px] leading-relaxed text-muted">
      Toque numa pessoa para ver o que dá para fazer. Relações esfriam sozinhas todo ano — a barra
      chega a zero se você não aparecer.
    </p>
  </div>
</template>
