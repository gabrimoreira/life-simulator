// Ser pai ou mãe. Só existe para quem tem filho — e cobra os pontos de ação
// que a carreira também quer.

import type { GameEvent } from '../../engine/types'

export const PARENTHOOD_EVENTS: GameEvent[] = [
  {
    id: 'parent_first_words',
    category: 'relationship',
    weight: 11,
    once: true,
    conditions: [{ type: 'hasRelation', kind: 'child' }],
    text: 'Seu filho falou a primeira frase inteira, e era sobre você.',
    options: [
      {
        text: 'Guardar isso para sempre',
        outcomes: [
          {
            chance: 1,
            text: 'Você lembra da frase exata pelo resto da vida.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 12 },
            ],
          },
        ],
      },
      {
        text: 'Você estava no trabalho e te contaram',
        outcomes: [
          {
            chance: 1,
            text: 'Te contaram por mensagem. Você respondeu com um coração.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_school_choice',
    category: 'relationship',
    weight: 11,
    cooldown: 8,
    conditions: [{ type: 'relationLevel', kind: 'child', min: 0 }],
    text: 'Chegou a hora de escolher a escola do seu filho. A boa é cara.',
    options: [
      {
        text: 'Pagar a escola particular',
        requirements: [{ type: 'money', min: 90_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou. Vai pagar por muitos anos.',
            effects: [
              { type: 'money', delta: -90_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
        ],
      },
      {
        text: 'Escola pública e reforço em casa',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você acompanhou dever de casa todo dia. Funcionou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 16 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'Você não teve tempo de acompanhar quase nada.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_teen_trouble',
    category: 'relationship',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 35 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'A escola ligou. Seu filho aprontou, e não foi pequeno.',
    options: [
      {
        text: 'Escutar antes de brigar',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você ouviu primeiro. Ele contou o resto que a escola não sabia.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 18 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você ouviu e ele não falou nada. Ficaram os dois calados.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -5 }],
          },
        ],
      },
      {
        text: 'Botar limite duro',
        outcomes: [
          {
            chance: 0.45,
            text: 'O limite pegou. Ele reclamou por meses e nunca mais repetiu.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -10 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.55,
            text: 'O limite quebrou o que restava de conversa entre vocês.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Deixar a escola resolver',
        outcomes: [
          {
            chance: 1,
            text: 'Você não foi. Resolveram sem você, como você pediu.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -18 }],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_pay_college',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 42 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'Seu filho passou numa faculdade cara e olhou pra você.',
    options: [
      {
        text: 'Bancar tudo',
        requirements: [{ type: 'money', min: 200_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você bancou os cinco anos. Ele se formou sem dever nada a banco nenhum.',
            effects: [
              { type: 'money', delta: -200_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
        ],
      },
      {
        text: 'Ajudar com o que der',
        outcomes: [
          {
            chance: 1,
            text: 'Você ajudou com metade e ele trabalhou pela outra.',
            effects: [
              { type: 'money', delta: -70_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 12 },
            ],
          },
        ],
      },
      {
        text: 'Dizer que ele se vira',
        outcomes: [
          {
            chance: 0.5,
            text: 'Ele se virou, e nunca deixou você esquecer que se virou sozinho.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -20 }],
          },
          {
            chance: 0.5,
            text: 'Ele desistiu da vaga. Vocês não falam sobre isso.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -30 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_child_leaves',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 45 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'Seu filho arrumou as caixas. A casa vai ficar do tamanho que sempre foi, e vai parecer maior.',
    options: [
      {
        text: 'Ajudar na mudança',
        outcomes: [
          {
            chance: 1,
            text: 'Você carregou caixa o dia inteiro e voltou pra casa em silêncio.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Dar uma quantia para ele começar',
        requirements: [{ type: 'money', min: 40_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você deu o que dava. Ele levou tempo para aceitar.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 20 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_child_asks_money',
    category: 'relationship',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 48 },
      { type: 'hasRelation', kind: 'child' },
    ],
    text: 'Seu filho adulto pediu dinheiro. De novo.',
    options: [
      {
        text: 'Dar',
        requirements: [{ type: 'money', min: 25_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você deu sem cobrar explicação. Ele não devolveu, como das outras vezes.',
            effects: [
              { type: 'money', delta: -25_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 8 },
            ],
          },
        ],
      },
      {
        text: 'Dizer não desta vez',
        outcomes: [
          {
            chance: 0.55,
            text: 'Ele ficou bravo e se virou. Foi a melhor coisa que você fez por ele.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -15 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ele parou de ligar por dois anos.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -30 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'parent_proud_moment',
    category: 'relationship',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 50 },
      { type: 'relationLevel', kind: 'child', min: 60 },
    ],
    text: 'Seu filho conseguiu uma coisa grande, e a primeira ligação foi pra você.',
    options: [
      {
        text: 'Dizer que sempre soube',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que sempre soube, e naquele dia era verdade.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 15 },
            ],
          },
        ],
      },
      {
        text: 'Fazer uma festa',
        requirements: [{ type: 'money', min: 20_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você chamou a família inteira. Foi um dia que todo mundo lembra.',
            effects: [
              { type: 'money', delta: -20_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 18 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 10 },
            ],
          },
        ],
      },
    ],
  },
]
