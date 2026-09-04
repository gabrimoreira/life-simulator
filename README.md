# Vida — Simulador

Simulador de vida em PWA. Um turno = um ano. Nasce, escolhe, morre.

## Rodar

```bash
npm install
npm run dev        # desenvolvimento
npm run test       # testes do engine
npm run typecheck  # TypeScript estrito, zero any
npm run build      # build de produção + service worker
npm run preview    # serve o build (necessário para testar o PWA)
```

## Arquitetura

A fronteira que importa: **`engine/` é regra, `content/` é dado.** Nenhum dos
dois importa Vue, e adicionar 200 eventos novos não deve tocar uma linha de
`engine/`.

```
src/
  engine/       motor puro e testável — tipos, rng seedado, condições,
                efeitos, eventos, ações, carreira, educação, economia, turno
  content/      dados puros: eventos, ações, trilhas, cursos, nomes, cidades
  save/         SaveAdapter (localStorage hoje, IndexedDB depois) + migrações
  stores/       Pinia: adapta o engine ao Vue e persiste
  components/   UI
  views/        telas
```

O engine nunca importa `content/` diretamente: recebe um `ContentPack`
(`engine/content-pack.ts`). É isso que permite testar o motor com pools falsos
de dois eventos.

### Adicionar um evento

Edite **um** arquivo em `src/content/events/` e acabou:

```ts
{
  id: 'adult_novo_evento',
  category: 'career',
  weight: 10,
  cooldown: 5,                      // anos mínimos entre dois disparos
  conditions: [{ type: 'age', min: 30, max: 55 }],
  text: 'Algo aconteceu com você.',
  options: [
    {
      text: 'Reagir',
      requirements: [{ type: 'money', min: 1000 }],   // opcional
      outcomes: [
        { chance: 0.6, text: 'Deu certo.', effects: [{ type: 'money', delta: 5000 }] },
        { chance: 0.4, text: 'Não deu.', effects: [] },
      ],
    },
    { text: 'Ignorar', outcomes: [{ chance: 1, text: 'Passou.', effects: [] }] },
  ],
}
```

`npm run test` roda `validateEvents` sobre todo o conteúdo e quebra se as
chances não somarem 1, se um id repetir, se um token de interpolação não
existir ou se todas as opções tiverem requisitos (o que travaria o jogador
num modal bloqueante).

### Concordância de gênero

Texto declarativo não pode ramificar por gênero, então o sufixo é um token:
`"Você foi promovid{o}"` vira "promovida" ou "promovido". Também existem
`{ele}`, `{Ele}`, `{dele}`, `{um}`, além de `{name}`, `{city}`, `{uf}`,
`{age}`, `{money}`, `{mother}` e `{father}`.

### Determinismo

Todo o RNG passa por uma instância seedada cujo estado vive no save
(`rngState`). `Math.random()` aparece uma única vez no projeto: sorteando a
seed de uma vida nova. Mesma seed + mesmo `choiceLog` reproduz a vida inteira,
inclusive atravessando um save/load no meio.

### Balanceamento

Todo número mágico mora em `src/engine/balance.ts`.

## Ações e pontos de ação

Cada turno dá 3 pontos de ação. Uma ação é a mesma coisa que um evento —
condições, requisitos, outcomes ponderados, efeitos — só muda quem puxa o
gatilho, então ela reusa `Outcome` e `Effect` sem maquinário novo.

Ações de conteúdo ficam em `src/content/actions.ts`. Já **matricular-se num
curso**, **cursar mais um ano** e **entrar numa carreira** não são conteúdo: são
derivadas dos catálogos por `engine/actions.ts`, sob os prefixos `enroll:`,
`career:` e os ids `study`/`drop_out`. "Você pode se matricular no que tem
requisito" não é um dado que alguém escreve — é consequência de existirem
cursos. Por isso o validador rejeita ação de conteúdo com `:` no id.

## Carreira

Uma trilha (`src/content/careers.ts`) é uma lista de níveis com salário,
requisitos e tempo mínimo. Três coisas movem a progressão:

- **Desempenho** regride sozinho para uma baseline vinda de inteligência e
  carisma. Subir acima dela custa um ponto de ação por ano.
- **Nível de entrada** é o mais alto cujos requisitos você já cumpre. Níveis que
  exigem `performance` são inalcançáveis na entrada, o que limita o teto sem
  precisar de regra extra.
- **`careerHistory`** guarda o topo já alcançado em cada trilha e sobrevive à
  demissão: quem já foi diretor volta dois degraus abaixo, não como estagiário.

Renda com `volatility > 0` (empresário, celebridade) varia para os dois lados e
pode virar falência.

## Educação

Fundamental e Médio são automáticos. Graduação e pós são matrícula mais um ano
de estudo por vez, cada ano custando um ponto de ação — o custo de oportunidade
é a decisão. Pular um ano não reprova, só não forma. A mensalidade sai do caixa
sempre que houver caixa; o resto vira dívida.

Concluir um curso concede o nível de escolaridade e a flag `course_<id>`.

Por três fases essa flag foi escrita e lida por ninguém: nada perguntava QUAL
curso você tinha feito, e Medicina — seis anos, R$360.000, exigindo
inteligência 72 — abria exatamente as mesmas portas que Licenciatura, quatro
anos e R$32.000. Hoje cada graduação abre alguma coisa:

| curso         | abre |
|---------------|------|
| Medicina      | trilha Medicina, a mais bem paga do jogo, que cobra saúde todo ano |
| Direito       | trilha Advocacia, que escala com carisma |
| Engenharia    | trilha Engenharia, estável e sem escândalo |
| Artes Cênicas | atalho na celebridade: sobe de degrau sem a fama exigida |
| Administração | troca carisma por diploma na subida do empresário |
| Licenciatura  | entrada na academia sem pós; os níveis seguintes ainda exigem |

Medicina, Advocacia e Engenharia são todas `kind: 'clt'` — são emprego formal,
com demissão e checagem de antecedentes. O que as separa do corporativo
genérico é a porta. É também por isso que a condição `careerTrack` existe
separada de `careerKind`: com quatro trilhas do mesmo tipo, "plantão de vinte
e quatro horas" não pode aparecer para um analista de escritório.

O nível de escolaridade SOBE e nunca desce. Concluir uma segunda graduação
rebaixava para `bachelor` quem já tinha mestrado — e com isso o expulsava da
trilha acadêmica, sem nenhum aviso.

## Economia

`baseIncome` é a renda de quem não tem carreira nenhuma, e é deliberadamente
pior que qualquer primeiro degrau — ficar sem trabalho tem que doer devagar.

O custo de vida é o maior entre o piso da classe social e uma fatia da renda:
sem isso, salário alto vira saldo infinito sem nenhuma decisão no meio.
Estudante paga uma fração disso.

A dívida tem teto. Passado o teto o gasto simplesmente não acontece — a pessoa
corta o próprio padrão de vida até caber, porque ninguém empresta para sempre.

## Save

`saveVersion` 5. As migrações rodam sobre o JSON cru e a checagem de forma
acontece depois, sobre o resultado — o contrário obrigaria a manter o tipo de
cada versão antiga do `GameState` vivo no código para sempre.

## Prisão

Não há máquina de estados para a cadeia. Toda ação e todo evento já passam por
`conditions`, então a regra é uma só: **preso, só aparece o que declara
`inPrison`; solto, só aparece o que não declara.** A vida lá fora some do
sorteio — matrícula, emprego, compra de bens, tudo.

Quem está preso não tem renda nem custo de vida: é sustentado pelo Estado. A
cadeia cobra em tempo, saúde e gente que se afasta, não em dinheiro.

## Conquistas

Uma conquista é um punhado de condições declarativas avaliadas no fim de cada
turno pelo mesmo `evaluateAll` dos eventos. Não há gatilho nem contador
escondido. A checagem roda **depois** da morte, de propósito: "chegou aos cem"
e "morreu no vermelho" só fazem sentido no turno em que a vida acaba.

