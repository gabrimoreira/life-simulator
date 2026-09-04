// 60 anos em diante.

import type { GameEvent } from '../../engine/types'

export const ELDER_EVENTS: GameEvent[] = [
  {
    id: 'elder_retirement',
    category: 'career',
    weight: 16,
    once: true,
    conditions: [{ type: 'age', min: 60, max: 72 }],
    text: 'Você já pode se aposentar. Também dá para continuar mais uns anos e melhorar o benefício.',
    options: [
      {
        text: 'Aposentar agora',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você parou. Levou seis meses para descobrir o que fazer com o dia inteiro, e descobriu.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'health', op: 'delta', value: 5 },
              { type: 'flag', flag: 'retired', value: true },
              { type: 'career', action: 'quit' },
            ],
          },
          {
            chance: 0.4,
            text: 'Você parou e não soube o que fazer com o silêncio.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'flag', flag: 'retired', value: true },
              { type: 'career', action: 'quit' },
            ],
          },
        ],
      },
      {
        text: 'Trabalhar mais alguns anos',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você ficou mais quatro anos. O benefício melhorou bastante.',
            effects: [
              { type: 'money', delta: 60000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'flag', flag: 'retired', value: true },
              { type: 'career', action: 'quit' },
            ],
          },
          {
            chance: 0.3,
            text: 'Você ficou e o corpo não acompanhou. Saiu por invalidez.',
            effects: [
              { type: 'money', delta: 20000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -16 },
              { type: 'flag', flag: 'retired', value: true },
              { type: 'career', action: 'quit' },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'elder_grandchild',
    category: 'relationship',
    weight: 12,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 58, max: 85 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'Seu filho ligou para avisar que você vai ser avô ou avó.',
    options: [
      {
        text: 'Se envolver o quanto puder',
        outcomes: [
          {
            chance: 1,
            text: 'Você virou presença fixa. Buscar na escola virou o melhor compromisso da semana.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 20 },
              { type: 'money', delta: -8000 },
            ],
          },
        ],
      },
      {
        text: 'Ajudar de longe',
        outcomes: [
          {
            chance: 1,
            text: 'Você mandou dinheiro e apareceu nas datas. Foi o suficiente para você.',
            effects: [
              { type: 'money', delta: -15000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'elder_diagnosis',
    category: 'health',
    weight: 13,
    once: true,
    conditions: [
      { type: 'age', min: 64 },
      { type: 'stat', stat: 'health', max: 60 },
    ],
    text: 'O diagnóstico saiu e não é bom. Tem tratamento, mas é longo e caro.',
    options: [
      {
        text: 'Fazer o tratamento completo',
        requirements: [{ type: 'money', min: 50000 }],
        outcomes: [
          {
            chance: 0.7,
            bias: { luck: 0.4 },
            text: 'O tratamento funcionou. Você ganhou anos que não estavam no cálculo.',
            effects: [
              { type: 'money', delta: -50000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 22 },
            ],
          },
          {
            chance: 0.3,
            text: 'O tratamento segurou a doença, mas te deixou frágil.',
            effects: [
              { type: 'money', delta: -50000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              // Um diagnóstico com tratamento longo não some no ano seguinte:
              // este evento mexia só em stat, e nada no jogo lembrava dele.
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
        ],
      },
      {
        text: 'Fazer o que o SUS oferece',
        outcomes: [
          {
            chance: 0.5,
            text: 'Demorou para começar, mas você foi bem atendid{o} e reagiu bem.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: 10 }],
          },
          {
            chance: 0.5,
            text: 'A fila foi longa demais. Quando chegou a vez, já tinha avançado.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -16 }],
          },
        ],
      },
      {
        text: 'Recusar tratamento',
        outcomes: [
          {
            chance: 1,
            text: 'Você decidiu não passar por aquilo. Usou o tempo do seu jeito.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -22 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'elder_inheritance',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 52, max: 78 },
      { type: 'anyOf', conditions: [
        { type: 'hasRelation', kind: 'mother' },
        { type: 'hasRelation', kind: 'father' },
      ] },
    ],
    text: 'Seu último pai vivo faleceu. Ficou a casa, e ficaram os irmãos para dividir.',
    options: [
      {
        text: 'Dividir tudo em partes iguais',
        outcomes: [
          {
            chance: 1,
            text: 'Você abriu mão de discutir. Sobrou menos dinheiro e a família inteira.',
            effects: [
              { type: 'money', delta: 70000 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'mother' } },
              { type: 'removeRelation', target: { by: 'kind', kind: 'father' } },
            ],
          },
        ],
      },
      {
        text: 'Brigar pela sua parte',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você conseguiu mais do que a divisão simples. E não fala mais com seus irmãos.',
            effects: [
              { type: 'money', delta: 140000 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -50 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'mother' } },
              { type: 'removeRelation', target: { by: 'kind', kind: 'father' } },
            ],
          },
          {
            chance: 0.4,
            text: 'O inventário virou processo. Anos depois, os advogados ficaram com quase tudo.',
            effects: [
              { type: 'money', delta: 20000 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -40 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -18 },
              { type: 'removeRelation', target: { by: 'kind', kind: 'mother' } },
              { type: 'removeRelation', target: { by: 'kind', kind: 'father' } },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'elder_legacy',
    category: 'relationship',
    weight: 9,
    cooldown: 8,
    conditions: [{ type: 'age', min: 70 }],
    text: 'Você começou a pensar no que fica depois. Tem tempo e algum dinheiro para decidir isso.',
    options: [
      {
        text: 'Escrever tudo o que lembra',
        outcomes: [
          {
            chance: 1,
            text: 'Você encheu cadernos com a história da família. Alguém vai ler isso um dia.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 3 },
              { type: 'flag', flag: 'wrote_memoir', value: true },
            ],
          },
        ],
      },
      {
        text: 'Doar o que puder',
        requirements: [{ type: 'money', min: 30000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você doou uma boa parte. Não avisou ninguém, e isso foi o melhor da história.',
            effects: [
              { type: 'money', delta: -30000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
            ],
          },
        ],
      },
      {
        text: 'Não pensar nisso',
        outcomes: [
          {
            chance: 1,
            text: 'Você achou o assunto mórbido e mudou de assunto consigo mesm{o}.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },
]
