// Dos trinta aos sessenta. Era a faixa mais rala do jogo: a vida adulta
// repetia os mesmos quatro eventos por trinta turnos seguidos.

import type { GameEvent } from '../../engine/types'

export const MIDLIFE_EVENTS: GameEvent[] = [
  {
    id: 'mid_back_pain',
    category: 'health',
    weight: 11,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 33, max: 62 },
      { type: 'not', condition: { type: 'flag', flag: 'trains_regularly', value: true } },
    ],
    text: 'Sua coluna travou levantando uma caixa. Você ficou três dias no chão da sala.',
    options: [
      {
        text: 'Fazer fisioterapia e mudar a rotina',
        requirements: [{ type: 'money', min: 8_000 }],
        outcomes: [
          {
            chance: 0.8,
            text: 'Seis meses de fisioterapia e você começou a se mexer de verdade.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 10 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
          {
            chance: 0.2,
            text: 'Você fez as sessões e parou no dia em que a dor passou.',
            effects: [
              { type: 'money', delta: -8_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Tomar remédio e seguir',
        outcomes: [
          {
            chance: 1,
            text: 'Passou. Voltou duas vezes naquele ano.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -7 }],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_friend_dies',
    category: 'relationship',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 40, max: 70 },
      { type: 'relationCount', kind: 'friend', min: 1 },
    ],
    text: 'Um amigo da sua idade morreu de repente. Você foi o primeiro velório assim.',
    options: [
      {
        text: 'Repensar a própria vida',
        outcomes: [
          {
            chance: 0.65,
            text: 'Você mudou coisas naquele mês que vinha adiando há dez anos.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
          {
            chance: 0.35,
            text: 'Você repensou tudo por duas semanas e voltou exatamente ao mesmo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -12 }],
          },
        ],
      },
      {
        text: 'Procurar quem ficou',
        outcomes: [
          {
            chance: 1,
            text: 'Você ligou para todo mundo que não via há anos. Alguns atenderam.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 22 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_parent_moves_in',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 42, max: 65 },
      {
        type: 'anyOf',
        conditions: [
          { type: 'hasRelation', kind: 'mother' },
          { type: 'hasRelation', kind: 'father' },
        ],
      },
    ],
    text: 'Seu pai ou sua mãe não consegue mais morar sozinho.',
    options: [
      {
        text: 'Trazer para a sua casa',
        outcomes: [
          {
            chance: 0.55,
            text: 'Foi apertado e foi certo. Vocês conversaram mais em dois anos que em vinte.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 30 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 30 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'money', delta: -30_000 },
            ],
          },
          {
            chance: 0.45,
            text: 'A casa não aguentou. Todo mundo brigou com todo mundo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -16 },
              { type: 'money', delta: -30_000 },
            ],
          },
        ],
      },
      {
        text: 'Pagar uma casa de repouso boa',
        requirements: [{ type: 'money', min: 150_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou o melhor lugar que achou e visitou nos domingos.',
            effects: [
              { type: 'money', delta: -150_000 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_career_ceiling',
    category: 'career',
    weight: 11,
    cooldown: 7,
    conditions: [
      { type: 'age', min: 38, max: 58 },
      { type: 'hasCareer', value: true },
      { type: 'careerLevel', max: 2 },
    ],
    text: 'Ficou claro que você não vai subir mais aqui. Nem no ano que vem, nem nunca.',
    options: [
      {
        text: 'Recomeçar em outro lugar',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.4 },
            text: 'Você recomeçou e o teto lá era mais alto.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você recomeçou e o teto lá era exatamente o mesmo, um ano depois.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar e ir levando',
        outcomes: [
          {
            chance: 1,
            text: 'Você aceitou. Parou de trabalhar de noite e passou a ver os filhos.',
            effects: [
              { type: 'performance', delta: -8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_affair',
    category: 'relationship',
    weight: 10,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 32, max: 60 },
      { type: 'hasRelation', kind: 'spouse' },
      { type: 'relationLevel', kind: 'spouse', max: 50 },
    ],
    text: 'Alguém no trabalho deixou claro que está interessado, e você não desconversou na hora.',
    options: [
      {
        text: 'Ir adiante',
        outcomes: [
          {
            chance: 0.4,
            text: 'Durou meses e ninguém descobriu. Você mudou do mesmo jeito.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.6,
            text: 'Descobriram. Não teve conversa que salvasse.',
            effects: [
              { type: 'removeRelation', target: { by: 'kind', kind: 'spouse' } },
              { type: 'flag', flag: 'married', value: false },
              { type: 'money', delta: -200_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -22 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Cortar na hora e contar em casa',
        outcomes: [
          {
            chance: 0.6,
            text: 'Contar foi horrível e foi o que salvou o casamento.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: 25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Contar não salvou nada. Só antecipou.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'spouse' }, delta: -30 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Cortar e não falar nada',
        outcomes: [
          {
            chance: 1,
            text: 'Você cortou e engoliu. Nunca contou para ninguém.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_sandwich_squeeze',
    category: 'health',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 40, max: 58 },
      { type: 'hasRelation', kind: 'child' },
      {
        type: 'anyOf',
        conditions: [
          { type: 'hasRelation', kind: 'mother' },
          { type: 'hasRelation', kind: 'father' },
        ],
      },
    ],
    text: 'Você está cuidando dos seus pais e dos seus filhos ao mesmo tempo, e trabalhando entre uma coisa e outra.',
    options: [
      {
        text: 'Aguentar tudo',
        outcomes: [
          {
            chance: 1,
            text: 'Você aguentou. Ninguém percebeu o quanto custou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 10 },
            ],
          },
        ],
      },
      {
        text: 'Pedir ajuda aos irmãos',
        requirements: [{ type: 'hasRelation', kind: 'sibling' }],
        outcomes: [
          {
            chance: 0.55,
            text: 'Eles dividiram. Devia ter sido assim desde o começo.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: 12 },
            ],
          },
          {
            chance: 0.45,
            text: 'Cada um tinha um motivo. Continuou tudo com você.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'sibling' }, delta: -25 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Contratar ajuda',
        requirements: [{ type: 'money', min: 60_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você pagou por tempo, que é a coisa mais cara que existe.',
            effects: [
              { type: 'money', delta: -60_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: 5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_side_project',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 30, max: 58 },
      { type: 'stat', stat: 'intelligence', min: 50 },
    ],
    text: 'Você teve uma ideia boa o bastante para tirar seu sono. Não é a sua área.',
    options: [
      {
        text: 'Tocar nas madrugadas',
        outcomes: [
          {
            chance: 0.3,
            bias: { luck: 0.5 },
            text: 'A ideia virou coisa. Pequena, mas coisa.',
            effects: [
              { type: 'money', delta: 120_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
          {
            chance: 0.7,
            text: 'Você perdeu dois anos de sono e a ideia morreu num arquivo.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 5 },
            ],
          },
        ],
      },
      {
        text: 'Largar tudo e ir atrás',
        requirements: [{ type: 'money', min: 100_000 }],
        outcomes: [
          {
            chance: 0.35,
            bias: { luck: 0.5 },
            text: 'Deu certo. Você não voltou para o que fazia antes.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'money', delta: 400_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 22 },
            ],
          },
          {
            chance: 0.65,
            text: 'Não deu. Você queimou a reserva e voltou atrás.',
            effects: [
              { type: 'money', delta: -100_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
            ],
          },
        ],
      },
      {
        text: 'Anotar e esquecer',
        outcomes: [
          {
            chance: 1,
            text: 'Você anotou num caderno. Anos depois viu alguém fazendo aquilo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'mid_move_country',
    category: 'random',
    weight: 8,
    once: true,
    conditions: [
      { type: 'age', min: 30, max: 52 },
      { type: 'money', min: 80_000 },
    ],
    text: 'Apareceu uma chance de recomeçar em outro país.',
    options: [
      {
        text: 'Ir',
        outcomes: [
          {
            chance: 0.5,
            bias: { luck: 0.4 },
            text: 'Deu certo. Foi difícil por três anos e valeu pelos trinta seguintes.',
            effects: [
              { type: 'money', delta: -80_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 18 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 8 },
              { type: 'career', action: 'quit' },
            ],
          },
          {
            chance: 0.5,
            text: 'Você não se adaptou e voltou depois de dois anos, sem nada.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -16 },
              { type: 'career', action: 'quit' },
            ],
          },
        ],
      },
      {
        text: 'Ficar',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. Pensa naquilo toda vez que a vida aperta.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
    ],
  },
]
