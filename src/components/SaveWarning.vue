<script setup lang="ts">
// Aviso de persistência.
//
// Save corrompido era descartado em silêncio: o jogador perdia uma vida de
// setenta anos e caía na tela de novo jogo, sem explicação nenhuma e sem a
// chance de guardar o arquivo. Escrita falhando também era silenciosa — só se
// descobria ao recarregar a página, quando já era tarde.
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()

const texto = computed(() => {
  const problem = store.saveProblem
  if (!problem) return null
  switch (problem.kind) {
    case 'corrupted':
      return 'O save anterior não pôde ser lido e essa vida se perdeu. Dá para baixar o arquivo cru abaixo, caso queira guardá-lo.'
    case 'unreadable':
      return 'Este navegador não deixa ler nem gravar dados. O jogo funciona, mas nada será salvo ao fechar a aba.'
    case 'unwritable':
      return 'Não está sendo possível salvar — o armazenamento está cheio ou bloqueado. O que você jogar agora se perde ao fechar a aba.'
    default:
      return null
  }
})

/** O texto cru do save que não abriu, para não perder tudo em silêncio. */
function baixarCru(): void {
  const problem = store.saveProblem
  if (problem?.kind !== 'corrupted') return
  baixar(problem.raw, 'save-corrompido.json')
}

function baixar(conteudo: string, nome: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    v-if="texto"
    class="border-b border-rust bg-panel px-4 py-2.5"
    role="alert"
    :style="{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }"
  >
    <p class="text-[11px] leading-snug text-rust">{{ texto }}</p>
    <div class="mt-2 flex gap-2">
      <button
        v-if="store.saveProblem?.kind === 'corrupted'"
        type="button"
        class="min-h-[44px] flex-1 border border-ink px-3 text-xs active:bg-rule"
        @click="baixarCru"
      >
        Baixar o arquivo
      </button>
      <button
        type="button"
        class="min-h-[44px] flex-1 border border-ink px-3 text-xs active:bg-rule"
        @click="store.dismissSaveProblem()"
      >
        Entendi
      </button>
    </div>
  </div>
</template>
