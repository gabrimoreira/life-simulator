// Eventos sem faixa etária estreita: entram na loteria a vida inteira.

import type { GameEvent } from '../../engine/types'

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'random_lottery_ticket',
    category: 'random',
    weight: 5,
    cooldown: 2,
    conditions: [{ type: 'age', min: 18 }],
    text: 'Você parou na lotérica sem motivo nenhum. A fila estava curta.',
    options: [
      {
        text: 'Apostar',
        requirements: [{ type: 'money', min: 50 }],
        outcomes: [
          {
            chance: 0.02,
            luckBias: 1.2,
            text: 'Cinco números. Não é a sorte grande, mas mudou o ano inteiro.',
            effects: [
              { type: 'money', delta: 200000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 25 },
            ],
          },
          {
            chance: 0.98,
            text: 'Nada. Como sempre.',
            effects: [{ type: 'money', delta: -50 }],
          },
        ],
      },
      {
        text: 'Seguir andando',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou reto e nem pensou mais nisso.',
            effects: [],
          },
        ],
      },
    ],
  },

  {
    id: 'random_accident',
    category: 'health',
    weight: 4,
    cooldown: 3,
    conditions: [{ type: 'age', min: 5 }],
    text: 'Você atravessou fora da faixa porque o farol estava demorando.',
    options: [
      {
        text: 'Correr',
        outcomes: [
          {
            chance: 0.867,
            luckBias: 0.5,
            text: 'Você atravessou. Um motorista buzinou e você levantou a mão pedindo desculpa.',
            effects: [],
          },
          {
            chance: 0.12,
            text: 'Uma moto te pegou de raspão. Foram semanas de fisioterapia.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -20 },
              { type: 'money', delta: -6000 },
            ],
          },
          {
            chance: 0.013,
            luckBias: -0.8,
            text: 'Você não viu o carro que vinha na segunda faixa.',
            effects: [{ type: 'death', cause: 'atropelamento' }],
          },
        ],
      },
      {
        text: 'Voltar e esperar o farol',
        outcomes: [
          {
            chance: 1,
            text: 'Você esperou os quarenta segundos. Chegou no mesmo horário.',
            effects: [],
          },
        ],
      },
    ],
  },

  {
    id: 'random_kindness',
    category: 'random',
    weight: 7,
    cooldown: 4,
    conditions: [{ type: 'age', min: 10 }],
    text: 'Uma senhora deixou cair a sacola inteira de compras no meio da calçada movimentada.',
    options: [
      {
        text: 'Parar e ajudar',
        outcomes: [
          {
            chance: 0.85,
            text: 'Vocês recolheram tudo juntos. Ela agradeceu três vezes e você ficou bem o dia inteiro.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 3 },
            ],
          },
          {
            chance: 0.15,
            luckBias: 0.6,
            text: 'Ela insistiu em te dar o telefone do filho, que acabou virando um contato valioso.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
        ],
      },
      {
        text: 'Desviar e seguir',
        outcomes: [
          {
            chance: 1,
            text: 'Você desviou. Não pensou mais nisso, mas também não esqueceu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -2 }],
          },
        ],
      },
    ],
  },

  {
    id: 'random_illness',
    category: 'health',
    weight: 7,
    cooldown: 4,
    conditions: [{ type: 'age', min: 3 }],
    text: 'Você acordou com febre alta e não melhorou em três dias.',
    options: [
      {
        text: 'Procurar médico',
        outcomes: [
          {
            chance: 0.8,
            text: 'Era infecção. Antibiótico resolveu em uma semana.',
            effects: [
              { type: 'money', delta: -800 },
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
            ],
          },
          {
            chance: 0.2,
            text: 'Era mais grave do que parecia. Você ficou internad{o} por doze dias.',
            effects: [
              { type: 'money', delta: -9000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Esperar passar',
        outcomes: [
          {
            chance: 0.6,
            luckBias: 0.5,
            text: 'Passou sozinho na segunda semana.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -5 }],
          },
          {
            chance: 0.4,
            text: 'Virou pneumonia. Você foi parar no hospital do mesmo jeito, só que pior.',
            effects: [
              { type: 'money', delta: -12000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -22 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'random_bad_news_online',
    category: 'random',
    weight: 6,
    cooldown: 6,
    conditions: [{ type: 'age', min: 14 }],
    text: 'Um post seu de anos atrás voltou a circular, fora de contexto e com muita gente comentando.',
    options: [
      {
        text: 'Responder publicamente',
        requirements: [{ type: 'stat', stat: 'charisma', min: 45 }],
        outcomes: [
          {
            chance: 0.5,
            luckBias: 0.4,
            text: 'Sua resposta foi honesta e virou o jogo. Você saiu maior do que entrou.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 10 }],
          },
          {
            chance: 0.5,
            text: 'Você deu combustível. Durou mais duas semanas.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Apagar tudo e sumir',
        outcomes: [
          {
            chance: 1,
            text: 'Você apagou a conta. Em um mês ninguém lembrava.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Ignorar completamente',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você não olhou o celular por uma semana. Morreu sozinho.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
          {
            chance: 0.35,
            text: 'O silêncio foi lido como confissão. Pegou no seu trabalho.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
    ],
  },
]
