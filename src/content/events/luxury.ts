// O que acontece com quem tem dinheiro demais. Todo evento aqui pede
// patrimônio ou um bem específico — é a contrapartida narrativa do luxo.

import type { GameEvent } from '../../engine/types'

export const LUXURY_EVENTS: GameEvent[] = [
  {
    id: 'luxury_asked_for_money',
    category: 'relationship',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'netWorth', min: 3_000_000 },
      { type: 'age', min: 30 },
    ],
    text: 'Parou de ser segredo que você tem dinheiro. As pessoas mudaram de assunto com você.',
    options: [
      {
        text: 'Ajudar quem pedir',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você ajudou muita gente e algumas dessas ajudas mudaram vidas.',
            effects: [
              { type: 'money', delta: -400_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 16 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você virou caixa eletrônico de meia cidade e ninguém devolveu nada.',
            effects: [
              { type: 'money', delta: -600_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Cortar todo mundo',
        outcomes: [
          {
            chance: 1,
            text: 'Você fechou a torneira. Sobrou dinheiro e sobrou muito menos gente.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -30 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -25 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_foundation',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'netWorth', min: 8_000_000 },
      { type: 'age', min: 40 },
    ],
    text: 'Dá para montar uma fundação com o seu nome. Ou sem o seu nome.',
    options: [
      {
        text: 'Montar com o seu nome',
        requirements: [{ type: 'money', min: 3_000_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'A fundação leva o seu nome e uma placa em cada obra.',
            effects: [
              { type: 'money', delta: -3_000_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 22 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 18 },
              { type: 'flag', flag: 'philanthropist', value: true },
            ],
          },
        ],
      },
      {
        text: 'Doar sem aparecer',
        requirements: [{ type: 'money', min: 3_000_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Ninguém soube que foi você. Você soube.',
            effects: [
              { type: 'money', delta: -3_000_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 25 },
              { type: 'flag', flag: 'philanthropist', value: true },
            ],
          },
        ],
      },
      {
        text: 'Deixar para depois',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou para depois. Depois foi ficando.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_kids_and_money',
    category: 'relationship',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'netWorth', min: 5_000_000 },
      { type: 'hasRelation', kind: 'child' },
      { type: 'age', min: 45 },
    ],
    text: 'Seu filho cresceu sabendo que nunca vai faltar. Isso está começando a aparecer.',
    options: [
      {
        text: 'Cortar a mesada e explicar por quê',
        outcomes: [
          {
            chance: 0.55,
            text: 'Doeu nos dois e funcionou. Ele arrumou o primeiro emprego naquele ano.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.45,
            text: 'Ele ouviu tudo, concordou com tudo, e não mudou nada.',
            effects: [{ type: 'relation', target: { by: 'kind', kind: 'child' }, delta: -8 }],
          },
        ],
      },
      {
        text: 'Deixar como está',
        outcomes: [
          {
            chance: 1,
            text: 'Você deixou. É mais fácil sustentar do que discutir.',
            effects: [
              { type: 'money', delta: -150_000 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_yacht_party',
    category: 'random',
    weight: 9,
    cooldown: 4,
    conditions: [{ type: 'ownsAsset', assetId: 'yacht' }],
    text: 'Todo mundo quer ir na sua festa no barco. Literalmente todo mundo.',
    options: [
      {
        text: 'Encher o convés',
        outcomes: [
          {
            chance: 0.6,
            text: 'Foi a festa do ano e você conheceu gente que abriu portas.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 12 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'Alguém filmou o que não devia e aquilo rodou a semana inteira.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -20 },
            ],
          },
        ],
      },
      {
        text: 'Levar só quem importa',
        outcomes: [
          {
            chance: 1,
            text: 'Seis pessoas, três dias, nenhum vídeo. Foi ótimo.',
            effects: [
              { type: 'money', delta: -25_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_art_forgery',
    category: 'random',
    weight: 8,
    once: true,
    conditions: [{ type: 'ownsAsset', assetId: 'art_collection' }],
    text: 'Um perito disse que uma das peças centrais da sua coleção é falsa.',
    options: [
      {
        text: 'Processar quem vendeu',
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'Você ganhou e recuperou o dinheiro, com juros.',
            effects: [{ type: 'money', delta: 600_000 }],
          },
          {
            chance: 0.55,
            text: 'O processo arrastou por anos e você pagou advogado o tempo todo.',
            effects: [{ type: 'money', delta: -250_000 }],
          },
        ],
      },
      {
        text: 'Vender a coleção antes que se saiba',
        outcomes: [
          {
            chance: 1,
            text: 'Você vendeu rápido e não olhou para trás.',
            effects: [
              { type: 'asset', action: 'sell', assetId: 'art_collection' },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Ficar com ela mesmo assim',
        outcomes: [
          {
            chance: 1,
            text: 'Você gosta do quadro. Continua gostando sabendo que é falso.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_club_pressure',
    category: 'career',
    weight: 9,
    cooldown: 3,
    conditions: [{ type: 'ownsAsset', assetId: 'football_club' }],
    text: 'O time perdeu de novo e a torcida está com o seu nome na faixa.',
    options: [
      {
        text: 'Contratar caro',
        requirements: [{ type: 'money', min: 8_000_000 }],
        outcomes: [
          {
            chance: 0.45,
            bias: { luck: 0.4 },
            text: 'A contratação deu certo e o time engatou.',
            effects: [
              { type: 'money', delta: -8_000_000 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 15 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.55,
            text: 'Gastou uma fortuna num jogador que não jogou dez partidas.',
            effects: [
              { type: 'money', delta: -8_000_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -18 },
            ],
          },
        ],
      },
      {
        text: 'Aguentar a faixa',
        outcomes: [
          {
            chance: 1,
            text: 'Você aguentou. A faixa continuou lá no jogo seguinte.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Vender o clube',
        outcomes: [
          {
            chance: 1,
            text: 'Você vendeu e a torcida comemorou a sua saída.',
            effects: [
              { type: 'asset', action: 'sell', assetId: 'football_club' },
              { type: 'stat', stat: 'fame', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'luxury_philanthropy_pays',
    category: 'relationship',
    weight: 8,
    cooldown: 8,
    conditions: [
      { type: 'flag', flag: 'philanthropist', value: true },
      { type: 'age', min: 45 },
    ],
    text: 'Um desconhecido te parou na rua para dizer que a sua doação pagou a faculdade dele.',
    options: [
      {
        text: 'Ouvir a história inteira',
        outcomes: [
          {
            chance: 1,
            text: 'Vocês ficaram vinte minutos na calçada. Você chorou no carro depois.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 20 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
        ],
      },
      {
        text: 'Agradecer e seguir',
        outcomes: [
          {
            chance: 1,
            text: 'Você agradeceu, apertou a mão e foi embora.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 8 }],
          },
        ],
      },
    ],
  },
]
