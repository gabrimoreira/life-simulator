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
        {
          chance: 0.6,
          bias: { charisma: 0.4 },   // opcional: quem tem conversa se dá melhor
          text: 'Deu certo.',
          effects: [{ type: 'money', delta: 5000 }],
        },
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

### Atributos que pesam

`chance` é a probabilidade base; `bias` desloca ela pelo atributo de quem está
jogando. 50 é neutro em qualquer atributo, 100 com peso 1 dobra a chance, 0 a
zera, e pesos de atributos diferentes somam:

```ts
bias: { looks: 0.4, charisma: 0.25 }   // um flerte
bias: { charisma: 0.45, reputation: 0.2 }  // pedir aumento
bias: { fame: -0.4 }                   // sumir sem ninguém perceber
```

Até a Fase 8 só existia `luckBias`, e por isso duas promessas do spec —
"Carisma afeta negociação" e "Aparência afeta relacionamentos" — eram
impossíveis de escrever: não faltava conteúdo, faltava o tipo permitir dizer
aquilo. `luck` continua sendo um atributo entre os outros, e é o único
invisível na tela.

O validador rejeita três formas de mentir com isso: peso 0, peso acima de 2
(onde o atributo deixa de enviesar e passa a decidir — com 2, quem tem o
atributo abaixo de 25 nunca vê o outcome) e viés em opção de outcome único,
que `pickOutcome` devolve sem olhar a chance.

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

Dezesseis trilhas em seis tipos. O `kind` é o que a economia e as conquistas
enxergam; o `trackId` é o que o conteúdo enxerga, e é por isso que existem
duas condições separadas (`careerKind` e `careerTrack`).

| tipo | trilhas |
|------|---------|
| `clt` | Corporativo, Desenvolvimento, Medicina, Advocacia, Engenharia, Serviços |
| `business` | Comércio, Alimentação, Tecnologia |
| `celebrity` | Internet, Música, Atuação, Esporte |
| `crime` | Crime |
| `politics` | Política |
| `academia` | Acadêmica |

As de `business` e `celebrity` existem porque o spec descreve as duas em prosa
— "abre empresa, **escolhe setor**, injeta capital, contrata" e "**músico, ator,
streamer, atleta**" — e por cinco fases as duas eram uma escada de salário só.
Escolher o setor é escolher a trilha; injetar capital e contratar são ações,
porque são coisas que se faz durante o ano trocando dinheiro por desempenho.

Esporte é a única trilha do jogo com teto de idade na entrada: corpo tem prazo.

Os cinco setores de `clt` são os que o spec lista — "corporativo, tech, saúde,
jurídico, serviços" — e os dois das pontas existem pelo que a porta de entrada
deles diz:

- **Desenvolvimento** não pede diploma e não faz checagem de antecedentes. É a
  única porta de emprego formal aberta para quem tem ficha suja; sem ela, sair
  da cadeia era voltar para a informalidade até morrer, com a trilha de crime
  como única saída. O diploma só cobra a partir de sênior — no mesmo degrau em
  que o corporativo cobra. Quando cobrava um degrau acima, a trilha dominava o
  jogo: sem faculdade nenhuma, terminava com o dobro do patrimônio do
  corporativo.
- **Serviços** não pede nada: nem médio, nem inteligência, nem dinheiro. É a
  escada de quem não teve escolha nenhuma, e o teto baixo diz por quê. Sem ela
  o personagem pobre e sem estudo não tinha carreira alguma — só R$9.000 por
  ano de renda informal, a vida inteira.

Toda trilha que divide o `kind` com outra tem pelo menos um evento que a
nomeia, e um teste trava isso: setor sem evento próprio não é setor, é o mesmo
jogo com outro nome na tela do Perfil.


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

Desenvolvimento é a exceção deliberada: entra sem diploma nenhum. O diploma —
qualquer graduação, ou o curso de Engenharia — só é cobrado a partir de
sênior.

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

## Vícios

O spec sempre listou três coisas que derrubam a saúde — "idade, doença,
**vícios**" — e por sete fases só as duas primeiras existiam.

