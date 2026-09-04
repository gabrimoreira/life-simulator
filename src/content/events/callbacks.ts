// Eventos que cobram — ou pagam — uma escolha antiga.
//
// Toda flag escrita pelo conteúdo precisa de alguém que a leia. Sem isso o
// Perfil vira uma vitrine de marcas decorativas: o jogo diz "Ficha suja" e se
// comporta exatamente igual. Este arquivo é onde a memória do jogo cobra.

import type { GameEvent } from '../../engine/types'

export const CALLBACK_EVENTS: GameEvent[] = [
  {
    id: 'callback_record_haunts',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'flag', flag: 'criminal_record', value: true },
    ],
    text: 'Pediram uma certidão de antecedentes. A sua não vem limpa.',
    options: [
      {
        text: 'Contar antes que descubram',
        outcomes: [
          {
            chance: 0.5,
            luckBias: 0.4,
            text: 'A franqueza contou a seu favor. Não resolveu, mas não piorou.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: 4 }],
          },
          {
            chance: 0.5,
            text: 'Agradeceram a sinceridade e escolheram outra pessoa.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Pagar um advogado para tentar limpar',
        requirements: [{ type: 'money', min: 40_000 }],
        outcomes: [
          {
            chance: 0.4,
            luckBias: 0.5,
            text: 'Saiu. Depois de anos, seu nome está limpo de novo.',
            effects: [
              { type: 'money', delta: -40_000 },
              { type: 'flag', flag: 'criminal_record', value: false },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.6,
            text: 'O processo não andou. O dinheiro andou.',
            effects: [{ type: 'money', delta: -40_000 }],
          },
        ],
      },
      {
        text: 'Deixar como está',
        outcomes: [
          {
            chance: 1,
            text: 'Você parou de se candidatar a coisas que pedem certidão.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_old_band',
    category: 'relationship',
    weight: 9,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 30, max: 65 },
      { type: 'flag', flag: 'plays_music', value: true },
    ],
    text: 'O grupo da banda do colégio voltou a apitar. Alguém quer marcar um ensaio.',
    options: [
      {
        text: 'Aparecer no ensaio',
        outcomes: [
          {
            chance: 0.55,
            text: 'Tocar de novo depois de tantos anos foi melhor do que você lembrava.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.45,
            text: 'Ninguém sabia mais tocar, e ficou claro por que a banda acabou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Voltar a tocar sério',
        requirements: [{ type: 'stat', stat: 'charisma', min: 50 }],
        outcomes: [
          {
            chance: 0.3,
            luckBias: 0.6,
            text: 'Vocês começaram a tocar em bar e uma coisa levou à outra.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 14 },
              { type: 'money', delta: 12_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.7,
            text: 'Vocês tocaram em três bares vazios e desistiram.',
            effects: [
              { type: 'money', delta: -6_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
        ],
      },
      {
        text: 'Sair do grupo',
        outcomes: [
          {
            chance: 1,
            text: 'Você saiu do grupo sem responder. Aquilo já tinha passado.',
            effects: [{ type: 'flag', flag: 'plays_music', value: false }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_pet',
    category: 'random',
    weight: 8,
    cooldown: 12,
    conditions: [
      { type: 'age', min: 22 },
      { type: 'flag', flag: 'had_pet', value: true },
    ],
    text: 'Você passou na frente de uma feira de adoção e travou.',
    options: [
      {
        text: 'Adotar de novo',
        requirements: [{ type: 'money', min: 3_000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você levou um pra casa. A casa mudou no mesmo dia.',
            effects: [
              { type: 'money', delta: -3_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Seguir andando',
        outcomes: [
          {
            chance: 1,
            text: 'Você seguiu. Pensou naquilo o resto da semana.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_cheating',
    category: 'career',
    weight: 8,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 24, max: 55 },
      { type: 'flag', flag: 'caught_cheating', value: true },
    ],
    text: 'Um colega de escola virou seu colega de trabalho. Ele lembra da prova.',
    options: [
      {
        text: 'Rir junto',
        outcomes: [
          {
            chance: 0.7,
            text: 'Virou piada interna e morreu ali.',
            effects: [{ type: 'stat', stat: 'charisma', op: 'delta', value: 4 }],
          },
          {
            chance: 0.3,
            text: 'A história circulou e colou em você.',
            effects: [{ type: 'stat', stat: 'reputation', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Negar que aconteceu',
        outcomes: [
          {
            chance: 1,
            text: 'Você negou com firmeza demais. Todo mundo entendeu.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -14 },
              { type: 'performance', delta: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_living_alone',
    category: 'health',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 28, max: 65 },
      { type: 'flag', flag: 'lives_alone', value: true },
      { type: 'not', condition: { type: 'hasRelation', kind: 'spouse' } },
    ],
    text: 'Faz três dias que você não fala com ninguém e só percebeu agora.',
    options: [
      {
        text: 'Ligar para alguém',
        outcomes: [
          {
            chance: 0.8,
            text: 'Vocês conversaram duas horas. Fez mais diferença do que devia.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: 12 },
            ],
          },
          {
            chance: 0.2,
            text: 'Ninguém atendeu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -8 }],
          },
        ],
      },
      {
        text: 'Aproveitar o silêncio',
        outcomes: [
          {
            chance: 1,
            text: 'Você aproveitou. Funciona por um tempo, e depois deixa de funcionar.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_no_children',
    category: 'relationship',
    weight: 8,
    cooldown: 10,
    conditions: [
      { type: 'age', min: 48, max: 75 },
      { type: 'flag', flag: 'chose_no_children', value: true },
    ],
    text: 'Num almoço de família alguém perguntou, de novo, se você não se arrepende.',
    options: [
      {
        text: 'Dizer que não',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você disse não e era verdade. A mesa mudou de assunto.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 8 }],
          },
          {
            chance: 0.25,
            text: 'Você disse não e passou a noite acordado.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -10 }],
          },
        ],
      },
      {
        text: 'Mudar de assunto',
        outcomes: [
          {
            chance: 1,
            text: 'Você desviou. Perguntam de novo todo ano.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_exam_prep',
    category: 'school',
    weight: 11,
    once: true,
    conditions: [
      { type: 'age', min: 18, max: 26 },
      { type: 'flag', flag: 'exam_prepped', value: true },
    ],
    text: 'O cursinho deixou uma coisa que você não esperava: você aprendeu a estudar.',
    options: [
      {
        text: 'Usar isso',
        outcomes: [
          {
            chance: 1,
            text: 'Estudar deixou de ser sofrimento e virou método.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Não pensar mais nisso',
        outcomes: [
          {
            chance: 1,
            text: 'Você fechou os cadernos e não abriu mais.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 3 }],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_retirement_days',
    category: 'health',
    weight: 12,
    cooldown: 5,
    conditions: [
      { type: 'age', min: 60 },
      { type: 'flag', flag: 'retired', value: true },
    ],
    text: 'O dia inteiro é seu e ninguém espera nada de você. Isso pesa mais do que parecia.',
    options: [
      {
        text: 'Arrumar uma ocupação',
        outcomes: [
          {
            chance: 0.75,
            text: 'Você virou voluntário e a semana voltou a ter forma.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
            ],
          },
          {
            chance: 0.25,
            text: 'Você tentou três coisas e não engatou em nenhuma.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
      {
        text: 'Cuidar do corpo enquanto dá',
        outcomes: [
          {
            chance: 1,
            text: 'Caminhada de manhã, médico em dia, comida decente.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 8 },
              { type: 'flag', flag: 'trains_regularly', value: true },
            ],
          },
        ],
      },
      {
        text: 'Deixar os dias passarem',
        outcomes: [
          {
            chance: 1,
            text: 'Os dias passaram. Foram muitos e foram iguais.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'callback_memoir',
    category: 'relationship',
    weight: 10,
    once: true,
    conditions: [
      { type: 'age', min: 72 },
      { type: 'flag', flag: 'wrote_memoir', value: true },
    ],
    text: 'Um neto leu seus cadernos e quer publicar aquilo.',
    options: [
      {
        text: 'Deixar publicar',
        outcomes: [
          {
            chance: 0.6,
            luckBias: 0.4,
            text: 'Virou um livro pequeno que uma cidade inteira leu.',
            effects: [
              { type: 'stat', stat: 'fame', op: 'delta', value: 18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 16 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ninguém leu, mas ficou impresso. Já é mais do que a maioria consegue.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 10 }],
          },
        ],
      },
      {
        text: 'Aquilo era para a família',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse que era da família e ficou na família.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'relation', target: { by: 'kind', kind: 'child' }, delta: 15 },
            ],
          },
        ],
      },
    ],
  },
]
