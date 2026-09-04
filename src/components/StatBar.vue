<script setup lang="ts">
defineProps<{ label: string; value: number }>()
</script>

<template>
  <div class="py-1.5">
    <div class="flex items-baseline justify-between text-xs">
      <span>{{ label }}</span>
      <span class="font-serif text-sm tabular-nums">{{ value }}</span>
    </div>
    <!-- A barra é redundante com o número ao lado, mas um leitor de tela
         anunciava só um <div> vazio; com o role ela vira a mesma informação. -->
    <div
      class="mt-1 h-1.5 w-full bg-rule"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="value"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="h-full bg-ochre" :style="{ width: `${value}%` }" />
    </div>
  </div>
</template>
