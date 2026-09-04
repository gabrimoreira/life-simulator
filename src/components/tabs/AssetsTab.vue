<script setup lang="ts">
import { computed } from 'vue'
import { CLASS_PROFILES } from '../../engine/balance'
import { formatMoney } from '../../engine/text'
import type { AssetKind, Character } from '../../engine/types'
import { useGameStore } from '../../stores/game'

const props = defineProps<{ character: Character }>()
const store = useGameStore()

const livingFloor = computed(() => CLASS_PROFILES[props.character.socialClass].costOfLiving)

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
      <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
        <dt class="text-muted">{{ store.income.label }}</dt>
        <dd class="text-right">{{ formatMoney(store.income.value) }}</dd>
        <dt class="text-muted">Custo de vida mínimo</dt>
        <dd class="text-right">{{ formatMoney(livingFloor) }}</dd>
      </dl>
      <p class="mt-2 text-[11px] leading-relaxed text-muted">
        Quem ganha mais gasta mais: o custo de vida real é o maior entre esse piso e uma fatia da
        renda do ano. Comprar e vender bens fica na aba Ações.
      </p>
    </section>
  </div>
</template>
