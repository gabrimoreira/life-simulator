<script setup lang="ts">
import { ref } from 'vue'
import type { Gender } from '../engine/types'

const emit = defineEmits<{ start: [name: string, gender: Gender, seed?: number] }>()

const name = ref('')
const gender = ref<Gender>('female')
const seed = ref('')

function start(): void {
  // A vida inteira sai de uma seed. Informar a mesma repete tudo — os eventos,
  // os dados, a cidade, a família. É o que torna possível contar a mesma
  // história para outra pessoa.
  const parsed = Number.parseInt(seed.value.trim(), 10)
  emit('start', name.value.trim(), gender.value, Number.isFinite(parsed) ? parsed : undefined)
}
</script>

<template>
  <div
    class="flex h-full flex-col justify-between px-6 py-10"
    :style="{
      paddingTop: '2.5rem',
      paddingBottom: '2.5rem',
    }"
  >
    <div>
      <p class="font-serif text-xs tracking-[0.2em] text-muted uppercase">Simulador</p>
      <h1 class="mt-1 font-serif text-4xl leading-none">Vida</h1>
      <div class="mt-4 h-px bg-ink" />
      <p class="mt-4 text-sm leading-relaxed text-muted">
        Um ano por turno. Você não escolhe onde nasce, nem quase nada do que acontece — só o que
        faz com isso. Depois você morre.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="start">
      <div>
        <label for="nome" class="font-serif text-sm tracking-wide uppercase">Nome</label>
        <input
          id="nome"
          v-model="name"
          type="text"
          maxlength="28"
          autocomplete="off"
          placeholder="Como você se chama"
          class="mt-2 min-h-[48px] w-full border-b border-ink bg-transparent pb-1 font-serif text-xl outline-none placeholder:text-muted focus:border-ochre"
        />
      </div>

      <fieldset>
        <legend class="font-serif text-sm tracking-wide uppercase">Gênero</legend>
        <div class="mt-2 grid grid-cols-2 border border-ink">
          <button
            v-for="option in [
              { value: 'female' as Gender, label: 'Mulher' },
              { value: 'male' as Gender, label: 'Homem' },
            ]"
            :key="option.value"
            type="button"
            class="min-h-[48px] text-sm transition-colors duration-100"
            :class="
              gender === option.value
                ? 'bg-ink text-paper'
                : 'border-l border-ink first:border-l-0 active:bg-panel'
            "
            @click="gender = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="mt-2 text-xs text-muted">
          <!-- "Nada mais" era verdade até a Fase 9, quando gênero era condição
               de 1 evento em 214. Hoje são treze, e 96% das vidas com a mesma
               semente terminam diferentes conforme a resposta aqui. -->
          Muda a concordância dos textos e boa parte do que acontece com você.
        </p>
      </fieldset>

      <div>
        <label for="semente" class="font-serif text-sm tracking-wide uppercase">
          Semente <span class="text-muted normal-case">(opcional)</span>
        </label>
        <input
          id="semente"
          v-model="seed"
          type="text"
          inputmode="numeric"
          maxlength="12"
          autocomplete="off"
          placeholder="Em branco, sorteia"
          class="mt-2 min-h-[48px] w-full border-b border-rule bg-transparent pb-1 font-serif text-base outline-none placeholder:text-muted focus:border-ochre"
        />
        <p class="mt-2 text-xs text-muted">
          A mesma semente dá exatamente a mesma vida. A do fim de cada partida fica na tela de
          morte.
        </p>
      </div>

      <button
        type="submit"
        class="min-h-[56px] w-full bg-ochre font-serif text-lg tracking-wide text-paper uppercase active:opacity-80"
      >
        Nascer
      </button>
    </form>
  </div>
</template>
