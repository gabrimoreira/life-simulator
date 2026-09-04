// A trilha política. Reputação é a moeda aqui, e ela some mais rápido do que
// entra.

import type { GameEvent } from '../../engine/types'

export const POLITICS_EVENTS: GameEvent[] = [
  {
    id: 'politics_first_campaign',
    category: 'career',
    weight: 12,
    once: true,
    conditions: [{ type: 'careerKind', kind: 'politics' }],
    text: 'Primeira campanha sua. Dá para fazer com o que você tem, ou com o que te oferecem.',
    options: [
      {
        text: 'Financiar do próprio bolso',
        requirements: [{ type: 'money', min: 120_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você bancou tudo e não deve nada a ninguém. Custou caro.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 14 },
              { type: 'performance', delta: 15 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar os apoios que aparecerem',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você foi bem, e agora tem gente esperando retorno.',
            effects: [
              { type: 'performance', delta: 20 },
              { type: 'flag', flag: 'owes_favors', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Um dos apoiadores era encrenca, e o nome dele veio junto com o seu.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -18 },
              { type: 'flag', flag: 'owes_favors', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'politics_favor_called',
    category: 'career',
    weight: 11,
    cooldown: 5,
    conditions: [
      { type: 'careerKind', kind: 'politics' },
      { type: 'flag', flag: 'owes_favors', value: true },
    ],
    text: 'Cobraram o retorno. O pedido é específico e não é legal.',
    options: [
      {
        text: 'Atender',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ninguém ficou sabendo. Você dormiu mal e continuou no cargo.',
            effects: [
              { type: 'money', delta: 200_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
          {
            chance: 0.4,
            text: 'Alguém ficou sabendo. Virou manchete com o seu nome.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -35 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 20 },
              { type: 'performance', delta: -25 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 0.5,
            text: 'Você recusou e perdeu o apoio. Ganhou uma coisa que não se compra.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 16 },
              { type: 'performance', delta: -15 },
              { type: 'flag', flag: 'owes_favors', value: false },
            ],
          },
          {
            chance: 0.5,
            text: 'Você recusou e vazaram coisas suas na semana seguinte.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -20 },
              { type: 'flag', flag: 'owes_favors', value: false },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'politics_scandal',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'careerKind', kind: 'politics' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Uma reportagem grande está sendo apurada sobre o seu gabinete.',
    options: [
      {
        text: 'Dar entrevista e responder tudo',
        requirements: [{ type: 'stat', stat: 'charisma', min: 60 }],
        outcomes: [
          {
            chance: 0.55,
            luckBias: 0.4,
            text: 'Você respondeu tudo e virou o jogo ao vivo.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.45,
            text: 'Uma pergunta pegou você sem resposta, e foi a única que rodou em todo canal.',
            effects: [
              // `op: 'set'`: escândalo desse tamanho não desconta reputação,
              // ele zera. Um delta de -25 em quem tinha 90 deixava a pessoa
              // com 65, e a reportagem não teria mudado nada.
              { type: 'stat', stat: 'reputation', op: 'set', value: 8 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 25 },
              { type: 'flag', flag: 'public_scandal', value: true },
            ],
          },
        ],
      },
      {
        text: 'Soltar uma nota e sumir',
        outcomes: [
          {
            chance: 1,
            text: 'A nota não convenceu ninguém, mas o assunto morreu em duas semanas.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -10 },
              { type: 'flag', flag: 'public_scandal', value: true },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'politics_public_works',
    category: 'career',
    weight: 10,
    cooldown: 4,
    conditions: [
      { type: 'careerKind', kind: 'politics' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Você tem verba para uma obra e três bairros pedindo. Um deles é onde você cresceu.',
    options: [
      {
        text: 'No bairro que mais precisa',
        outcomes: [
          {
            chance: 0.75,
            text: 'A obra saiu e mudou a vida de muita gente.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 18 },
              { type: 'performance', delta: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
            ],
          },
          {
            chance: 0.25,
            text: 'A obra atrasou dois anos e virou exemplo do que não fazer.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: -14 }],
          },
        ],
      },
      {
        text: 'No bairro que mais dá voto',
        outcomes: [
          {
            chance: 1,
            text: 'Cálculo frio, resultado certo. Você se reelegeu com folga.',
            effects: [
              { type: 'performance', delta: 20 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Onde você cresceu',
        outcomes: [
          {
            chance: 1,
            text: 'Você levou a obra pra casa. Metade achou justo, metade achou favorecimento.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'politics_invited_to_run',
    category: 'career',
    weight: 9,
    once: true,
    conditions: [
      { type: 'hasCareer', value: false },
      { type: 'age', min: 25 },
      { type: 'stat', stat: 'reputation', min: 65 },
      { type: 'not', condition: { type: 'flag', flag: 'criminal_record', value: true } },
    ],
    text: 'Um partido te procurou. Acham que o seu nome pega bem numa chapa.',
    options: [
      {
        text: 'Aceitar e se candidatar',
        outcomes: [
          {
            chance: 1,
            text: 'Você entrou para a política pela porta que quase ninguém usa.',
            effects: [
              { type: 'career', action: 'hire', trackId: 'politics' },
              { type: 'stat', stat: 'fame', op: 'delta', value: 12 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você agradeceu e disse que não era para você.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'politics_scandal_shadow',
    category: 'career',
    weight: 9,
    once: true,
    conditions: [
      { type: 'flag', flag: 'public_scandal', value: true },
      { type: 'age', min: 40 },
    ],
    text: 'A reportagem antiga voltou a circular, agora sem contexto e com o seu nome no título.',
    options: [
      {
        text: 'Enfrentar de novo, em público',
        requirements: [{ type: 'stat', stat: 'charisma', min: 65 }],
        outcomes: [
          {
            chance: 0.5,
            luckBias: 0.4,
            text: 'Dessa vez você tinha resposta pronta, e ela pegou melhor que a acusação.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 20 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Você reabriu o assunto sozinho. Ficou mais duas semanas no ar.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Não dizer nada',
        outcomes: [
          {
            chance: 1,
            text: 'Passou de novo, como tinha passado da primeira vez. Fica sempre.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },
]
