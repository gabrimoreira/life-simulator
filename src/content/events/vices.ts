// Vícios: o terceiro vetor da saúde.
//
// O spec sempre disse que a saúde "cai com idade, doença, vícios", e até a
// Fase 8 vício não existia em lugar nenhum — a saúde caía por idade e por
// condição crônica, e ponto. Um vício é diferente das duas: a idade não se
// escolhe, a doença chega sem aviso, e o vício é uma escolha antiga que
// continua cobrando todo ano até alguém gastar um ponto de ação para largar.
//
// Por isso os eventos daqui vêm em três tempos: o que dá o vício (e sempre
// oferece algo em troca — alívio, aceitação, uma noite melhor), o que ele
// cobra enquanto dura, e a chance de largar. Nenhum deles é um castigo
// gratuito: quem aceita o primeiro cigarro ganha alguma coisa naquele ano.

import type { GameEvent } from '../../engine/types'

export const VICE_EVENTS: GameEvent[] = [
  // --- Como começa ---------------------------------------------------------
  {
    id: 'vice_first_cigarette',
    category: 'health',
    weight: 12,
    once: true,
    conditions: [
      { type: 'age', min: 14, max: 22 },
      { type: 'flag', flag: 'smoker', value: false },
    ],
    text: 'Na saída do rolê alguém estende o maço para você, sem perguntar nada.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.45,
            text: 'Você tossiu, riu, e no mês seguinte já comprava o seu.',
            effects: [
              { type: 'flag', flag: 'smoker', value: true },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.55,
            text: 'Você fumou dois, achou horrível e não voltou a pensar naquilo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Recusar e ficar por ali mesmo',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ninguém achou estranho. A conversa continuou sem você fumar nada.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
          {
            chance: 0.4,
            text: 'Pegaram no seu pé a noite inteira e você foi embora cedo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'vice_drink_to_cope',
    category: 'health',
    weight: 14,
    // Uma vez na vida, como a primeira sexta no bar: com cooldown, uma vida
    // longa sorteava a mesma noite quatro vezes e 65% de virar alcoolista em
    // cada uma virava quase certeza acumulada.
    once: true,
    conditions: [
      { type: 'age', min: 18 },
      // Quatro anos, não dois: com dois este evento pegava qualquer mau
      // momento, e 81% dos personagens terminavam alcoolistas. A escada de
      // `crisis.ts` já usa 2/3/4/6 — aqui é o degrau em que a coisa deixou
      // de ser uma fase.
      { type: 'unhappyYears', min: 4 },
      { type: 'flag', flag: 'heavy_drinker', value: false },
    ],
    text: 'Faz tempo que a única parte boa do dia é a garrafa que você abre às nove.',
    options: [
      {
        text: 'Continuar assim, que está funcionando',
        outcomes: [
          {
            chance: 0.65,
            text: 'Funcionou por uns meses. Depois passou a ser às sete, e depois de almoço.',
            effects: [
              { type: 'flag', flag: 'heavy_drinker', value: true },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você se assustou sozinho numa terça e deu um passo atrás.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
      {
        text: 'Trocar a garrafa por qualquer outra coisa',
        outcomes: [
          {
            chance: 0.5,
            bias: { happiness: 0.4, health: 0.2 },
            text: 'Você virou a chave e o ano ficou mais duro e mais seu.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.3,
            text: 'Durou três semanas, e voltar não foi um alívio como você esperava.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
          {
            chance: 0.2,
            text: 'Durou três semanas, e o que voltou depois foi pior do que antes.',
            effects: [
              { type: 'flag', flag: 'heavy_drinker', value: true },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'vice_after_work_beers',
    category: 'career',
    weight: 10,
    // Uma vez na vida: com cooldown, uma carreira de trinta anos sorteava a
    // mesma sexta-feira quatro vezes, e o vício deixava de ser escolha para
    // virar questão de tempo. Medido: 65% dos personagens terminavam bebendo.
    once: true,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'hasCareer', value: true },
      { type: 'flag', flag: 'heavy_drinker', value: false },
    ],
    text: 'O time inteiro desce para o bar toda sexta, e é lá que as coisas de verdade são combinadas.',
    options: [
      {
        text: 'Descer toda sexta',
        outcomes: [
          {
            chance: 0.65,
            bias: { charisma: 0.3 },
            text: 'Você virou parte do grupo, e o seu nome passou a aparecer nas conversas certas.',
            effects: [
              { type: 'performance', delta: 7 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
              { type: 'money', delta: -3_000 },
            ],
          },
          {
            chance: 0.35,
            text: 'Sexta virou quinta, e quinta virou quarta.',
            effects: [
              // Sem ganho de desempenho: o vício não pode ser o caminho
              // barato para a promoção, ou vira a jogada ótima.
              { type: 'flag', flag: 'heavy_drinker', value: true },
              { type: 'money', delta: -6_000 },
            ],
          },
        ],
      },
      {
        text: 'Ir embora no horário',
        outcomes: [
          {
            chance: 1,
            text: 'Você dormiu bem o ano inteiro e ficou de fora de metade das decisões.',
            effects: [
              { type: 'performance', delta: -5 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
    ],
  },

  // --- O que ele cobra -----------------------------------------------------
  {
    id: 'vice_smoker_cough',
    category: 'health',
    weight: 16,
    cooldown: 7,
    conditions: [
      { type: 'age', min: 38 },
      { type: 'flag', flag: 'smoker', value: true },
    ],
    text: 'A tosse da manhã deixou de ser da manhã. O médico pediu uma tomografia e falou baixo.',
    options: [
      {
        text: 'Parar hoje, de uma vez',
        outcomes: [
          {
            chance: 0.5,
            bias: { happiness: 0.4, health: 0.3 },
            text: 'Você largou no susto e não voltou. O susto serviu para alguma coisa.',
            effects: [
              { type: 'flag', flag: 'smoker', value: false },
              { type: 'flag', flag: 'quit_a_vice', value: true },
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você largou até sair do consultório.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Ouvir o médico e continuar fumando',
        outcomes: [
          {
            chance: 0.45,
            text: 'A tomografia não mostrou nada. Você tratou isso como permissão.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -6 }],
          },
          {
            chance: 0.55,
            text: 'Mostrou. Agora tem nome, remédio de uso contínuo e consulta marcada.',
            effects: [
              { type: 'flag', flag: 'chronic_condition', value: true },
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'vice_drinker_at_home',
    category: 'relationship',
    weight: 14,
    cooldown: 6,
    conditions: [
      { type: 'flag', flag: 'heavy_drinker', value: true },
      {
        type: 'anyOf',
        conditions: [
          { type: 'hasRelation', kind: 'spouse' },
          { type: 'hasRelation', kind: 'child' },
          { type: 'hasRelation', kind: 'partner' },
        ],
      },
    ],
    text: 'Contaram para você o que você falou ontem. Você não lembrava de ter falado.',
    options: [
      {
        text: 'Pedir desculpa e prometer que muda',
        outcomes: [
          {
            chance: 0.45,
            bias: { charisma: 0.35 },
            text: 'Acreditaram em você, e dava para ver o quanto queriam acreditar.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.55,
            text: 'Era a terceira vez que você prometia a mesma coisa, e ninguém disse nada.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -18 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que estão exagerando',
        outcomes: [
          {
            chance: 1,
            text: 'A casa ficou em silêncio por umas duas semanas.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -22 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Procurar tratamento',
        requirements: [{ type: 'money', min: 8_000 }],
        outcomes: [
          {
            chance: 0.55,
            bias: { happiness: 0.4 },
            text: 'Você entrou num grupo e ficou. Um ano depois ainda estava indo.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'flag', flag: 'heavy_drinker', value: false },
              { type: 'flag', flag: 'quit_a_vice', value: true },
              { type: 'flag', flag: 'sought_help', value: true },
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 20 },
              { type: 'stat', stat: 'health', op: 'delta', value: 7 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você foi a quatro encontros e parou de ir sem avisar ninguém.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  // --- Depois de largar ----------------------------------------------------
  //
  // Callback de profundidade 2: só existe para quem escolheu parar NO evento
  // da tomografia, e não para quem largou por qualquer outro caminho. É a
  // diferença entre reagir ao resultado e reagir à decisão.
  {
    id: 'vice_the_year_after',
    category: 'health',
    weight: 12,
    once: true,
    conditions: [
      { type: 'chose', eventId: 'vice_smoker_cough', optionIndex: 0 },
      { type: 'flag', flag: 'smoker', value: false },
    ],
    text: 'Faz um tempo que você não fuma, e o cheiro do cigarro dos outros passou a incomodar.',
    options: [
      {
        text: 'Aproveitar o fôlego e voltar a se mexer',
        outcomes: [
          {
            chance: 0.7,
            bias: { health: 0.3 },
            text: 'Você subiu quatro andares sem parar e ficou impressionado consigo.',
            effects: [
              { type: 'flag', flag: 'trains_regularly', value: true },
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.3,
            text: 'A disposição voltou e você usou toda ela para trabalhar mais.',
            effects: [
              { type: 'performance', delta: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Um só, num dia difícil, não conta',
        outcomes: [
          {
            chance: 0.5,
            text: 'Contava. Em duas semanas você comprava maço de novo.',
            effects: [
              { type: 'flag', flag: 'smoker', value: true },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você fumou um, achou ruim, e jogou o resto fora.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },
]
