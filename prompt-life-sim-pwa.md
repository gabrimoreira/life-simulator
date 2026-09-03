# Prompt para Claude Code — Life Simulator PWA

> **Ajuste antes de usar (decisões que eu fechei por você):**
> - Stack: Vue 3 + Vite + TypeScript + Pinia + Tailwind (alinhado ao que você já usa no Flow Pilot)
> - Turno = 1 ano de vida (modelo BitLife). Alternativa: 1 mês, dá mais granularidade mas exige 12x mais conteúdo
> - Persistência 100% local, sem backend, sem contas
> - Idioma do jogo: pt-BR, ambientação Brasil
> - MVP em 4 fases; a Fase 1 já é jogável
>
> Troque o que quiser e cole o resto como está.

---

## CONTEXTO

Você vai construir um jogo de simulação de vida (estilo BitLife / Life Simulator) que roda como PWA no navegador mobile e pode ser instalado como app. Sou desenvolvedor, então pode assumir vocabulário técnico e não precisa explicar conceitos básicos.

**Restrições de produto:**
- Interação **exclusivamente por toque**: botões, listas, modais. Nada de arrastar, teclado (exceto nome do personagem), gestos complexos ou canvas.
- **Sem personagem que se move.** Nenhum sprite, nenhum mapa, nenhuma física. O jogo é uma timeline de texto + abas de ação.
- Interface simples, complexidade nas **escolhas e na progressão**.
- Funciona offline por completo. Zero chamadas de rede em runtime.
- Alvo: telas de 360–430px de largura. Desktop é secundário (centralizar coluna de ~480px).

---

## STACK

- **Vue 3** (Composition API, `<script setup>`) + **TypeScript** estrito
- **Vite** + `vite-plugin-pwa` (manifest, service worker, precache, prompt de instalação)
- **Pinia** para estado
- **Tailwind CSS** para estilo
- **Vitest** para testes do motor de regras
- Persistência: `localStorage` para o MVP (save é um único JSON serializável). Isole atrás de uma interface `SaveAdapter` para migrar a IndexedDB depois sem refatorar nada.
- Sem backend, sem analytics, sem dependências pesadas de UI.

---

## ARQUITETURA — LEIA COM ATENÇÃO, É A PARTE MAIS IMPORTANTE

O erro fatal neste tipo de jogo é misturar regra de negócio com conteúdo. Você **não vai** escrever coisas como `if (idade === 18 && inteligencia > 70)` dentro de componentes ou stores.

### Separação obrigatória

```
src/
  engine/          # motor puro, sem Vue, testável isoladamente
    types.ts       # tipos de Personagem, Evento, Efeito, Condição
    rng.ts         # PRNG com seed (mulberry32) — nada de Math.random solto
    conditions.ts  # avaliador de condições declarativas
    effects.ts     # aplicador de efeitos declarativos
    events.ts      # seleção ponderada de eventos por turno
    turn.ts        # orquestra um turno completo
    careers.ts     # progressão de carreira
    relations.ts   # evolução de relacionamentos
    economy.ts     # renda, despesas, investimentos, dívidas
  content/         # DADOS puros, zero lógica
    events/        # eventos por categoria (infancia, escola, carreira, ...)
    careers.ts
    education.ts
    assets.ts
    names.ts
  stores/          # Pinia: adapta o engine ao Vue, gerencia save/load
  components/
  views/
```

**Regra:** `engine/` e `content/` não importam nada de Vue. `content/` não contém funções, só objetos.

### Modelo de conteúdo declarativo

Todo evento é um dado, nunca código:

