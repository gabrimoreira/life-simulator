// Lint. Chega depois do typecheck de propósito, e faz o que ele não faz.
//
// O `tsconfig` deste projeto já é mais duro que o `strict`
// (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
// `erasableSyntaxOnly`), então a maior parte do que um preset de ESLint
// costuma pegar aqui já não compila. O que sobra — e a razão de existir este
// arquivo — são as regras que dependem de TIPO, não de sintaxe: um `await` em
// coisa que não é promessa, um `catch` que engole o erro, uma condição que é
// sempre verdadeira porque o valor nunca é nulo.
//
// Regras desligadas abaixo têm motivo escrito. Nenhuma foi desligada por ser
// chata de arrumar.

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'scripts/**', '*.config.js'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // `essential`, e não `recommended`: o pacote recomendado do Vue é quase todo
  // formatação (quebra de linha por atributo, self-closing de void element),
  // e o projeto já tem o seu jeito de escrever template. Aqui interessa o que
  // quebra em runtime — `v-for` sem key, `v-if` com `v-for` no mesmo nó.
  ...pluginVue.configs['flat/essential'],

  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // Os .vue precisam do parser do Vue por fora e do de TS por dentro do
  // <script setup lang="ts">.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },

  {
    rules: {
      // O projeto escreve `void algumaCoisa()` de propósito em alguns lugares,
      // e a regra do TS já cobre o que importa.
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // A convenção daqui é `_` para o que se ignora de propósito.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // O conteúdo do jogo é declarativo e cheio de objeto literal grande; a
      // regra de nome de componente de uma palavra não se aplica a nada aqui.
      'vue/multi-word-component-names': 'off',
    },
  },

  // Testes medem o jogo rodando: asserções encadeadas e helpers locais que o
  // preset acha suspeitos são o normal aqui.
  {
    files: ['**/*.test.ts', 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
)