Um vício não é um evento ruim que já passou: é uma escolha antiga que continua
cobrando todo ano, em teto de saúde (`aging.ts`) e em dinheiro (`economy.ts`,
com linha própria no resumo do ano), até alguém gastar um ponto de ação para
largar. Os dois números moram numa lista só em `balance.ts`, então um vício
novo é uma linha:

| vício | teto de saúde | por ano |
|-------|--------------:|--------:|
| Fumante | −9 | R$3.000 |
| Bebe demais | −7 | R$4.500 |

A escala é deliberada: cada vício pesa menos que uma condição crônica (−12) e
mais que o bônus de treinar (+6). Largar é a única ação do jogo que desfaz uma
flag antiga, e o viés dela é em **felicidade** de propósito — quem está mal
recai, e é quem está mal que costuma ter o vício.

Três medidas mudaram o desenho pelo caminho:

- **81% dos personagens terminavam alcoolistas**, porque os dois eventos de
  aquisição tinham cooldown e uma vida longa sorteava a mesma noite quatro
  vezes. Os dois viraram `once`, e o de beber para aguentar subiu de dois para
  quatro anos seguidos de infelicidade. Hoje são 59% no jogador que sempre
  escolhe a pior opção e 21% no que não se sabota.
- **A sexta-feira no bar dava +4 de desempenho junto com o vício**: o vício era
  o caminho barato para a promoção. Não dá mais nada.
- **O custo anual começou em R$5.000 e R$8.000 e caiu.** A renda informal de
  quem é pobre é R$9.000 por ano, e beber não pode ser sentença de pobreza.

## Amizade acaba

Amigo esfria mais rápido que família e **sai da lista** quando a relação chega
a zero. Parente distante continua parente; ninguém deixa de ser irmão por não
se falar. Amigo, sim.

Sem isso uma vida acumulava **vinte e cinco amigos aos 60**, onze deles ainda
acima de 40 de relação: dezesseis lugares do conteúdo criam amigos, nada os
removia, e o decaimento de 2 ao ano levava mais de vinte anos para zerar um.

O número não era o problema — o efeito colateral era. Com vinte amigos,
"rede de contatos" não mede nada, e foi por isso que a primeira tentativa de
fazer a política cobrar rede não prendeu nada. Hoje são ~10 amigos vivos, com
p50 de 1 acima de 60 e p90 de 3, e cultivar amizade quase dobra a chance de
chegar ao senado (22 para 35 em 100 vidas).

Perder um amigo por abandono aparece na timeline. É consequência de onde você
gastou os pontos de ação, que é a decisão que os pontos existem para forçar —
sumir em silêncio esconderia justamente isso.

## Casamento

Por cinco fases casar mudava uma flag e nada mais. A decisão mais consequente
de uma vida não aparecia em lugar nenhum na economia.

O cônjuge contribui uma fração da renda, escalada pela relação — casamento ruim
rende menos, e não por moralismo: gente que não se fala não divide conta
direito. A casa custa um pouco mais em troca. O resultado é a tensão que o
sistema existe para criar: **casamento bom melhora o ano em todas as cinco
classes sociais, casamento ruim piora**. Cuidar da relação virou decisão
econômica, não só sentimental.

Duas armadilhas apareceram montando isso, e as duas estão medidas em teste:

O fator de custo multiplicava o **piso** do custo de vida. Duas pessoas
dividindo teto não pagam 35% mais aluguel, e o resultado era casar piorar o
saldo nas cinco classes.

O custo de vida é calculado sobre a renda **própria**, não a da casa. O teto de
padrão de vida herdado sobe junto com a renda, então somar o cônjuge à base do
cálculo fazia a contribuição inteira virar despesa e casar não mudar nada.

Divórcio é regra, não conteúdo: dividir bens envolve vender o que não se
divide, e isso não cabe num efeito `money`. Vende tudo com deságio, parte o
caixa ao meio, e cobra 12 pontos a mais de quem tem filho. O ex-cônjuge vira
amigo em vez de sumir — gente com quem se viveu vinte anos não desaparece do
mundo, e a relação guarda o estrago.

## Crise de felicidade

