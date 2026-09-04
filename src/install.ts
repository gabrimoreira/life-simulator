// Convite de instalacao do PWA.
//
// O listener mora AQUI, e nao dentro de um componente, porque o Chrome dispara
// `beforeinstallprompt` logo depois do load — e antes o componente so existia
// dentro do jogo (GameView). Quem abria o app pela primeira vez estava na tela
// de novo jogo, o evento se perdia, e o jogador que ainda nao instalou era
// exatamente o unico que nunca via o convite.
//
// Registrar no import garante que o evento e capturado antes de o Vue montar
// qualquer tela; o componente so le o que ja foi guardado aqui.

import { ref } from 'vue'
import type { Ref } from 'vue'

/** O evento nao esta no lib.dom padrao; e isto que ele expoe. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'lifesim.installDismissed'

export const deferredInstall: Ref<InstallPromptEvent | null> = ref(null)

function alreadyInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    // Modo privativo: sem memoria, mostra de novo. Melhor que quebrar.
    return false
  }
}

export function rememberDismissal(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // idem
  }
}

export function listenForInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Segurar o evento e o que permite oferecer a instalacao na hora certa,
    // em vez de deixar o navegador decidir por conta.
    event.preventDefault()
    if (alreadyInstalled() || wasDismissed()) return
    deferredInstall.value = event as InstallPromptEvent
  })
}
