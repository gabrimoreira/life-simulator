<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { OptionStatus } from '../stores/game'

const props = defineProps<{ text: string; options: OptionStatus[] }>()
defineEmits<{ choose: [number] }>()

const card = ref<HTMLElement | null>(null)

/**
 * O modal bloqueia o turno: enquanto ele está aberto não há nada mais para
 * fazer na tela. Sem levar o foco para dentro, quem navega por teclado ficava
 * atrás dele, tabulando por botões inertes de uma tela que não responde.
 */
function focusFirstOption(): void {
  const first = card.value?.querySelector<HTMLButtonElement>('button:not([disabled])')
  first?.focus()
}

onMounted(focusFirstOption)
watch(() => props.text, () => void nextTick(focusFirstOption))

/** Prende o Tab dentro do card, pelo mesmo motivo. */
function trap(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !card.value) return
  const focusable = [...card.value.querySelectorAll<HTMLButtonElement>('button:not([disabled])')]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 px-3 pb-3 sm:items-center"
    :style="{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }"
    @keydown="trap"
  >
    <div
      ref="card"
      class="modal-card w-full max-w-[456px] border border-ink bg-paper"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-text"
    >
      <p
        id="event-text"
        class="border-b border-rule px-4 py-4 font-serif text-base leading-relaxed"
      >
        {{ text }}
      </p>

      <div class="divide-y divide-rule">
        <button
          v-for="(option, index) in options"
          :key="index"
          type="button"
          class="flex min-h-[56px] w-full flex-col justify-center gap-0.5 px-4 py-3 text-left transition-colors duration-100"
          :class="option.enabled ? 'active:bg-panel' : 'cursor-not-allowed text-muted'"
          :disabled="!option.enabled"
          @click="option.enabled && $emit('choose', index)"
        >
          <span class="text-sm leading-snug">{{ option.text }}</span>
          <span v-if="option.reason" class="text-[11px] text-rust">{{ option.reason }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  animation: rise 130ms ease-out;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-card {
    animation: none;
  }
}
</style>
