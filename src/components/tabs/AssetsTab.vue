<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../../engine/text'
import type { AssetKind, Character } from '../../engine/types'
import { useGameStore } from '../../stores/game'

defineProps<{ character: Character }>()
const store = useGameStore()

const KIND_LABELS: Record<AssetKind, string> = {
  property: 'Imóveis',
  vehicle: 'Veículos',
  investment: 'Investimentos',
}

const groups = computed(() => {
  const order: AssetKind[] = ['property', 'vehicle', 'investment']
  return order
    .map((kind) => ({
      kind,
      label: KIND_LABELS[kind],
      items: store.assets.filter((a) => a.def.kind === kind),
    }))
    .filter((group) => group.items.length > 0)
})

/** Quanto o bem andou desde a compra, em reais. */
function drift(value: number, price: number): number {
  return value - price
}
</script>

<template>
  <div class="h-full scroll-pane px-4 pt-4 pb-20">
    <section>
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Balanço</h2>
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
        <dt class="text-muted">Dinheiro</dt>
        <dd class="text-right">{{ formatMoney(character.money) }}</dd>
        <dt class="text-muted">Bens</dt>
        <dd class="text-right">{{ formatMoney(store.worth - character.money + character.debt) }}</dd>
        <dt class="text-muted">Dívida</dt>
        <dd class="text-right" :class="character.debt > 0 ? 'text-rust' : ''">
          {{ formatMoney(character.debt) }}
        </dd>
      </dl>
      <div class="mt-2 flex items-baseline justify-between border-t border-ink pt-2">
        <span class="font-serif text-sm tracking-wide uppercase">Patrimônio</span>
        <span
          class="font-serif text-lg tabular-nums"
          :class="store.worth < 0 ? 'text-rust' : ''"
          >{{ formatMoney(store.worth) }}</span
        >
      </div>
    </section>

    <section v-for="group in groups" :key="group.kind" class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        {{ group.label }}
      </h2>
      <ul class="divide-y divide-rule">
        <li v-for="item in group.items" :key="item.owned.assetId" class="py-2.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="truncate text-sm">{{ item.def.name }}</span>
            <span class="shrink-0 text-sm tabular-nums">{{ formatMoney(item.owned.value) }}</span>
          </div>
          <div class="mt-0.5 flex items-baseline justify-between gap-3 text-[11px] tabular-nums">
            <span class="text-muted">
              desde {{ item.owned.boughtYear }} · manutenção
              {{ formatMoney(Math.round(item.owned.value * item.def.upkeepRate)) }}/ano
            </span>
            <span
              class="shrink-0"
              :class="drift(item.owned.value, item.def.price) >= 0 ? 'text-ochre' : 'text-rust'"
            >
              {{ drift(item.owned.value, item.def.price) >= 0 ? '+' : '−'
              }}{{ formatMoney(Math.abs(drift(item.owned.value, item.def.price))) }}
            </span>
          </div>
        </li>
      </ul>
    </section>

    <section class="mt-6">
      <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">
        Fluxo anual
      </h2>
      <!-- Esta tela mostrava o PISO da classe social como "custo de vida
           mínimo" e explicava em letra miúda que o número real era outro — o
           que ela não mostrava. `costOfLiving` e `spouseIncome` já calculavam
           os dois desde a Fase 6, e ninguém os chamava. -->
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
        <dt class="text-muted">{{ store.income.label }}</dt>
        <dd class="text-right">{{ formatMoney(store.income.value) }}</dd>
        <template v-if="store.spouseContribution > 0">
          <dt class="text-muted">Cônjuge</dt>
          <dd class="text-right">{{ formatMoney(store.spouseContribution) }}</dd>
        </template>
        <dt class="text-muted">Custo de vida</dt>
        <dd class="text-right text-rust">−{{ formatMoney(store.yearCost) }}</dd>
      </dl>
      <div class="mt-2 flex items-baseline justify-between border-t border-rule pt-2 text-sm">
        <span class="text-muted">Sobra por ano</span>
        <span
          class="tabular-nums"
          :class="store.income.value + store.spouseContribution - store.yearCost < 0 ? 'text-rust' : ''"
        >
          {{ formatMoney(store.income.value + store.spouseContribution - store.yearCost) }}
        </span>
      </div>
      <p class="mt-2 text-[11px] leading-relaxed text-muted">
        Quem ganha mais gasta mais: o custo de vida sobe junto com a renda e nunca cai abaixo da
        subsistência. Não entram aqui a manutenção dos bens, a conta de uma condição crônica nem o
        que um vício cobra. Comprar e vender bens fica na aba Ações.
      </p>
    </section>
  </div>
</template>
