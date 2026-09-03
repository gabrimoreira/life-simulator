<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/** O evento não está no lib.dom padrão; é isto que ele expõe. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'lifesim.installDismissed'

const deferred = ref<InstallPromptEvent | null>(null)

function alreadyInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    // Modo privativo: sem memória, mostra de novo. Melhor que quebrar.
    return false
  }
}

function capture(event: Event): void {
  // Segurar o evento é o que permite oferecer a instalação na hora certa, em
  // vez de deixar o navegador decidir por conta.
  event.preventDefault()
  if (alreadyInstalled() || wasDismissed()) return
  deferred.value = event as InstallPromptEvent
}

function remember(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // idem
  }
}

async function install(): Promise<void> {
  const event = deferred.value
  if (!event) return
  deferred.value = null
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'dismissed') remember()
}

function dismiss(): void {
  deferred.value = null
  remember()
}

onMounted(() => window.addEventListener('beforeinstallprompt', capture))
onUnmounted(() => window.removeEventListener('beforeinstallprompt', capture))
</script>

<template>
  <div
    v-if="deferred"
    class="flex items-center gap-3 border-t border-ink bg-panel px-4 py-2.5"
  >
    <p class="min-w-0 flex-1 text-[11px] leading-snug">
      Instale para jogar offline, sem barra de navegador.
    </p>
    <button
      type="button"
      class="min-h-[36px] shrink-0 border border-ink px-3 text-xs active:bg-rule"
      @click="dismiss"
    >
      Agora não
    </button>
    <button
      type="button"
      class="min-h-[36px] shrink-0 bg-ochre px-3 text-xs text-paper active:opacity-80"
      @click="install"
    >
      Instalar
    </button>
  </div>
</template>
