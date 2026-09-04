// A trilha do crime. Todo evento aqui pede `careerKind: 'crime'` ou uma ficha
// suja — o que separa quem escolheu essa vida de quem só passou perto.

import type { GameEvent } from '../../engine/types'

export const CRIME_EVENTS: GameEvent[] = [
  {
    id: 'crime_first_job',
    category: 'crime',
    weight: 12,
    once: true,
    conditions: [{ type: 'careerKind', kind: 'crime' }],
    text: 'Te chamaram para o primeiro serviço de verdade. Não dá para recusar e continuar dentro.',
    options: [
      {
        text: 'Ir junto',
        outcomes: [
          {
            chance: 0.6,
            bias: { luck: 0.4 },
            text: 'Correu limpo. Você recebeu a parte e ninguém falou seu nome.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'performance', delta: 15 },
            ],
          },
          {
            chance: 0.25,
            text: 'Deu errado no meio. Vocês saíram correndo e sem nada.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'performance', delta: -8 },
            ],
          },
          {
            chance: 0.15,
            text: 'Tinha polícia esperando. Você foi o único que não correu rápido o bastante.',
            effects: [{ type: 'jail', years: 4, reason: 'roubo' }],
          },
        ],
      },
      {
        text: 'Inventar uma desculpa',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi. Ficou marcado como gente em quem não se confia.',
            effects: [
              { type: 'performance', delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_police_raid',
    category: 'crime',
    weight: 12,
    cooldown: 4,
    conditions: [
      { type: 'careerKind', kind: 'crime' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'A polícia bateu no ponto de madrugada. Alguém entregou.',
    options: [
      {
        text: 'Assumir e proteger o resto',
        outcomes: [
          {
            chance: 1,
            text: 'Você assumiu tudo. Lá dentro, isso vale mais que dinheiro.',
            effects: [
              { type: 'jail', years: 5, reason: 'associação criminosa' },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
        ],
      },
      {
        text: 'Entregar quem entregou você',
        outcomes: [
          {
            chance: 0.55,
            bias: { charisma: 0.4, luck: 0.15 },
            text: 'Você negociou e saiu andando. Metade do bairro sabe.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -20 },
              { type: 'performance', delta: -25 },
            ],
          },
          {
            chance: 0.45,
            text: 'A delação não colou e você foi junto do mesmo jeito.',
            effects: [
              { type: 'jail', years: 6, reason: 'associação criminosa' },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -15 },
            ],
          },
        ],
      },
      {
        text: 'Fugir e sumir por um tempo',
        requirements: [{ type: 'money', min: 50_000 }],
        outcomes: [
          {
            chance: 0.6,
            bias: { luck: 0.5 },
            text: 'Você sumiu por dois anos e voltou quando esfriou.',
            effects: [
              { type: 'money', delta: -50_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
          {
            chance: 0.4,
            text: 'Te acharam antes de você chegar longe.',
            effects: [{ type: 'jail', years: 7, reason: 'fuga e associação criminosa' }],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_go_straight',
    category: 'crime',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'careerKind', kind: 'crime' },
      { type: 'age', min: 28 },
    ],
    text: 'Você fez a conta de quanto tempo ainda dá para durar nisso. A conta não é boa.',
    options: [
      {
        text: 'Sair enquanto dá',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você saiu e ninguém veio atrás. Não é assim que costuma acabar.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
            ],
          },
          {
            chance: 0.35,
            text: 'Ninguém sai por conta própria. Cobraram a saída.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'health', op: 'delta', value: -20 },
              { type: 'money', delta: -80_000 },
            ],
          },
        ],
      },
      {
        text: 'Ir até onde der',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. Sempre dá para faturar mais um ano.',
            effects: [
              { type: 'performance', delta: 10 },
              { type: 'money', delta: 40_000 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_big_score',
    category: 'crime',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'careerKind', kind: 'crime' },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Apareceu um serviço grande. Grande o bastante para ser o último, ou para acabar com tudo.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.6 },
            text: 'Saiu perfeito. Você não precisa trabalhar por muitos anos.',
            effects: [
              { type: 'money', delta: 900_000 },
              { type: 'performance', delta: 20 },
            ],
          },
          {
            chance: 0.35,
            text: 'Saiu pela metade. Deu para pagar as contas e o susto.',
            effects: [{ type: 'money', delta: 120_000 }],
          },
          {
            chance: 0.3,
            text: 'Era armadilha. Pegaram todo mundo lá dentro.',
            effects: [{ type: 'jail', years: 9, reason: 'roubo qualificado' }],
          },
        ],
      },
      {
        text: 'Passar a vez',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou. Meses depois soube que quem foi não voltou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_family_finds_out',
    category: 'crime',
    weight: 10,
    once: true,
    conditions: [
      { type: 'careerKind', kind: 'crime' },
      {
        type: 'anyOf',
        conditions: [
          { type: 'hasRelation', kind: 'mother' },
          { type: 'hasRelation', kind: 'spouse' },
        ],
      },
    ],
    text: 'Alguém da sua casa descobriu de onde vem o dinheiro.',
    options: [
      {
        text: 'Contar tudo',
        outcomes: [
          {
            chance: 0.4,
            text: 'Foi difícil e ficou tudo no lugar. Difícil, mas ficou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -15 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.6,
            text: 'Não deu para consertar com conversa.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -45 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -40 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -18 },
            ],
          },
        ],
      },
      {
        text: 'Negar tudo',
        outcomes: [
          {
            chance: 1,
            text: 'Você negou. Ninguém acreditou e ninguém falou mais nisso.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_recruited_young',
    category: 'crime',
    weight: 8,
    once: true,
    conditions: [
      { type: 'age', min: 13, max: 19 },
      { type: 'hasCareer', value: false },
      { type: 'socialClass', oneOf: ['poor', 'lowerMiddle'] },
    ],
    text: 'Um cara do bairro ofereceu um dinheiro fácil para você guardar uma coisa por uns dias.',
    options: [
      {
        text: 'Guardar',
        outcomes: [
          {
            chance: 0.6,
            bias: { luck: 0.4 },
            text: 'Foram três dias e um dinheiro que você nunca tinha visto junto.',
            effects: [
              { type: 'money', delta: 8_000 },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
          {
            chance: 0.4,
            text: 'A polícia entrou na sua casa antes do prazo.',
            effects: [
              { type: 'flag', flag: 'criminal_record', value: true },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -15 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Ele deu de ombros e perguntou pro seu vizinho.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'crime_old_debt',
    category: 'crime',
    weight: 9,
    cooldown: 7,
    conditions: [
      { type: 'flag', flag: 'underworld_ties', value: true },
      { type: 'not', condition: { type: 'careerKind', kind: 'crime' } },
      { type: 'age', min: 25 },
    ],
    text: 'Um contato antigo apareceu cobrando um favor que você já tinha esquecido.',
    options: [
      {
        text: 'Pagar em dinheiro',
        requirements: [{ type: 'money', min: 60_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou e pediu para não aparecerem mais. Aceitaram.',
            effects: [
              { type: 'money', delta: -60_000 },
              { type: 'flag', flag: 'underworld_ties', value: false },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
      {
        text: 'Fazer o favor',
        outcomes: [
          {
            chance: 0.6,
            text: 'Foi rápido e ninguém ficou sabendo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
          {
            chance: 0.4,
            text: 'Não foi rápido e alguém ficou sabendo.',
            effects: [{ type: 'jail', years: 3, reason: 'participação em crime' }],
          },
        ],
      },
      {
        text: 'Mandar embora',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'Você mandou embora e não voltaram. Você não dormiu bem por um ano.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
          {
            chance: 0.55,
            text: 'Voltaram. Não foi uma conversa.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -22 },
              { type: 'money', delta: -30_000 },
            ],
          },
        ],
      },
    ],
  },
]
