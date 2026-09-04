<script setup lang="ts">
import { ref } from 'vue'
import ActionEcho from '../ActionEcho.vue'
import { relationLabel } from '../../engine/labels'
import { useGameStore } from '../../stores/game'

const store = useGameStore()

// Uma pessoa aberta por vez: com sete pessoas e seis ações cada, tudo aberto
// seria uma parede de quarenta botões.
const open = ref<string | null>(null)

// Chave é pessoa+ação: a mesma ação em duas pessoas são duas perguntas.
const pending = ref<string | null>(null)

function toggle(id: string): void {
  open.value = open.value === id ? null : id
  pending.value = null
}

function attempt(personId: string, actionId: string, question: string | undefined): void {
  if (question === undefined) {
    void store.actOnPerson(personId, actionId)
    return
  }
  const key = `${personId}:${actionId}`
  pending.value = pending.value === key ? null : key
}

function confirmAction(personId: string, actionId: string): void {
  pending.value = null
  void store.actOnPerson(personId, actionId)
}
</script>

<template>
  <div class="h-full scroll-pane px-4 pt-4 pb-20">
    <div class="flex items-baseline justify-between border-b border-ink pb-1">
      <h2 class="font-serif text-sm tracking-wide uppercase">Pessoas</h2>
      <span class="font-serif text-lg tabular-nums">{{ store.state?.actionPoints ?? 0 }}</span>
    </div>

    <ActionEcho />

    <ul v-if="store.people.length" class="divide-y divide-rule">
      <li v-for="person in store.people" :key="person.id">
        <button
          type="button"
          class="w-full py-3 text-left transition-colors duration-100 active:bg-panel"
          :aria-expanded="open === person.id"
          @click="toggle(person.id)"
        >
          <div class="flex items-baseline justify-between gap-3">
            <span class="truncate text-sm">{{ person.name }}</span>
            <span class="shrink-0 text-xs text-muted">
              {{ relationLabel(person.kind, person.gender) }} · {{ person.age }}
            </span>
          </div>
          <div class="mt-1.5 flex items-center gap-2">
            <!-- O número existe porque as ações têm requisito numérico de
                 relação ("Requer 60"): comparar com uma barra era adivinhação. -->
            <div
              class="h-1.5 min-w-0 flex-1 bg-rule"
              role="progressbar"
              :aria-label="`Relação com ${person.name}`"
              :aria-valuenow="person.relation"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="h-full bg-ochre" :style="{ width: `${person.relation}%` }" />
            </div>
            <span class="shrink-0 font-serif text-xs tabular-nums text-muted">
              {{ person.relation }}
            </span>
          </div>
        </button>

        <ul v-if="open === person.id" class="mb-3 border-l-2 border-ochre pl-3">
          <li v-for="action in store.actionsForPerson(person)" :key="action.id">
            <button
              type="button"
              class="flex min-h-[48px] w-full items-start justify-between gap-3 py-2 text-left transition-colors duration-100"
              :class="action.enabled ? 'active:bg-panel' : 'cursor-not-allowed text-muted'"
              :disabled="!action.enabled"
              @click="attempt(person.id, action.id, action.confirm)"
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

            <div
              v-if="pending === `${person.id}:${action.id}`"
              class="mb-2 border-l-2 border-rust pl-3"
            >
              <p class="text-[11px] leading-snug text-rust">{{ action.confirm }}</p>
              <div class="mt-2 flex gap-2">
                <button
                  type="button"
                  class="min-h-[44px] flex-1 border border-ink px-3 text-xs active:bg-panel"
                  @click="pending = null"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="min-h-[44px] flex-1 bg-rust px-3 text-xs text-paper active:opacity-80"
                  @click="confirmAction(person.id, action.id)"
                >
                  Confirmar
                </button>
              </div>
            </div>
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
