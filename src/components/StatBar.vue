<script setup lang="ts">
defineProps<{ label: string; value: number }>()
</script>

<template>
  <div class="py-1.5">
    <div class="flex items-baseline justify-between text-xs">
      <span>{{ label }}</span>
      <span class="font-serif text-sm tabular-nums">{{ value }}</span>
    </div>
    <div class="mt-1 h-1.5 w-full bg-rule">
      <div class="h-full bg-ochre" :style="{ width: `${value}%` }" />
    </div>
  </div>
</template>
