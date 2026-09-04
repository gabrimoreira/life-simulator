// A vida lá dentro. Todo evento aqui declara `inPrison: true`, e é por isso
// que ele só existe na cadeia — o filtro do engine cuida do resto.

import type { GameEvent } from '../../engine/types'

export const PRISON_EVENTS: GameEvent[] = [
  {
    id: 'prison_first_week',
    category: 'crime',
    weight: 14,
    once: true,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Primeira semana. Todo mundo está te medindo, e você sabe disso.',
    options: [
      {
        text: 'Encarar de volta',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'Funcionou. Deixaram você em paz depois disso.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 8 }],
          },
          {
            chance: 0.55,
            text: 'Não funcionou. Você aprendeu na marra como é ali.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Ficar no seu canto',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você passou despercebid{o}. Foi a decisão certa.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
          {
            chance: 0.3,
            text: 'Ficar quieto foi lido como fraqueza.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -8 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_visit',
    category: 'crime',
    weight: 12,
    cooldown: 2,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Dia de visita. A fila é longa e você não sabe se alguém vem.',
    options: [
      {
        text: 'Esperar até o fim',
        requirements: [
          {
            type: 'anyOf',
            conditions: [
              { type: 'hasRelation', kind: 'mother' },
              { type: 'hasRelation', kind: 'father' },
              { type: 'hasRelation', kind: 'spouse' },
              { type: 'hasRelation', kind: 'sibling' },
            ],
          },
        ],
        outcomes: [
          {
            chance: 0.65,
            text: 'Veio. Foram quarenta minutos e valeram o mês inteiro.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 10 },
            ],
          },
          {
            chance: 0.35,
            text: 'Você esperou até fecharem o portão. Ninguém veio.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -16 }],
          },
        ],
      },
      {
        text: 'Não descer',
        outcomes: [
          {
            chance: 1,
            text: 'Você não desceu. Preferiu não saber.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_fight',
    category: 'crime',
    weight: 11,
    cooldown: 2,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Alguém pegou a sua marmita na sua frente, olhando pra você.',
    options: [
      {
        text: 'Reagir na hora',
        outcomes: [
          {
            chance: 0.4,
            bias: { luck: 0.4 },
            text: 'Você reagiu e ninguém mais mexeu com você.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.45,
            text: 'Você levou a pior e ainda foi pro isolamento.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -16 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
          {
            chance: 0.15,
            text: 'A briga virou processo. Sua pena aumentou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'jail', years: 3, reason: 'lesão corporal' },
            ],
          },
        ],
      },
      {
        text: 'Deixar quieto',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou quieto e passou fome naquele dia.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_work_program',
    category: 'crime',
    weight: 10,
    cooldown: 3,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Abriu vaga na oficina. Trabalhar remite pena e paga uma miséria.',
    options: [
      {
        text: 'Entrar na oficina',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você trabalhou o ano inteiro. Remiu dias e aprendeu um ofício.',
            effects: [
              { type: 'money', delta: 2_500 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.25,
            bias: { luck: 0.6 },
            text: 'Você trabalhou tão bem que a remição adiantou sua saída.',
            effects: [
              { type: 'money', delta: 2_500 },
              { type: 'release' },
            ],
          },
        ],
      },
      {
        text: 'Passar',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou. O dia continuou com vinte e quatro horas.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_offer_inside',
    category: 'crime',
    weight: 9,
    cooldown: 4,
    conditions: [
      { type: 'inPrison', value: true },
      { type: 'stat', stat: 'charisma', min: 40 },
    ],
    text: 'Te ofereceram um lugar num esquema que continua lá fora, quando você sair.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.4 },
            text: 'Você aceitou. Vai sair com contato e com dívida.',
            effects: [
              { type: 'money', delta: 30_000 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
          {
            chance: 0.5,
            text: 'Você aceitou e descobriu que era teste. Passou no teste errado.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 0.6,
            text: 'Recusaram bem. Ninguém insistiu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 4 }],
          },
          {
            chance: 0.4,
            text: 'Recusar teve preço, e você pagou nas semanas seguintes.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -10 }],
          },
        ],
      },
    ],
  },

  // Os dez abaixo existem porque o pool da cadeia era de CINCO eventos, e um
  // deles `once`. Penas chegam a nove anos, e prison_fight ainda soma três: o
  // jogador via os mesmos quatro textos por uma década inteira, quando o pool
  // não esvaziava de vez por causa dos cooldowns.

  {
    id: 'prison_library',
    category: 'crime',
    weight: 11,
    cooldown: 3,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'A biblioteca do presídio tem trezentos livros e quase ninguém entra nela.',
    options: [
      {
        text: 'Ler tudo o que der',
        outcomes: [
          {
            chance: 1,
            text: 'Você leu mais nesse ano do que na vida inteira lá fora.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 9 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
        ],
      },
      {
        text: 'Deixar o tempo passar',
        outcomes: [
          {
            chance: 1,
            text: 'Você olhou o teto por doze meses. O teto não mudou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_remission_study',
    category: 'crime',
    weight: 12,
    once: true,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Abriu turma de ensino formal aqui dentro. Cada bloco de aulas desconta pena.',
    options: [
      {
        text: 'Entrar na turma',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você foi até o fim e saiu um ano mais cedo, com o diploma que não tinha.',
            effects: [
              { type: 'jail', years: -1, reason: 'remição por estudo' },
              { type: 'education', level: 'highschool' },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 7 },
            ],
          },
          {
            chance: 0.25,
            text: 'Cancelaram a turma no meio do ano, por falta de professor.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
      {
        text: 'Não é para você',
        outcomes: [
          {
            chance: 1,
            text: 'Você achou que não ia adiantar nada e não foi.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_faith',
    category: 'crime',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'O grupo religioso se reúne nas quartas. Metade está ali por fé, metade pelo café.',
    options: [
      {
        text: 'Frequentar',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você encontrou ali uma coisa que não sabia que estava procurando.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você foi pelo café e ficou pela companhia. Já valeu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
        ],
      },
      {
        text: 'Passar longe',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi. Quarta-feira continuou sendo quarta-feira.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -2 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_solitary',
    category: 'crime',
    weight: 9,
    cooldown: 5,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Acharam algo na sua cela que não era seu. A punição é a mesma de qualquer jeito.',
    options: [
      {
        text: 'Assumir e acabar logo',
        outcomes: [
          {
            chance: 1,
            text: 'Trinta dias sozinho. Você saiu de lá diferente e não para melhor.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -18 },
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
        ],
      },
      {
        text: 'Dizer de quem era',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi para o isolamento. Todo mundo soube por quê.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -20 },
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'flag', flag: 'snitched_inside', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_snitch_price',
    category: 'crime',
    weight: 11,
    cooldown: 3,
    conditions: [
      { type: 'inPrison', value: true },
      { type: 'flag', flag: 'snitched_inside', value: true },
    ],
    text: 'Ninguém esqueceu. Aqui dentro a memória é a única coisa que sobra de graça.',
    options: [
      {
        text: 'Pedir transferência',
        outcomes: [
          {
            chance: 0.5,
            text: 'Saiu a transferência. Recomeçar em outro lugar é melhor que isso aqui.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
              { type: 'flag', flag: 'snitched_inside', value: false },
            ],
          },
          {
            chance: 0.5,
            text: 'Negaram. Você continuou onde estava, com quem estava.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Aguentar',
        outcomes: [
          {
            chance: 1,
            text: 'Você aguentou o ano inteiro sem dar as costas para ninguém.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_letter_home',
    category: 'crime',
    weight: 11,
    cooldown: 3,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Faz meses que você não escreve para casa. A cada mês fica mais difícil começar.',
    options: [
      {
        text: 'Escrever hoje',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você escreveu quatro páginas e recebeu seis de volta.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 9 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você escreveu. Não veio resposta.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -9 }],
          },
        ],
      },
      {
        text: 'Deixar para o mês que vem',
        outcomes: [
          {
            chance: 1,
            text: 'Mais um mês. Você já perdeu a conta de quantos foram.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_parole_board',
    category: 'crime',
    weight: 13,
    cooldown: 4,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Audiência de progressão marcada. Vinte minutos para explicar quem você virou.',
    options: [
      {
        text: 'Dizer o que eles querem ouvir',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.3 },
            text: 'Funcionou. Saiu um ano da conta.',
            effects: [{ type: 'jail', years: -1, reason: 'progressão de regime' }],
          },
          {
            chance: 0.55,
            text: 'Eles já ouviram aquilo mil vezes, do jeito exato que você falou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Falar a verdade, o que quer que seja',
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.5 },
            text: 'A honestidade pegou bem. Saiu quase dois anos da conta.',
            effects: [
              { type: 'jail', years: -2, reason: 'progressão de regime' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.65,
            text: 'Você foi honesto e eles anotaram tudo. Nada mudou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_health_neglect',
    category: 'health',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Você está sentindo uma coisa há semanas. A fila da enfermaria tem quarenta nomes.',
    options: [
      {
        text: 'Entrar na fila mesmo assim',
        outcomes: [
          {
            chance: 0.5,
            text: 'Depois de três meses te atenderam, e ainda deu tempo.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 6 }],
          },
          {
            chance: 0.5,
            text: 'Você esperou três meses e mandaram tomar analgésico.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
      {
        text: 'Aguentar calado',
        outcomes: [
          {
            chance: 1,
            text: 'Passou sozinho, do jeito que essas coisas passam: pela metade.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -14 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_new_arrival',
    category: 'crime',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Chegou um garoto de dezoito anos na sua ala, com a mesma cara que você tinha.',
    options: [
      {
        text: 'Dar um caminho para ele',
        outcomes: [
          {
            chance: 0.65,
            text: 'Ele te ouviu. Não é pouca coisa, ali dentro.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 11 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.35,
            text: 'Ele não te ouviu, e você viu o que aconteceu depois.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Não é problema seu',
        outcomes: [
          {
            chance: 1,
            text: 'Você olhou para o outro lado, que é o que quase todo mundo faz.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'prison_counting_days',
    category: 'crime',
    weight: 12,
    cooldown: 2,
    conditions: [{ type: 'inPrison', value: true }],
    text: 'Mais um ano igual ao anterior. É assim que a maior parte de uma pena passa: sem acontecer nada.',
    options: [
      {
        text: 'Manter uma rotina',
        outcomes: [
          {
            chance: 1,
            text: 'Acordar, treinar, comer, ler, dormir. A rotina é o que segura.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 3 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
        ],
      },
      {
        text: 'Deixar os dias se misturarem',
        outcomes: [
          {
            chance: 1,
            text: 'Você não sabe dizer o que fez nesse ano. Nada, provavelmente.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -9 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },
]