O spec pede eventos de crise "se a felicidade zerar por vários turnos", e por
cinco fases existiram apenas dois gates instantâneos de felicidade baixa em 193
eventos. A diferença importa: um gate instantâneo dispara no primeiro ano ruim
de uma vida boa, e o que o spec descreve é a espiral.

`Character.unhappyYears` conta anos SEGUIDOS abaixo do limiar e zera no
primeiro ano bom. É a única memória de duração do jogo — todas as outras
condições olham o estado do turno, e por isso não distinguem um ano ruim de
uma década ruim.

Cuidado com o limiar: o nominal é 30, o **efetivo é 27**. A reversão à média
roda antes da contagem e o stat é arredondado, então `round(0,92x + 4) < 30`
exige `x <= 27`. Está medido em `aging.test.ts`.

Medido em 200 vidas sem plano nenhum: 88 veem ao menos um evento de crise, a
maior sequência é de 13 anos, o pico médio é 3,1, e os cinco eventos disparam
— inclusive o que exige seis anos seguidos.

## Save

`saveVersion` 6. As migrações rodam sobre o JSON cru e a checagem de forma
acontece depois, sobre o resultado — o contrário obrigaria a manter o tipo de
cada versão antiga do `GameState` vivo no código para sempre.

O adapter **diz por que falhou**, e essa é a diferença que importa:

| situação | antes | agora |
|---|---|---|
| nunca houve save | `null` | `save: null, problem: null` |
| save corrompido | `null` | `problem: corrupted` **com o texto cru** |
| armazenamento bloqueado | `null` | `problem: unreadable` |
| gravação falhou | silêncio | `problem: unwritable` |

As três falhas eram engolidas e devolviam a mesma coisa: o jogador perdia uma
vida de setenta anos, caía na tela de novo jogo e nunca sabia por quê. O texto
cru acompanha o save corrompido porque perder a vida sem nem a chance de
guardar o arquivo é pior que o bug que a corrompeu.

Importar passa pela MESMA migração e checagem de forma: arquivo de terceiro
não é mais confiável que localStorage corrompido, e um arquivo recusado não
destrói a vida em curso.

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

### Dois jogadores, não um

`src/test/player.ts` tem duas políticas de escolha, e a distância entre elas é
a informação:

- **`first`** sempre pega a primeira opção disponível. Nos eventos destrutivos
  essa é justamente a pior, então ele é um **piso**: o que ele alcança, todo
  mundo alcança.
- **`sensible`** pontua cada opção pelo efeito esperado e pega a melhor. Não é
  esperto — não planeja, não guarda dinheiro, não vê sinergia entre curso e
  trilha. Só não se sabota.

Por cinco fases só existiu o primeiro, e por isso cada número vinha com a
ressalva de que o jogador escolhia sempre a pior opção. Um piso sozinho não
diz se o jogo é difícil ou se o jogador é ruim.

Medido em 100 vidas por combinação, depois dos vícios da Fase 8:

| plano    | política | p50 patrimônio | negativos | herdeiro | morte p50 |
|----------|----------|---------------:|----------:|---------:|----------:|
| carreira | first    | 1,57M |  8 |  8 | 71 |
| carreira | sensible | 2,07M |  2 | 14 | 72 |
| medicina | first    | 5,10M | 12 |  6 | 69 |
| medicina | sensible | 7,67M |  5 |  6 | 71 |
| família  | first    | 1,76M | 13 | 49 | 69 |
| família  | sensible | 2,70M |  0 | 54 | 72 |

Duas leituras que só aparecem com os dois lados:

**Morrer no vermelho é quase inteiramente escolha**, não economia dura — 13 em
100 caem para 0. É a forma certa: um jogo que empobrece quem joga bem estaria
punindo por existir.

**A idade de morte muda pouco, e o pouco é o vício.** Antes da Fase 8 a
resposta era "nada": 69,3 contra 71,0 anos de média, tudo saindo da curva de
Gompertz e do teto de saúde da idade. Os vícios são a primeira escolha do jogo
que compra anos de vida — 67,2 contra 71,7 — e continua sendo pouco de
propósito. Um teste guarda o teto: se a diferença passar de seis anos, alguma
escolha virou um botão de viver mais, e isso precisa ser deliberado em vez de
acontecer.

