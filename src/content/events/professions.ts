// Medicina, advocacia e engenharia.
//
// Estes eventos são a razão de `careerTrack` existir como condição separada de
// `careerKind`: as três trilhas são todas `kind: 'clt'`, e "plantão de vinte e
// quatro horas" não pode aparecer para um analista de escritório. Antes da
// Fase 5 havia exatamente uma trilha por kind, o que tornava `careerTrack`
// redundante por construção — e ela ficou com zero usos no conteúdo inteiro.

import type { GameEvent } from '../../engine/types'

export const PROFESSION_EVENTS: GameEvent[] = [
  // --- Medicina -------------------------------------------------------------
  {
    id: 'med_first_loss',
    category: 'career',
    weight: 14,
    once: true,
    conditions: [{ type: 'careerTrack', trackId: 'medicina' }],
    text: 'O primeiro paciente que você perde não é o mais grave. É só o primeiro.',
    options: [
      {
        text: 'Procurar ajuda para lidar com isso',
        outcomes: [
          {
            chance: 1,
            text: 'Você falou sobre aquilo com alguém que entendia. Continuou doendo, mas em outro lugar.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -4 },
              { type: 'stat', stat: 'health', op: 'delta', value: 3 },
            ],
          },
        ],
      },
      {
        text: 'Engolir e voltar para o plantão',
        outcomes: [
          {
            chance: 0.55,
            text: 'Você voltou no dia seguinte e não falou com ninguém. Nunca mais falou.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
              { type: 'performance', delta: 8 },
              { type: 'flag', flag: 'chronic_condition', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Você voltou no dia seguinte. Deu para seguir.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -6 },
              { type: 'performance', delta: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'med_double_shift',
    category: 'career',
    weight: 11,
    cooldown: 3,
    conditions: [{ type: 'careerTrack', trackId: 'medicina' }],
    text: 'Ofereceram dobrar o plantão do fim de semana. Paga o dobro e custa o fim de semana.',
    options: [
      {
        text: 'Pegar o plantão',
        outcomes: [
          {
            chance: 1,
            text: 'Você atravessou o sábado e o domingo dentro do hospital.',
            effects: [
              { type: 'money', delta: 22_000 },
              { type: 'performance', delta: 7 },
              { type: 'stat', stat: 'health', op: 'delta', value: -6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -5 },
            ],
          },
        ],
      },
      {
        text: 'Recusar e dormir',
        outcomes: [
          {
            chance: 1,
            text: 'Você dormiu doze horas seguidas e acordou quase gente.',
            effects: [
              { type: 'stat', stat: 'health', op: 'delta', value: 6 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'performance', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'med_private_clinic',
    category: 'career',
    weight: 10,
    once: true,
    conditions: [
      { type: 'careerTrack', trackId: 'medicina' },
      { type: 'careerLevel', min: 2 },
    ],
    text: 'Um colega propõe abrir consultório junto. Sai do hospital ou soma ao que já pesa.',
    options: [
      {
        text: 'Entrar como sócio',
        requirements: [{ type: 'money', min: 120_000 }],
        outcomes: [
          {
            chance: 0.6,
            bias: { luck: 0.3 },
            text: 'O consultório encheu. Você passou a atender de manhã e operar de tarde.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 10 },
              { type: 'performance', delta: 15 },
              { type: 'stat', stat: 'health', op: 'delta', value: -5 },
            ],
          },
          {
            chance: 0.4,
            text: 'A agenda não encheu. Vocês fecharam no segundo ano, e a conta ficou.',
            effects: [
              { type: 'money', delta: -120_000 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -10 },
            ],
          },
        ],
      },
      {
        text: 'Ficar só no hospital',
        outcomes: [
          {
            chance: 1,
            text: 'Você agradeceu e continuou onde estava.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: 2 }],
          },
        ],
      },
    ],
  },

  // --- Advocacia ------------------------------------------------------------
  {
    id: 'law_dirty_client',
    category: 'career',
    weight: 12,
    cooldown: 5,
    conditions: [
      { type: 'careerTrack', trackId: 'direito' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'O cliente paga muito bem e você sabe exatamente por quê.',
    options: [
      {
        text: 'Pegar o caso',
        outcomes: [
          {
            chance: 0.7,
            text: 'Você ganhou, recebeu, e evitou pensar no assunto.',
            effects: [
              { type: 'money', delta: 180_000 },
              { type: 'performance', delta: 12 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -8 },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
          {
            chance: 0.3,
            text: 'O caso virou notícia com o seu nome no meio.',
            effects: [
              { type: 'money', delta: 180_000 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: -22 },
              { type: 'stat', stat: 'fame', op: 'delta', value: 10 },
              { type: 'flag', flag: 'underworld_ties', value: true },
            ],
          },
        ],
      },
      {
        text: 'Recusar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou. O escritório achou estranho; você não.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 6 },
              { type: 'performance', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'law_pro_bono',
    category: 'career',
    weight: 10,
    cooldown: 6,
    conditions: [{ type: 'careerTrack', trackId: 'direito' }],
    text: 'Uma família sem dinheiro nenhum procurou o escritório. O caso é bom e não paga nada.',
    options: [
      {
        text: 'Aceitar de graça',
        outcomes: [
          {
            chance: 0.55,
            bias: { luck: 0.4 },
            text: 'Você ganhou, e a história saiu no jornal do jeito certo.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: 16 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: 10 },
              { type: 'flag', flag: 'philanthropist', value: true },
            ],
          },
          {
            chance: 0.45,
            text: 'Você perdeu, depois de meses sem faturar nada com aquilo.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: -8 },
              { type: 'performance', delta: -8 },
            ],
          },
        ],
      },
      {
        text: 'Indicar a defensoria',
        outcomes: [
          {
            chance: 1,
            text: 'Você deu o telefone da defensoria e voltou ao que estava fazendo.',
            effects: [{ type: 'stat', stat: 'happiness', op: 'delta', value: -3 }],
          },
        ],
      },
    ],
  },

  // --- Engenharia -----------------------------------------------------------
  {
    id: 'eng_cut_corner',
    category: 'career',
    weight: 12,
    cooldown: 5,
    conditions: [
      { type: 'careerTrack', trackId: 'engenharia' },
      { type: 'careerLevel', min: 1 },
    ],
    text: 'O cronograma não fecha. Dá para assinar com a margem apertada ou atrasar a obra.',
    options: [
      {
        text: 'Assinar assim mesmo',
        outcomes: [
          {
            chance: 0.75,
            text: 'Ficou de pé, e ninguém perguntou mais nada.',
            effects: [
              { type: 'performance', delta: 14 },
              { type: 'money', delta: 30_000 },
            ],
          },
          {
            chance: 0.25,
            bias: { luck: -0.4 },
            text: 'Deu problema, e a assinatura na planta era a sua.',
            effects: [
              { type: 'stat', stat: 'reputation', op: 'delta', value: -25 },
              { type: 'performance', delta: -20 },
              { type: 'stat', stat: 'happiness', op: 'delta', value: -12 },
            ],
          },
        ],
      },
      {
        text: 'Segurar a obra',
        outcomes: [
          {
            chance: 1,
            text: 'Você segurou a obra três meses. O cliente reclamou e a estrutura ficou certa.',
            effects: [
              { type: 'performance', delta: -6 },
              { type: 'stat', stat: 'reputation', op: 'delta', value: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'eng_abroad_offer',
    category: 'career',
    weight: 10,
    once: true,
    conditions: [
      { type: 'careerTrack', trackId: 'engenharia' },
      { type: 'careerLevel', min: 2 },
      { type: 'age', min: 26, max: 45 },
    ],
    text: 'Uma proposta para tocar um projeto fora do país. Paga em outra moeda e leva você junto.',
    options: [
      {
        text: 'Ir',
        outcomes: [
          {
            chance: 1,
            text: 'Você foi. Ganhou muito mais e viu muito menos as pessoas daqui.',
            effects: [
              { type: 'money', delta: 260_000 },
              { type: 'performance', delta: 18 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: -20 },
              { type: 'relation', target: { by: 'kind', kind: 'friend' }, delta: -25 },
              { type: 'flag', flag: 'lives_alone', value: true },
            ],
          },
        ],
      },
      {
        text: 'Ficar',
        outcomes: [
          {
            chance: 1,
            text: 'Você recusou e ficou perto de quem já estava perto.',
            effects: [
              { type: 'stat', stat: 'happiness', op: 'delta', value: 6 },
              { type: 'relation', target: { by: 'kind', kind: 'mother' }, delta: 8 },
            ],
          },
        ],
      },
    ],
  },
]
