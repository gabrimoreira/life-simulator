<script setup lang="ts">
// Guardar, trazer de volta, e desistir.
//
// Até aqui um personagem VIVO não podia ser abandonado por nenhum caminho de
// UI: `discard()` só era alcançável pelo botão da tela de morte, e quem
// quisesse recomeçar tinha que limpar o localStorage na mão. E não havia
// backup nenhum de um save que mora num único registro do navegador.
import { ref } from 'vue'
import { useGameStore } from '../../stores/game'

const store = useGameStore()

const confirmando = ref(false)
// Carregar um arquivo APAGA a vida que está rodando, e era o único caminho
// destrutivo da tela que não perguntava nada — "Abandonar", logo abaixo,
// sempre perguntou.
const confirmandoImport = ref(false)
const importErro = ref<string | null>(null)
const importOk = ref(false)
const arquivo = ref<HTMLInputElement | null>(null)

function exportar(): void {
  const texto = store.exportSave()
  if (texto === null) return

  const nome = store.character?.name.split(' ')[0]?.toLowerCase() ?? 'vida'
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `vida-${nome}-${store.character?.age ?? 0}anos.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function importar(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importErro.value = null
  importOk.value = false

  const texto = await file.text()
  const ok = await store.importSave(texto)
  if (ok) {
    importOk.value = true
  } else {
    importErro.value = 'Não deu para ler esse arquivo como um save deste jogo.'
  }
  // Permite escolher o mesmo arquivo de novo depois de um erro.
  input.value = ''
}
</script>

<template>
  <section class="mt-6">
    <h2 class="border-b border-rule pb-1 font-serif text-sm tracking-wide uppercase">Save</h2>

    <p class="mt-2 text-[11px] leading-relaxed text-muted">
      A vida mora num único registro deste navegador. Limpar os dados do site
      apaga tudo — guardar uma cópia é a única forma de não depender disso.
    </p>

    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="min-h-[48px] flex-1 border border-ink px-3 text-xs active:bg-panel"
        @click="exportar"
      >
        Baixar cópia
      </button>
      <button
        type="button"
        class="min-h-[48px] flex-1 border border-ink px-3 text-xs active:bg-panel"
        @click="store.hasGame ? (confirmandoImport = true) : arquivo?.click()"
      >
        Carregar arquivo
      </button>
      <input
        ref="arquivo"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="importar"
      />
    </div>

    <div v-if="confirmandoImport" class="mt-3 border-l-2 border-rust pl-3">
      <p class="text-[11px] leading-snug text-rust">
        Carregar um arquivo substitui a vida que está rodando agora. Ela não volta.
      </p>
      <div class="mt-2 flex gap-2">
        <button
          type="button"
          class="min-h-[44px] flex-1 border border-ink px-3 text-xs active:bg-panel"
          @click="confirmandoImport = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="min-h-[44px] flex-1 bg-rust px-3 text-xs text-paper active:opacity-80"
          @click="confirmandoImport = false; arquivo?.click()"
        >
          Substituir
        </button>
      </div>
    </div>

    <p v-if="importErro" class="mt-2 text-[11px] leading-snug text-rust" role="alert">
      {{ importErro }}
    </p>
    <p v-else-if="importOk" class="mt-2 text-[11px] leading-snug text-ochre" role="status">
      Save carregado.
    </p>

    <div v-if="confirmando" class="mt-4 border-l-2 border-rust pl-3">
      <p class="text-[11px] leading-snug text-rust">
        Abandonar apaga esta vida para sempre. Se quiser guardá-la, baixe a
        cópia antes. Tem certeza?
      </p>
      <div class="mt-2 flex gap-2">
        <button
          type="button"
          class="min-h-[44px] flex-1 border border-ink px-3 text-xs active:bg-panel"
          @click="confirmando = false"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="min-h-[44px] flex-1 bg-rust px-3 text-xs text-paper active:opacity-80"
          @click="store.discard()"
        >
          Abandonar
        </button>
      </div>
    </div>
    <button
      v-else
      type="button"
      class="mt-3 min-h-[48px] w-full border border-rust px-3 text-xs text-rust active:bg-panel"
      @click="confirmando = true"
    >
      Abandonar esta vida
    </button>
  </section>
</template>