O mesmo teste ensinou uma lição sobre medir: ele comparava MEDIANAS de 60
vidas, e a mediana da idade de morte anda em degraus de anos inteiros — a
mesma afirmação media 5 numa leva e 7 na seguinte, sem nada ter mudado no
jogo. O de patrimônio tinha o problema irmão: "1,25x" mede 1,77 com 40 vidas,
1,14 com 60, 1,13 com 80 e 1,32 com 150, porque a cauda é pesada. Hoje um mede
média em 150 vidas e o outro afirma a direção mais uma estatística de ordem
(quantas vidas sensatas passam a vida MEDIANA de quem se sabota), que não
depende da cauda.

Foi assim que apareceram os problemas que a leitura do código não mostrava: o
efeito de promoção furando a tabela de requisitos, o crime sendo a trilha mais
rentável do jogo por não ter mecanismo de ruína nenhum, e o padrão de vida
herdado condenando quem nasce rico.

A forma importa mais que a mediana, e é por isso que a tabela por trilha
abaixo tem p50 e p90 lado a lado: academia tem p50 alto e p90 baixo (teto
baixo, chão firme); atuação tem o inverso. É o desenho, não um desequilíbrio.

### Quanto o jogo é capaz de gerar

Todas as dezesseis trilhas, 120 vidas cada, política `sensible`. As marcadas
com * têm o curso no plano, porque sem o diploma a porta nem abre:

| trilha           | p50 | p90 | negativos |
|------------------|----:|----:|----------:|
| Música           | 8,07M | 15,41M |  8 |
| Medicina *       | 7,71M | 14,39M |  7 |
| Esporte          | 7,61M | 26,29M |  0 |
| Internet         | 6,66M | 40,95M |  6 |
| Engenharia *     | 6,62M |  9,68M |  4 |
| Advocacia *      | 6,12M | 12,57M |  3 |
| Comércio         | 5,12M | 12,00M |  4 |
| Alimentação      | 4,94M |  8,82M |  4 |
| Tecnologia       | 4,45M | 12,87M |  5 |
| Acadêmica *      | 4,09M |  6,57M |  0 |
| Política         | 2,79M |  5,64M |  5 |
| Atuação          | 2,59M | 14,98M | 20 |
| Desenvolvimento  | 2,37M |  3,91M |  4 |
| Corporativo      | 2,08M |  3,14M |  2 |
| Serviços         | 1,99M |  3,09M |  9 |
| Crime            | 1,14M |  2,26M |  4 |

A forma importa mais que a mediana, e aqui ela aparece: engenharia e acadêmica
têm p50 alto com p90 baixo — teto baixo, chão firme; atuação tem a segunda
menor mediana e um p90 seis vezes maior, que é a trilha das cem audições;
internet tem o p90 mais alto do jogo e não é a maior mediana. Crime continua
sendo a pior aposta financeira, e é assim que tem que ser.

Serviços fica acima do corporativo por um motivo que faz sentido: entra aos 16
sem exigir nada e emprega quase todo mundo, enquanto o corporativo trava no
nível 2 para quem não se forma. Com faculdade, o corporativo passa.

**Não existe teto duro.** O p90 da internet mede R$40,9M sozinho. O que existe
é a faixa em que quase todas as trilhas caem, entre R$3M e R$15M de p90, e é
contra ela que os bens de luxo são precificados — um item comprável só na
cauda é o mesmo que um item que ninguém compra.

Foi assim que o jatinho de R$18 milhões e o time de futebol de R$40 milhões
exigindo R$60 milhões de patrimônio apareceram: eram vitrine, e com o time
morriam os dois eventos que exigem possuí-lo.

A mesma conta vale para idade: com plano voltado a saúde, em 300 vidas a idade
máxima foi 94 e ninguém passou de 95. A conquista dos cem anos era decoração e
virou noventa, que acontece em 7% dessas vidas. `MAX_AGE = 110` segue
inalcançável de propósito — é o teto duro do laço, não uma meta.

Três testes em `education-matters.test.ts` impedem que um bem ou uma conquista
volte a pedir mais do que o jogo é capaz de produzir.
