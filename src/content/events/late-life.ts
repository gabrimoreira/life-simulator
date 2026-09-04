// Dos cinquenta e cinco em diante. A parte da vida que o jogo tratava como
// uma sala de espera até a checagem de morte.

import type { GameEvent } from '../../engine/types'

export const LATE_LIFE_EVENTS: GameEvent[] = [
  {
    id: 'late_body_slows',
    category: 'health',
    weight: 12,
    cooldown: 4,
    conditions: [{ type: 'age', min: 58 }],
    text: 'Você levou o dobro do tempo para fazer uma coisa que sempre fez rápido.',
    options: [
      {
        text: 'Aceitar o novo ritmo',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou a fazer as coisas devagar e passou a fazer todas.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Forçar como antes',
        outcomes: [
          {
            chance: 0.4,
            text: 'Você deu conta. Levou três dias para se recuperar.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -6 }],
          },
          {
            chance: 0.6,
            text: 'Você se machucou fazendo o que fazia aos trinta.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -16 },
              { type: 'money', delta: -12_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'late_downsize',
    category: 'random',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 62 },
      { type: 'ownsAsset', kind: 'property' },
    ],
    text: 'A casa ficou grande demais para o número de pessoas que mora nela.',
    options: [
      {
        text: 'Vender e ir para um lugar menor',
        outcomes: [
          {
            chance: 1,
            text: 'Você vendeu. Menos escada, menos quarto vazio, mais dinheiro em caixa.',
            effects: [
              { type: 'asset', action: 'sell', assetId: 'house' },
              { type: 'asset', action: 'sell', assetId: 'apartment_small' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Ficar onde está',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. Os quartos vazios continuaram lá, arrumados.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'late_grandkid_help',
    category: 'relationship',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 60 },
      { type: 'relationLevel', kind: 'child', min: 40 },
    ],
    text: 'Seu filho pediu para você ficar com o neto três dias por semana.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.75,
            text: 'Cansa e é o melhor compromisso da sua semana.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 18 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 20 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.25,
            text: 'Três dias viraram cinco e ninguém perguntou se dava.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que não dá',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que não dava. Foi honesto e custou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'late_will',
    category: 'relationship',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 65 },
      { type: 'netWorth', min: 200_000 },
    ],
    text: 'Está na hora de decidir, no papel, para onde vai o que você juntou.',
    options: [
      {
        text: 'Dividir igual entre os filhos',
        requirements: [{ type: 'hasRelation', kind: 'child' }],
        outcomes: [
          {
            chance: 1,
            text: 'Você dividiu em partes iguais e disse isso para todos, em vida.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
        ],
      },
      {
        text: 'Deixar tudo para uma causa',
        outcomes: [
          {
            chance: 1,
            text: 'Você destinou tudo a uma causa. Algumas pessoas nunca te perdoaram.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 18 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -30 },
              { type: 'flag', flag: 'philanthropist', value: true },
            ],
          },
        ],
      },
      {
        text: 'Não fazer testamento',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou para depois. Vão brigar no inventário.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'late_health_scare_second',
    category: 'health',
    weight: 12,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 60 },
      { type: 'flag', flag: 'chronic_condition', value: true },
    ],
    text: 'A condição que você carrega há anos piorou de uma vez.',
    options: [
      {
        text: 'Internar e tratar a sério',
        requirements: [{ type: 'money', min: 60_000 }],
        outcomes: [
          {
            chance: 0.7,
            text: 'Estabilizou. Você saiu de lá com uma lista de coisas que não pode mais fazer.',
            effects: [
              { type: 'money', delta: -60_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.3,
            text: 'Foram semanas internado e a alta veio pior do que a entrada.',
            effects: [
              { type: 'money', delta: -60_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Tratar em casa',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'Deu para segurar em casa, com cuidado.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 4 }],
          },
          {
            chance: 0.55,
            text: 'Não deu. Você piorou por não ter procurado antes.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -20 }],
          },
        ],
      },
    ],
  },

  {
    id: 'late_reconciliation',
    category: 'relationship',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 58 },
      { type: 'relationLevel', kind: 'sibling', max: 25 },
    ],
    text: 'Você não fala com seu irmão há anos e não lembra direito por quê.',
    options: [
      {
        text: 'Ligar',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ele atendeu. Vocês conversaram como se nada tivesse acontecido.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 45 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ele atendeu e lembrava exatamente por quê.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Deixar como está',
        outcomes: [
          {
            chance: 1,
            text: 'Você não ligou. Vai pensar nisso de novo no ano que vem.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'late_scam_target',
    category: 'random',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 65 },
      { type: 'money', min: 30_000 },
    ],
    text: 'Ligaram dizendo ser do banco e sabendo coisas demais sobre você.',
    options: [
      {
        text: 'Desligar e ligar você mesmo para o banco',
        outcomes: [
          {
            chance: 1,
            text: 'Era golpe. Você não caiu e avisou meia lista de contatos.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Confirmar os dados',
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.4 },
            text: 'Era o banco mesmo. Você resolveu em três minutos.',
            effects: [],
          },
          {
            chance: 0.65,
            text: 'Levaram tudo o que estava na conta corrente.',
            effects: [
              { type: 'money', delta: -30_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'late_last_trip',
    category: 'random',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 66 },
      { type: 'money', min: 40_000 },
    ],
    text: 'Tem um lugar que você sempre disse que ia conhecer. Não sobrou tanta viagem assim.',
    options: [
      {
        text: 'Ir agora',
        outcomes: [
          {
            chance: 0.8,
            text: 'Você foi. Voltou com fotos ruins e uma coisa que não cabe em foto.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
            ],
          },
          {
            chance: 0.2,
            text: 'Você passou mal na viagem e voltou antes do fim.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Ano que vem',
        outcomes: [
          {
            chance: 1,
            text: 'Ficou para o ano que vem, como das outras vezes.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'late_alone_at_home',
    category: 'health',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 68 },
      { type: 'not', condition: { type: 'hasRelation', kind: 'spouse' } },
    ],
    text: 'A casa está vazia e o telefone não toca desde a semana passada.',
    options: [
      {
        text: 'Procurar um grupo de convivência',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você entrou num grupo do bairro e passou a ter terça e quinta ocupadas.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'addRelation', kind: 'friend' },
              { type: 'stat', stat: 'health', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você foi duas vezes e não voltou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
      {
        text: 'Ligar você mesmo para alguém',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você ligou primeiro. Deveria ter feito isso há muito tempo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 15 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.25,
            text: 'Ninguém atendeu, e ninguém retornou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -12 }],
          },
        ],
      },
      {
        text: 'Ficar quieto',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou quieto. A casa continuou do mesmo tamanho.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'late_pass_the_torch',
    category: 'career',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 58 },
      { type: 'hasCareer', value: true },
      { type: 'careerLevel', min: 3 },
    ],
    text: 'Alguém muito mais novo está pronto para o seu lugar, e você viu antes de todo mundo.',
    options: [
      {
        text: 'Preparar a sucessão e sair',
        outcomes: [
          {
            chance: 1,
            text: 'Você entregou o cargo arrumado e saiu por cima.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'flag', flag: 'retired', value: true },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
            ],
          },
        ],
      },
      {
        text: 'Segurar o cargo',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você segurou mais uns anos. Ninguém reclamou na sua frente.',
            effects: [
              { type: 'performance', delta: 5 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ele foi embora para o concorrente e levou metade do time.',
            effects: [
              { type: 'performance', delta: -20 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },
]