## Os invariantes são testados, não conferidos na mão

Zero `any`, `Math.random` só em `rng.ts`, `engine/` sem importar `content/`,
nem um nem outro importando Vue. Isso era `grep` manual a cada fase, por quem
lembrasse de rodar — `src/architecture.test.ts` transforma em teste.

E cuidado com o `typecheck`: por três fases o script era `vue-tsc --noEmit`,
que lê o `tsconfig.json` raiz. Esse arquivo é de solução (`"files": []` mais
duas `references`), então o comando checava ZERO arquivos e saía limpo. Quem
segurava tudo era o `build`. Agora é `vue-tsc -b --force`, e é ele que faz o
`assertNever` funcionar como lista de tarefas quando uma união cresce.

## Flags não podem ser decorativas

`orphanFlags` em `engine/validate.ts` quebra o teste se o conteúdo escrever uma
flag que ninguém lê. Onze das dezesseis eram write-only quando isso foi medido
pela primeira vez: o Perfil exibia "Ficha suja" e o jogo se comportava
exatamente igual.

Flags lidas pelo próprio engine (e não por uma `Condition`) ficam declaradas em
`engine/flags.ts` — é como o detector sabe que elas têm leitor.

## Como o balanceamento é medido

Não por intuição: por simulação. Perfis de jogador scriptados — aleatório,
família, carreira, otimizado, crime, academia, pobre — cem vidas cada, olhando
mediana, p90, mortes no vermelho e herdeiros.

Foi assim que apareceram os problemas que a leitura do código não mostrava: o
efeito de promoção furando a tabela de requisitos, o crime sendo a trilha mais
rentável do jogo por não ter mecanismo de ruína nenhum, e o padrão de vida
herdado condenando quem nasce rico.

A forma importa mais que a mediana. Academia tem p50 alto e p90 baixo (teto
baixo, piso alto); corporativo tem o inverso. É o desenho, não um desequilíbrio.

Última medida, 100 vidas por perfil:

| perfil    | p50 patrimônio | p90 | negativos | herdeiro | morte p50 |
|-----------|---------------:|----:|----------:|---------:|----------:|
| aleatório | 701k  | 3,24M | 14 |  4 | 70 |
| família   | 1,78M | 2,83M |  9 | 52 | 73 |
| carreira  | 1,89M | 5,75M | 12 | 14 | 69 |
| otimizado | 4,78M | 9,09M | 17 | 33 | 73 |
| crime     | 1,22M | 2,98M |  3 |  2 | 66 |
| academia  | 2,16M | 4,47M | 15 |  7 | 72 |
| pobre     | 918k  | 4,20M | 12 |  9 | 75 |

O perfil otimizado é o que faz Medicina e entra na trilha da profissão. Ele
paga 2,5 vezes o corporativo genérico — e tem o maior número de mortes no
vermelho, porque seis anos e R$360.000 de faculdade cobram antes de pagar.

### O teto do jogo é R$12,8 milhões

Medido em 300 vidas do perfil mais rentável que existe. R$10 milhões acontece
em 3% delas; ninguém chegou a R$20 milhões.

Isso condenava dois bens de luxo: o jatinho custava R$18 milhões e o time de
futebol R$40 milhões exigindo R$60 milhões de patrimônio. Eram itens de
vitrine, e com o time morriam os dois eventos que exigem possuí-lo. Hoje o
clube é ofertado em 63 de 300 vidas e o jatinho em 36.

A mesma conta vale para idade: com plano voltado a saúde, em 300 vidas a idade
máxima foi 94 e ninguém passou de 95. A conquista dos cem anos era decoração e
virou noventa, que acontece em 7% dessas vidas. `MAX_AGE = 110` segue
inalcançável de propósito — é o teto duro do laço, não uma meta.

Três testes em `education-matters.test.ts` impedem que um bem ou uma conquista
volte a pedir mais do que o jogo é capaz de produzir.
