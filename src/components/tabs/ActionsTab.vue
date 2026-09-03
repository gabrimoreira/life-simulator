<script setup lang="ts">
import { useGameStore } from '../../stores/game'

const store = useGameStore()
</script>

<template>
  <div class="h-full overflow-y-auto px-4 py-4">
    <div class="flex items-baseline justify-between border-b border-ink pb-1">
      <h2 class="font-serif text-sm tracking-wide uppercase">Pontos de ação</h2>
      <span class="font-serif text-lg tabular-nums">{{ store.state?.actionPoints ?? 0 }}</span>
    </div>
    <p class="mt-2 text-xs leading-relaxed text-muted">
      Você nunca faz tudo num ano. Os pontos voltam ao avançar.
    </p>

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
            @click="store.act(action.id)"
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
    </section>

    <p v-if="store.actionGroups.length === 0" class="mt-6 text-sm text-muted">
      Nada a fazer nesta idade. Avance o ano.
    </p>
  </div>
</template>
