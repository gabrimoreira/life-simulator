<script setup lang="ts">
// O que aparece quando o jogo quebra.
//
// Antes daqui, uma exceção dentro de `chooseOption` deixava a tela exatamente
// como estava: modal aberto, turno preso em 'resolving', nenhum botão
// respondendo e nenhuma mensagem. O jogo não tinha travado por design — tinha
// travado, e o jogador não tinha como saber disso nem como sair, a não ser
// limpando os dados do site e perdendo a vida inteira junto.
//
// Recarregar é a saída de verdade: o save no navegador é o do último estado
// que deu certo, porque a gravação só acontece depois da jogada.
import { useGameStore } from '../stores/game'

const store = useGameStore()

function recarregar(): void {
  window.location.reload()
}

function baixar(): void {
  const texto = store.exportSave()
  if (texto === null) return
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'vida-recuperada.json'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    v-if="store.fatal"
    class="fixed inset-0 z-50 flex items-end bg-ink/40 p-4"
    :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }"
    role="alertdialog"
    aria-labelledby="fatal-title"
  >
    <div class="w-full border border-ink bg-paper p-4">
      <h2 id="fatal-title" class="font-serif text-lg tracking-wide uppercase">Alguma coisa quebrou</h2>
      <p class="mt-2 text-sm leading-relaxed">
        O jogo parou no meio de uma jogada. A cópia guardada no navegador é a do último ano que
        deu certo — recarregar volta para lá.
      </p>
      <p class="mt-2 border-l-2 border-rust pl-3 text-[11px] leading-snug break-words text-muted">
        {{ store.fatal }}
      </p>

      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="min-h-[48px] flex-1 border border-ink px-3 text-xs active:bg-panel"
          @click="baixar"
        >
          Baixar cópia
        </button>
        <button
          type="button"
          class="min-h-[48px] flex-1 bg-ochre px-3 text-xs text-paper active:opacity-80"
          @click="recarregar"
        >
          Recarregar
        </button>
      </div>
      <button
        type="button"
        class="mt-2 min-h-[44px] w-full px-3 text-[11px] text-muted active:bg-panel"
        @click="store.dismissFatal()"
      >
        Continuar assim mesmo
      </button>
    </div>
  </div>
</template>
