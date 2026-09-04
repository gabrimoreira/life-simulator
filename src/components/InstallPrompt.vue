<script setup lang="ts">
// A captura do evento vive em `src/install.ts`, registrada no carregamento do
// módulo. Este componente só desenha o que já foi guardado lá.
import { deferredInstall, rememberDismissal } from '../install'

async function install(): Promise<void> {
  const event = deferredInstall.value
  if (!event) return
  deferredInstall.value = null
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'dismissed') rememberDismissal()
}

function dismiss(): void {
  deferredInstall.value = null
  rememberDismissal()
}
</script>

<template>
  <div
    v-if="deferredInstall"
    class="flex shrink-0 items-center gap-3 border-b border-ink bg-panel px-4 py-2.5"
  >
    <p class="min-w-0 flex-1 text-[11px] leading-snug">
      Instale para jogar offline, sem barra de navegador.
    </p>
    <button
      type="button"
      class="min-h-[44px] shrink-0 border border-ink px-3 text-xs active:bg-rule"
      @click="dismiss"
    >
      Agora não
    </button>
    <button
      type="button"
      class="min-h-[44px] shrink-0 bg-ochre px-3 text-xs text-paper active:opacity-80"
      @click="install"
    >
      Instalar
    </button>
  </div>
</template>
