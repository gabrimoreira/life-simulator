<script setup lang="ts">
import { ref } from 'vue'
import ActionEcho from '../ActionEcho.vue'
import { useGameStore } from '../../stores/game'

const store = useGameStore()

// Confirmação inline, no lugar do próprio botão: `confirm()` do navegador é
// um diálogo de sistema no meio de uma tela que não tem nenhum outro.
const pending = ref<string | null>(null)

function attempt(id: string, question: string | undefined): void {
  if (question === undefined) {
    void store.act(id)
    return
  }
  pending.value = pending.value === id ? null : id
}

function confirmAction(id: string): void {
  pending.value = null
  void store.act(id)
}
</script>

<template>
  <div class="h-full scroll-pane px-4 pt-4 pb-20">
    <div class="flex items-baseline justify-between border-b border-ink pb-1">
      <h2 class="font-serif text-sm tracking-wide uppercase">Pontos de ação</h2>
      <span class="font-serif text-lg tabular-nums">{{ store.state?.actionPoints ?? 0 }}</span>
    </div>
    <p class="mt-2 text-xs leading-relaxed text-muted">
      Você nunca faz tudo num ano. Os pontos voltam ao avançar.
    </p>

    <ActionEcho />

    <section v-for="group in store.actionGroups" :key="group.key" class="mt-6">
      <h3 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        {{ group.label }}
      </h3>

      <ul class="divide-y divide-rule">
        <li v-for="action in group.actions" :key="action.id">
          <button
            type="button"
            class="flex min-h-[56px] w-full items-start justify-between gap-3 py-3 text-left transition-colors duration-100"
            :class="action.enabled ? 'active:bg-panel' : 'cursor-not-allowed text-muted'"
            :disabled="!action.enabled"
            @click="attempt(action.id, action.confirm)"
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

          <div v-if="pending === action.id" class="mb-3 border-l-2 border-rust pl-3">
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
                @click="confirmAction(action.id)"
              >
                Confirmar
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <p v-if="store.actionGroups.length === 0" class="mt-6 text-sm text-muted">
      Nada a fazer nesta idade. Avance o ano.
    </p>
  </div>
</template>
