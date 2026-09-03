<script setup lang="ts">
import { computed } from 'vue'
import { CLASS_PROFILES } from '../../engine/balance'
import { formatMoney } from '../../engine/text'
import type { Character } from '../../engine/types'
import { useGameStore } from '../../stores/game'

const props = defineProps<{ character: Character }>()
const store = useGameStore()

const net = computed(() => props.character.money - props.character.debt)
const salary = computed(() => store.currentSalary)
const livingFloor = computed(() => CLASS_PROFILES[props.character.socialClass].costOfLiving)
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

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Fluxo anual
      </h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
        <dt class="text-muted">{{ store.jobTitle ? 'Salário base' : 'Renda informal' }}</dt>
        <dd class="text-right">{{ formatMoney(salary) }}</dd>
        <dt class="text-muted">Custo de vida mínimo</dt>
        <dd class="text-right">{{ formatMoney(livingFloor) }}</dd>
      </dl>
      <p class="mt-2 text-[11px] leading-relaxed text-muted">
        Quem ganha mais gasta mais: o custo de vida real é o maior entre esse piso e uma fatia da
        renda do ano.
      </p>
    </section>

    <p class="mt-6 border-l-2 border-rule pl-3 text-sm text-muted">
      Imóveis, veículos e investimentos entram na Fase 3. Por enquanto o patrimônio é só o caixa.
    </p>
  </div>
</template>