```ts
interface GameEvent {
  id: string
  category: 'infancia' | 'escola' | 'carreira' | 'relacionamento' | 'saude' | 'aleatorio' | ...
  weight: number                 // peso base na seleção
  once?: boolean                 // dispara no máximo uma vez por vida
  conditions: Condition[]        // TODAS precisam passar
  text: string                   // suporta interpolação: "{nome}", "{conjuge}"
  options: EventOption[]         // 2 a 4 opções
}

interface EventOption {
  text: string
  requirements?: Condition[]     // se falhar, opção aparece desabilitada com motivo
  outcomes: Outcome[]            // resultados com chance ponderada
}

interface Outcome {
  chance: number                 // 0..1, somam 1 dentro de um option
  text: string                   // linha que entra na timeline
  effects: Effect[]
}

type Condition =
  | { type: 'age', min?: number, max?: number }
  | { type: 'stat', stat: StatKey, min?: number, max?: number }
  | { type: 'money', min?: number, max?: number }
  | { type: 'flag', flag: string, value: boolean }
  | { type: 'hasCareer', track?: CareerTrack }
  | { type: 'education', level: EducationLevel, atLeast: boolean }
  | { type: 'hasRelation', kind: RelationKind }
  | { type: 'not', condition: Condition }
  | { type: 'anyOf', conditions: Condition[] }

type Effect =
  | { type: 'stat', stat: StatKey, delta: number }
  | { type: 'stat', stat: StatKey, set: number }
  | { type: 'money', delta: number }
  | { type: 'flag', flag: string, value: boolean }
  | { type: 'relation', target: RelationRef, delta: number }
  | { type: 'addRelation', kind: RelationKind }
  | { type: 'removeRelation', target: RelationRef }
  | { type: 'career', action: 'hire' | 'fire' | 'promote' | 'quit', careerId?: string }
  | { type: 'asset', action: 'add' | 'remove', assetId: string }
  | { type: 'death', cause: string }
```

Adicionar 200 eventos novos depois deve ser **só criar objetos em `content/events/`**, sem tocar em uma linha de `engine/`.

### Determinismo

Todo o RNG passa por uma instância seedada guardada no save. Isso permite reproduzir bugs e testar o motor. Nenhum `Math.random()` fora de `rng.ts`.

---

## DESIGN DO JOGO

### Atributos do personagem (0–100)
- **Saúde** — cai com idade, doença, vícios; sobe com hábitos e dinheiro
- **Inteligência** — gate para educação e carreiras técnicas
- **Aparência** — afeta relacionamentos e carreiras públicas
- **Carisma** — afeta negociação, política, celebridade
- **Felicidade** — se zerar por vários turnos, gera eventos de crise
- **Reputação** — pública, afeta carreira de celebridade/política; suja com escândalo
- **Sorte** — oculta do jogador, enviesa outcomes sutilmente

### Recursos
- Dinheiro (líquido), Patrimônio (ativos), Dívidas
- **Pontos de ação por turno** (3 no padrão): cada ação da aba "Ações" consome 1. Isso é o que cria escolha real — o jogador nunca faz tudo.

### Linha do tempo
- Nasce com origem gerada: cidade, classe social (afeta dinheiro inicial e stats), família
- Turno = 1 ano. Botão grande **"Avançar ano"** dispara: envelhecer → renda/despesas → progressão de carreira/educação → 1–3 eventos → checagem de morte
- Morte por idade + saúde, acidente, doença. Tela de fim com resumo da vida e **opção de jogar como um filho** (herda parte do patrimônio e stats) — esse é o gancho de rejogabilidade

### Educação
Fundamental → Médio → Graduação (com cursos que dão flags) → Pós/Mestrado. Requisitos de Inteligência e dinheiro. Bolsas e financiamento estudantil como escolha com consequência de dívida.

### Trilhas de carreira (as "profissões")
Cada trilha tem níveis, requisitos de entrada, salário, e eventos próprios:
1. **CLT** — corporativo, tech, saúde, jurídico, serviços. Promoção depende de desempenho + tempo + carisma
2. **Empresário** — abre empresa, escolhe setor, injeta capital, contrata, arrisca falência. Renda variável e volátil
3. **Celebridade** — músico, ator, streamer, atleta. Fama como stat próprio, escândalos, contratos publicitários
4. **Crime** — alto retorno, risco de prisão. Prisão é um sub-loop de turnos
5. **Política** — exige reputação e rede de contatos, escala por cargos
6. **Acadêmica** — baixa renda, alta estabilidade, requisitos de inteligência

Trocar de trilha é permitido e custa progresso — isso é uma decisão interessante, não uma punição arbitrária.

### Relacionamentos
Pais, irmãos, amigos, par romântico, cônjuge, filhos. Cada um tem: nome, idade, tipo, **nível de relação (0–100)**, flags. Ações: conversar, presentear, pedir dinheiro, brigar, terminar. Relações decaem sozinhas se ignoradas.

