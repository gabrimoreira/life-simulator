// Dos catorze aos trinta. A faixa tinha metade da densidade da vida adulta,
// e é justamente onde as escolhas ainda mudam tudo o que vem depois.

import type { GameEvent } from '../../engine/types'

export const YOUNG_EVENTS: GameEvent[] = [
  {
    id: 'young_first_car',
    category: 'random',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 28 },
      { type: 'not', condition: { type: 'ownsAsset', kind: 'vehicle' } },
    ],
    text: 'Um primo está vendendo o carro dele barato. Barato tem motivo.',
    options: [
      {
        text: 'Comprar mesmo assim',
        requirements: [{ type: 'money', min: 55_000 }],
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.4 },
            text: 'Rodou cinco anos sem dar problema. Liberdade tem preço e você pagou pouco.',
            effects: [
              { type: 'asset', action: 'buy', assetId: 'car_popular' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.45,
            text: 'O motivo apareceu no terceiro mês, e custou metade do que você pagou.',
            effects: [
              { type: 'asset', action: 'buy', assetId: 'car_popular' },
              { type: 'money', delta: -18_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Continuar de ônibus',
        outcomes: [
          {
            chance: 1,
            text: 'Você continuou de ônibus e guardou o dinheiro.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_roommate_debt',
    category: 'relationship',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 19, max: 32 },
      { type: 'flag', flag: 'lives_alone', value: true },
    ],
    text: 'Seu colega de apartamento sumiu devendo três meses de aluguel.',
    options: [
      {
        text: 'Cobrir e cobrar depois',
        outcomes: [
          {
            chance: 0.3,
            text: 'Ele pagou. Demorou um ano, mas pagou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
          {
            chance: 0.7,
            text: 'Ele nunca pagou e bloqueou você em tudo.',
            effects: [
              { type: 'money', delta: -9_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Entregar as chaves e sair também',
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu junto e voltou para a casa dos seus pais por um tempo.',
            effects: [
              { type: 'flag', flag: 'lives_alone', value: false },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'young_internship_choice',
    category: 'career',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 26 },
      { type: 'enrolled', value: true },
    ],
    text: 'Apareceu um estágio que paga bem e um que ensina. Não dá para os dois.',
    options: [
      {
        text: 'O que paga',
        outcomes: [
          {
            chance: 1,
            text: 'Você ganhou dinheiro e passou dois anos tirando xerox.',
            effects: [
              { type: 'money', delta: 30_000 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: -2 },
            ],
          },
        ],
      },
      {
        text: 'O que ensina',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você aprendeu mais ali do que em três semestres.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 12 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
            ],
          },
          {
            chance: 0.3,
            text: 'Prometeram muito e te deixaram numa sala sozinho.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_credit_card',
    category: 'random',
    weight: 11,
    cooldown: 6,
    conditions: [{ type: 'age', min: 18, max: 32 }],
    text: 'Aprovaram um limite de cartão maior do que você ganha em três meses.',
    options: [
      {
        text: 'Usar tudo',
        outcomes: [
          {
            chance: 0.35,
            text: 'Você comprou o que queria e conseguiu pagar. Passou perto.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'money', delta: -20_000 },
            ],
          },
          {
            chance: 0.65,
            text: 'A fatura virou bola de neve e o rotativo comeu você vivo.',
            effects: [
              { type: 'debt', delta: 45_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Pedir para reduzir o limite',
        outcomes: [
          {
            chance: 1,
            text: 'Você ligou e pediu um limite menor. O atendente estranhou.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_teen_body',
    category: 'health',
    weight: 10,
    cooldown: 4,
    conditions: [
      { type: 'age', min: 14, max: 22 },
      { type: 'stat', stat: 'happiness', max: 55 },
    ],
    text: 'Você passou a comparar o seu corpo com o de todo mundo, o tempo todo.',
    options: [
      {
        text: 'Procurar ajuda',
        outcomes: [
          {
            chance: 0.75,
            text: 'Falar com alguém tirou aquilo do centro da sua cabeça.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'health', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.25,
            text: 'Você tentou falar e não conseguiu explicar direito.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -4 }],
          },
        ],
      },
      {
        text: 'Cortar comida',
        outcomes: [
          {
            chance: 1,
            text: 'Você emagreceu e a comparação continuou exatamente igual.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -12 },
              { type: 'stat', stat: 'looks', op: 'delta', value: 4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Sair das redes por um tempo',
        outcomes: [
          {
            chance: 1,
            text: 'Duas semanas sem olhar. Ajudou mais do que você esperava.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 9 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_travel',
    category: 'random',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 18, max: 30 },
      { type: 'money', min: 12_000 },
    ],
    text: 'Um grupo está fechando uma viagem longa. Vai custar tudo o que você juntou.',
    options: [
      {
        text: 'Ir',
        outcomes: [
          {
            chance: 0.75,
            text: 'Foi a melhor coisa que você fez com aquele dinheiro.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 18 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 6 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.25,
            text: 'Você brigou com metade do grupo no quinto dia.',
            effects: [
              { type: 'money', delta: -12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Guardar',
        outcomes: [
          {
            chance: 1,
            text: 'Você guardou. Viu as fotos deles por três semanas.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_family_business',
    category: 'career',
    weight: 9,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 30 },
      { type: 'hasCareer', value: false },
      { type: 'hasRelation', kind: 'father' },
    ],
    text: 'Seu pai quer que você entre no negócio da família.',
    options: [
      {
        text: 'Entrar',
        outcomes: [
          {
            chance: 1,
            text: 'Você entrou. É um emprego garantido e um teto conhecido.',
            effects: [
              { type: 'career', action: 'hire', trackId: 'business' },
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: 22 },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Ele não falou nada e falou tudo.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -22 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'young_bad_influence',
    category: 'crime',
    weight: 9,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 15, max: 26 },
      { type: 'relationCount', kind: 'friend', min: 1 },
    ],
    text: 'Seus amigos combinaram uma coisa que passa bem do limite. Estão te esperando.',
    options: [
      {
        text: 'Ir junto',
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.4 },
            text: 'Deu tudo certo e virou a história que vocês contam há vinte anos.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 18 },
            ],
          },
          {
            chance: 0.3,
            text: 'Alguém se machucou feio e a noite acabou no pronto-socorro.',
            effects: [{ type: 'stat', stat: 'health', op: 'delta', value: -14 }],
          },
          {
            chance: 0.15,
            text: 'A polícia pegou todo mundo. Você foi o único menor sem quem chamar.',
            effects: [
              { type: 'flag', flag: 'criminal_record', value: true },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -18 },
            ],
          },
        ],
      },
      {
        text: 'Ficar de fora',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. Passaram meses te chamando de careta.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'young_online_hustle',
    category: 'career',
    weight: 10,
    cooldown: 4,
    conditions: [{ type: 'age', min: 16, max: 30 }],
    text: 'Você começou a postar uma coisa que ninguém mais estava postando.',
    options: [
      {
        text: 'Levar a sério por um ano',
        outcomes: [
          {
            chance: 0.25,
            bias: { luck: 0.6 },
            text: 'Cresceu. Não o suficiente para viver disso, o suficiente para mudar a sua cabeça.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 16 },
              { type: 'money', delta: 15_000 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.75,
            text: 'Ficou em quarenta seguidores, e trinta eram gente que você conhece.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 2 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Postar quando der',
        outcomes: [
          {
            chance: 1,
            text: 'Você postou quando deu, que foi quase nunca.',
            effects: [{ type: 'stat', stat: 'fame', op: 'delta', value: 1 }],
          },
        ],
      },
    ],
  },

  {
    id: 'young_dropout_pressure',
    category: 'school',
    weight: 10,
    cooldown: 3,
    conditions: [
      { type: 'enrolled', value: true },
      { type: 'money', max: 8_000 },
    ],
    text: 'A mensalidade venceu e não tem dinheiro na conta.',
    options: [
      {
        text: 'Pedir ajuda para a família',
        requirements: [
          {
            type: 'anyOf',
            conditions: [
              { type: 'hasRelation', kind: 'mother' },
              { type: 'hasRelation', kind: 'father' },
            ],
          },
        ],
        outcomes: [
          {
            chance: 0.6,
            text: 'Deram um jeito. Você nunca perguntou de onde saiu.',
            effects: [
              { type: 'money', delta: 25_000 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -10 },
            ],
          },
          {
            chance: 0.4,
            text: 'Não tinha de onde tirar. Ninguém conseguiu olhar para ninguém.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -14 }],
          },
        ],
      },
      {
        text: 'Trabalhar de noite para pagar',
        outcomes: [
          {
            chance: 1,
            text: 'Você trabalhou das seis às onze e estudou depois disso.',
            effects: [
              { type: 'money', delta: 20_000 },
              { type: 'stat', stat: 'health', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
        ],
      },
      {
        text: 'Trancar o curso',
        outcomes: [
          {
            chance: 1,
            text: 'Você trancou. Ia voltar no semestre seguinte.',
            effects: [
              { type: 'dropOut' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
    ],
  },
]
