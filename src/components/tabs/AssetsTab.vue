<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../../engine/text'
import type { Character } from '../../engine/types'

const props = defineProps<{ character: Character }>()

const net = computed(() => props.character.money - props.character.debt)
</script>

<template>
  <div class="h-full overflow-y-auto px-4 py-4">
    <section>
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Balanço</h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
        <dt class="text-muted">Dinheiro</dt>
        <dd class="text-right">{{ formatMoney(character.money) }}</dd>
        <dt class="text-muted">Dívida</dt>
        <dd class="text-right" :class="character.debt > 0 ? 'text-rust' : ''">
          {{ formatMoney(character.debt) }}
        </dd>
      </dl>
      <div class="mt-2 flex items-baseline justify-between border-t border-ink pt-2">
        <span class="font-serif text-sm tracking-wide uppercase">Líquido</span>
        <span
          class="font-serif text-lg tabular-nums"
          :class="net < 0 ? 'text-rust' : ''"
          >{{ formatMoney(net) }}</span
        >
      </div>
    </section>

    <p class="mt-6 border-l-2 border-rule pl-3 text-sm text-muted">
      Imóveis, veículos e investimentos entram na Fase 3. Por enquanto o patrimônio é só o caixa.
    </p>
  </div>
</template>
