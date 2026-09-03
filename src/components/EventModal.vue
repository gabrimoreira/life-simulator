<script setup lang="ts">
import type { OptionStatus } from '../stores/game'

defineProps<{ text: string; options: OptionStatus[] }>()
defineEmits<{ choose: [number] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 px-3 pb-3 sm:items-center">
    <div
      class="modal-card w-full max-w-[456px] border border-ink bg-paper"
      role="dialog"
      aria-modal="true"
    >
      <p class="border-b border-rule px-4 py-4 font-serif text-base leading-relaxed">
        {{ text }}
      </p>

      <div class="divide-y divide-rule">
        <button
          v-for="(option, index) in options"
          :key="index"
          type="button"
          class="flex min-h-[56px] w-full flex-col justify-center gap-0.5 px-4 py-3 text-left transition-colors duration-100"
          :class="
            option.enabled ? 'active:bg-panel' : 'cursor-not-allowed text-muted'
          "
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