### Ativos
Imóveis, veículos, investimentos (renda fixa/variável com volatilidade simulada). Cada ativo tem custo de manutenção anual — dinheiro parado não é neutro.

---

## UI / UX

**Layout único:** header fino (nome, idade, dinheiro) → conteúdo → **tab bar inferior fixa** com 5 abas → botão flutuante "Avançar ano".

Abas:
1. **Vida** — timeline cronológica dos eventos, estilo feed. É a tela principal.
2. **Ações** — lista de ações disponíveis no turno, agrupadas (Saúde, Educação, Carreira, Social, Crime). Ações indisponíveis aparecem com o motivo ("Requer Ensino Médio").
3. **Relações** — lista de pessoas, com barra de relação e ações por pessoa.
4. **Bens** — dinheiro, ativos, dívidas, investimentos.
5. **Perfil** — stats com barras, educação, carreira atual, conquistas/flags.

Eventos aparecem em **modal bloqueante** com o texto e as opções como botões grandes. Resultado é anexado à timeline.

**Diretrizes visuais:**
- Alvos de toque ≥ 44px. Nada de elemento clicável pequeno.
- Tipografia legível, hierarquia clara, sem decoração desnecessária.
- Escolha uma direção estética específica e comprometa-se com ela (paleta, cantos, densidade). Não entregue o visual padrão de template Tailwind com azul-500 e sombras genéricas.
- Suporte a dark mode via `prefers-color-scheme`.
- Transições curtas (≤150ms) só onde ajudam a entender o que mudou. Nada de animação decorativa.
- `overscroll-behavior: none`, safe areas do iOS respeitadas.

---

## ESCOPO — TRABALHE EM FASES

Não construa tudo de uma vez. Ao fim de cada fase, pare e me mostre o que está jogável.

**Fase 1 — Núcleo jogável**
Scaffold do projeto, PWA configurado, tipos do engine, RNG seedado, avaliador de condições/efeitos, loop de turno, geração de personagem, timeline, tab bar, save/load, tela de morte. Conteúdo mínimo: ~25 eventos cobrindo dos 0 aos 25 anos. **Ao final, deve ser possível nascer, viver e morrer.**

**Fase 2 — Educação e carreira**
Sistema de educação completo, 3 trilhas de carreira (CLT, Empresário, Celebridade) com 4–5 níveis cada, aba Ações com pontos de ação, economia (renda, despesas, dívidas).

**Fase 3 — Social e patrimônio**
Relacionamentos completos, aba Relações, ativos e investimentos, herdeiro na morte.

**Fase 4 — Profundidade**
Trilhas Crime/Política/Acadêmica, conquistas, expansão para 150+ eventos, balanceamento.

---

## REGRAS DE TRABALHO

- **TypeScript estrito.** Sem `any`. Union types discriminadas para Effect/Condition, com exaustividade checada por `never`.
- **Teste o motor.** Vitest cobrindo: avaliação de condições, aplicação de efeitos, seleção ponderada de eventos, turno completo com seed fixa. Não teste componentes Vue.
- **Sem over-engineering.** Nada de sistema de plugins, event bus genérico ou camada de abstração que não tem dois usuários hoje.
- **Save versionado** desde o início: campo `saveVersion` e função de migração, mesmo que a v1 seja identidade.
- Commits pequenos e descritivos por subsistema.
- Se uma decisão de design for ambígua ou tiver trade-off relevante, **pare e me pergunte** em vez de escolher silenciosamente.
- Ao terminar cada fase, me diga o que ficou incompleto ou frágil. Não me diga que está tudo pronto se não estiver.

---

## CRITÉRIOS DE ACEITE DA FASE 1

- [ ] `npm run dev` sobe e o jogo é jogável do nascimento à morte
- [ ] Instalável como PWA no Android, funciona em modo avião
- [ ] Save persiste entre reloads e recupera o estado exato
- [ ] Mesma seed produz a mesma sequência de eventos
- [ ] Zero erros de TypeScript, testes do engine passando
- [ ] Adicionar um evento novo exige editar apenas um arquivo em `content/events/`

---

**Comece confirmando seu plano da Fase 1 antes de escrever código.**
