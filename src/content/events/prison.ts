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
            luckBias: 0.4,
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
            luckBias: 0.4,
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
            luckBias: 0.6,
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
            luckBias: 0.4,
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
]
