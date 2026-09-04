// A trilha acadêmica. Estabilidade, salário baixo e uma moeda que não é
// dinheiro: ter escrito uma coisa que ficou.

import type { GameEvent } from '../../engine/types'

export const ACADEMIA_EVENTS: GameEvent[] = [
  {
    id: 'academia_first_paper',
    category: 'career',
    weight: 12,
    once: true,
    conditions: [{ type: 'careerKind', kind: 'academia' }],
    text: 'Seu primeiro artigo está pronto. Dá para mandar para a revista boa ou para a que aceita.',
    options: [
      {
        text: 'Mandar para a revista boa',
        outcomes: [
          {
            chance: 0.35,
            luckBias: 0.4,
            text: 'Aceito. Um artigo na revista certa vale dez nas outras.',
            effects: [
              { type: 'performance', delta: 25 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 12 },
            ],
          },
          {
            chance: 0.65,
            text: 'Recusado com dois pareceres duros. Você guardou os dois.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
              { type: 'stat', stat: 'intelligence', op: 'delta', value: 4 },
            ],
          },
        ],
      },
      {
        text: 'Mandar para a que aceita',
        outcomes: [
          {
            chance: 1,
            text: 'Publicado. Ninguém leu, mas conta no currículo.',
            effects: [{ type: 'performance', delta: 8 }],
          },
        ],
      },
    ],
  },

  {
    id: 'academia_grant',
    category: 'career',
    weight: 11,
    cooldown: 4,
    conditions: [
      { type: 'careerKind', kind: 'academia' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'Abriu edital de financiamento. Escrever o projeto vai consumir meses.',
    options: [
      {
        text: 'Escrever e submeter',
        outcomes: [
          {
            chance: 0.4,
            luckBias: 0.4,
            text: 'Aprovado. Você montou um laboratório com o dinheiro.',
            effects: [
              { type: 'money', delta: 90_000 },
              { type: 'performance', delta: 18 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
          {
            chance: 0.6,
            text: 'Não aprovado. Foram quatro meses de trabalho num arquivo morto.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'stat', stat: 'health', op: 'delta', value: -4 },
            ],
          },
        ],
      },
      {
        text: 'Deixar passar e dar aula',
        outcomes: [
          {
            chance: 1,
            text: 'Você preferiu a sala de aula. Deu boas aulas naquele semestre.',
            effects: [
              { type: 'performance', delta: 5 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'academia_student_credit',
    category: 'career',
    weight: 10,
    cooldown: 5,
    conditions: [
      { type: 'careerKind', kind: 'academia' },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Um orientando seu fez a descoberta. A assinatura do artigo é uma escolha sua.',
    options: [
      {
        text: 'Deixar o nome dele na frente',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou em segundo. A carreira dele começou por causa disso.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 14 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'performance', delta: 5 },
            ],
          },
        ],
      },
      {
        text: 'Assinar como autor principal',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ninguém contestou. Foi o artigo mais citado da sua vida.',
            effects: [
              { type: 'performance', delta: 22 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
            ],
          },
          {
            chance: 0.4,
            text: 'Ele contou. O departamento inteiro passou a te olhar diferente.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -28 },
              { type: 'performance', delta: -12 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'academia_industry_offer',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [
      { type: 'careerKind', kind: 'academia' },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Uma empresa ofereceu quatro vezes o seu salário para você largar a universidade.',
    options: [
      {
        text: 'Aceitar',
        outcomes: [
          {
            chance: 1,
            text: 'Você trocou a estabilidade pelo dinheiro. Todo mundo entendeu, e ninguém ali fez o mesmo.',
            effects: [
              { type: 'career', action: 'quit' },
              { type: 'money', delta: 200_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
            ],
          },
        ],
      },
      {
        text: 'Ficar',
        outcomes: [
          {
            chance: 1,
            text: 'Você ficou. A conta não fecha e você sabe por que fica.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'performance', delta: 8 },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'academia_back_to_study',
    category: 'school',
    weight: 9,
    cooldown: 8,
    conditions: [
      { type: 'age', min: 28, max: 60 },
      { type: 'education', level: 'bachelor', atLeast: true },
      { type: 'enrolled', value: false },
      { type: 'not', condition: { type: 'education', level: 'postgrad', atLeast: true } },
    ],
    text: 'Um professor antigo perguntou por que você nunca fez o mestrado.',
    options: [
      {
        text: 'Não tenho uma boa resposta',
        outcomes: [
          {
            chance: 1,
            text: 'Você não teve o que responder e ficou pensando nisso.',
            effects: [{ type: 'stat', stat: 'intelligence', op: 'delta', value: 3 }],
          },
        ],
      },
      {
        text: 'Me matricular agora',
        requirements: [{ type: 'stat', stat: 'intelligence', min: 65 }],
        outcomes: [
          {
            chance: 1,
            text: 'Você voltou para a sala de aula, do outro lado da idade média da turma.',
            effects: [
              { type: 'enroll', courseId: 'mestrado' },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },
]
