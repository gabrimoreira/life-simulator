// Adolescência: 13 a 17 anos. As primeiras escolhas que deixam marca.

import type { GameEvent } from '../../engine/types'

export const SCHOOL_EVENTS: GameEvent[] = [
  {
    id: 'school_first_crush',
    category: 'relationship',
    weight: 11,
    once: true,
    conditions: [{ type: 'age', min: 13, max: 17 }],
    text: 'Tem alguém na sua sala que você não consegue parar de olhar. E hoje essa pessoa sentou do seu lado.',
    options: [
      {
        text: 'Puxar assunto',
        requirements: [{ type: 'stat', stat: 'charisma', min: 35 }],
        outcomes: [
          {
            chance: 0.55,
            luckBias: 0.6,
            text: 'Vocês conversaram até o sinal bater. Combinaram de sair no sábado.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 14 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
              { type: 'addRelation', kind: 'partner' },
            ],
          },
          {
            chance: 0.45,
            text: 'Você travou no meio da frase. A conversa morreu ali.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 2 },
            ],
          },
        ],
      },
      {
        text: 'Escrever um bilhete',
        outcomes: [
          {
            chance: 0.4,
            luckBias: 0.5,
            text: 'O bilhete chegou. A resposta veio na aula seguinte, e era sim.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'addRelation', kind: 'partner' },
            ],
          },
          {
            chance: 0.6,
            text: 'O bilhete circulou pela sala inteira antes de chegar. Foi humilhante.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Não fazer nada',
        outcomes: [
          {
            chance: 1,
            text: 'Você passou o ano inteiro ensaiando a conversa na sua cabeça. Nunca aconteceu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'school_cheating',
    category: 'school',
    weight: 9,
    cooldown: 2,
    conditions: [{ type: 'age', min: 14, max: 17 }],
    text: 'A prova de matemática é amanhã e você não estudou nada. Um colega ofereceu a cola.',
    options: [
      {
        text: 'Colar',
        outcomes: [
          {
            chance: 0.65,
            luckBias: 0.7,
            text: 'Deu certo. Você tirou nota boa e ninguém desconfiou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 4 }],
          },
          {
            chance: 0.35,
            text: 'A professora viu. Você levou zero e foi chamad{o} na coordenação.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -10 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'flag', flag: 'caught_cheating', value: true },
            ],
          },
        ],
      },
      {
        text: 'Virar a noite estudando',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você foi mal do mesmo jeito, mas entendeu a matéria pela primeira vez.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 6 },
              { type: 'stat', stat: 'health', op: 'delta', value: -3 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você virou a noite e gabaritou. Nem você acreditou.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
              { type: 'stat', stat: 'health', op: 'delta', value: -2 },
            ],
          },
        ],
      },
      {
        text: 'Entregar em branco',
        outcomes: [
          {
            chance: 1,
            text: 'Você entregou em branco e foi embora. A escola ligou para {mother}.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -10 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -5 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'school_house_party',
    category: 'relationship',
    weight: 10,
    cooldown: 2,
    conditions: [{ type: 'age', min: 15, max: 17 }],
    text: 'Festa na casa de alguém cujos pais viajaram. Todo mundo da escola vai estar lá.',
    options: [
      {
        text: 'Ir e ficar até o fim',
        outcomes: [
          {
            chance: 0.55,
            luckBias: 0.5,
            text: 'Foi a melhor noite do ano. Você voltou de manhã com dois amigos novos.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 6 },
              { type: 'addRelation', kind: 'friend' },
            ],
          },
          {
            chance: 0.3,
            text: 'A polícia acabou com a festa às duas da manhã. Você foi buscad{o} por {father}.',
            effects: [
              { type: 'relation', target: { by: 'kind', kind: 'father' }, delta: -12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -4 },
            ],
          },
          {
            chance: 0.15,
            text: 'Você bebeu muito mais do que devia e passou mal a noite inteira.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -8 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Dar uma passada rápida',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou uma hora, cumprimentou quem precisava e foi embora antes de complicar.',
            effects: [{ type: 'stat', stat: 'charisma', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Não ir',
        outcomes: [
          {
            chance: 1,
            text: 'Na segunda-feira todo mundo comentava a festa. Você não tinha o que dizer.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -5 }],
          },
        ],
      },
    ],
  },

  {
    id: 'school_first_gig',
    category: 'career',
    weight: 10,
    conditions: [
      { type: 'age', min: 16, max: 17 },
      { type: 'flag', flag: 'had_first_gig', value: false },
    ],
    text: 'O mercado da esquina está contratando para o caixa. Meio período, salário mínimo, entra na escola do jeito que der.',
    options: [
      {
        text: 'Pegar o emprego',
        outcomes: [
          {
            chance: 0.6,
            text: 'Você trabalhou o ano inteiro. Cansativo, mas o dinheiro é seu.',
            effects: [
              { type: 'money', delta: 9000 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 5 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: -2 },
              { type: 'flag', flag: 'had_first_gig', value: true },
            ],
          },
          {
            chance: 0.4,
            text: 'Você conciliou mal as duas coisas e as notas despencaram.',
            effects: [
              { type: 'money', delta: 9000 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: -6 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
              { type: 'flag', flag: 'had_first_gig', value: true },
            ],
          },
        ],
      },
      {
        text: 'Focar nos estudos',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. Passou o ano estudando de verdade pela primeira vez.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 7 }],
          },
        ],
      },
    ],
  },

  {
    id: 'school_band',
    category: 'school',
    weight: 8,
    once: true,
    conditions: [{ type: 'age', min: 14, max: 17 }],
    text: 'Uns colegas estão montando uma banda e falta alguém. Ninguém ali sabe tocar direito.',
    options: [
      {
        text: 'Entrar na banda',
        outcomes: [
          {
            chance: 0.35,
            luckBias: 0.8,
            text: 'Vocês tocaram na festa junina da escola e o colégio inteiro cantou junto.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 8 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'flag', flag: 'plays_music', value: true },
            ],
          },
          {
            chance: 0.65,
            text: 'A banda ensaiou seis meses e acabou numa briga por causa do nome.',
            effects: [
              { type: 'stat', stat: 'charisma', op: 'delta', value: 3 },
              { type: 'flag', flag: 'plays_music', value: true },
            ],
          },
        ],
      },
      {
        text: 'Passar',
        outcomes: [
          {
            chance: 1,
            text: 'Você preferiu não. A banda acabou em seis meses mesmo.',
            effects: [],
          },
        ],
      },
    ],
  },

  {
    id: 'school_appearance_pressure',
    category: 'health',
    weight: 8,
    cooldown: 3,
    conditions: [{ type: 'age', min: 13, max: 17 }],
    text: 'Você passou a odiar as próprias fotos. Todo mundo na escola parece mais resolvido que você.',
    options: [
      {
        text: 'Começar a treinar',
        outcomes: [
          {
            chance: 0.7,
            text: 'Seis meses de treino e você não se reconhece no espelho. No bom sentido.',
            effects: [
              { type: 'stat', stat: 'looks', op: 'delta', value: 9 },
              { type: 'stat', stat: 'health', op: 'delta', value: 7 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
            ],
          },
          {
            chance: 0.3,
            text: 'Você exagerou, se machucou e parou. Ficou pior do que começou.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Mudar o visual',
        outcomes: [
          {
            chance: 0.6,
            luckBias: 0.4,
            text: 'Corte novo, roupa nova. Funcionou melhor do que você esperava.',
            effects: [
              { type: 'stat', stat: 'looks', op: 'delta', value: 6 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: 4 },
              { type: 'money', delta: -400 },
            ],
          },
          {
            chance: 0.4,
            text: 'O corte ficou horrível e virou piada por dois meses.',
            effects: [
              { type: 'stat', stat: 'looks', op: 'delta', value: -4 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'money', delta: -400 },
            ],
          },
        ],
      },
      {
        text: 'Aceitar e seguir a vida',
        outcomes: [
          {
            chance: 1,
            text: 'Você decidiu que não ia gastar mais energia com isso. Levou anos para valer, mas valeu.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 6 }],
          },
        ],
      },
    ],
  },

  {
    id: 'school_exam_prep',
    category: 'school',
    weight: 14,
    once: true,
    conditions: [
      { type: 'age', min: 17, max: 17 },
      { type: 'education', level: 'elementary', atLeast: true },
    ],
    text: 'O vestibular é no fim do ano. Dá para se preparar de verdade, ou torcer.',
    options: [
      {
        text: 'Fazer cursinho',
        requirements: [{ type: 'money', min: 6000 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você passou o ano no cursinho, das sete às onze, todo dia.',
            effects: [
              { type: 'money', delta: -6000 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 12 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'flag', flag: 'exam_prepped', value: true },
            ],
          },
        ],
      },
      {
        text: 'Estudar sozinh{o} pela internet',
        outcomes: [
          {
            chance: 0.55,
            text: 'Disciplina não faltou. Você aprendeu quase tanto quanto no cursinho.',
            effects: [
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 8 },
              { type: 'flag', flag: 'exam_prepped', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Você começou animad{o} e abandonou em março.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 2 }],
          },
        ],
      },
      {
        text: 'Deixar rolar',
        outcomes: [
          {
            chance: 1,
            text: 'Você não abriu um livro. O ano passou.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 4 }],
          },
        ],
      },
    ],
  },

  {
    id: 'school_group_outcast',
    category: 'relationship',
    weight: 7,
    cooldown: 3,
    conditions: [
      { type: 'age', min: 13, max: 16 },
      { type: 'flag', flag: 'was_bullied', value: true },
    ],
    text: 'O grupo que te excluía a vida toda chamou você para sair. Parece sincero. Ou não.',
    options: [
      {
        text: 'Ir junto',
        outcomes: [
          {
            chance: 0.5,
            luckBias: 0.6,
            text: 'Era sincero. Você entendeu que eles nunca souberam o que estavam fazendo.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 12 },
              { type: 'addRelation', kind: 'friend' },
              { type: 'flag', flag: 'was_bullied', value: false },
            ],
          },
          {
            chance: 0.5,
            text: 'Era pegadinha. Você foi embora sozinh{o}, a pé, no escuro.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -14 },
              { type: 'stat', stat: 'charisma', op: 'delta', value: -3 },
            ],
          },
        ],
      },
      {
        text: 'Recusar sem explicar',
        outcomes: [
          {
            chance: 1,
            text: 'Você disse não e não deu satisfação. Sentiu algo perto de orgulho.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 5 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 3 },
            ],
          },
        ],
      },
    ],
  },
]
