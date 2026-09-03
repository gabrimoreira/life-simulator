// Trilhas de carreira. Dados puros: níveis, salários e requisitos.
//
// Trocar de trilha é permitido e custa todo o progresso — a decisão é
// interessante justamente por isso, não porque o jogo pune.

import type { CareerTrack } from '../engine/types'

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'clt',
    name: 'Corporativo',
    kind: 'clt',
    entryLabel: 'Procurar emprego com carteira assinada',
    entryHint: 'Renda previsível. Promoção depende de desempenho, tempo e carisma.',
    levels: [
      {
        title: 'Estagiário',
        salary: 30_000,
        minYears: 0,
        requirements: [
          { type: 'age', min: 17 },
          { type: 'education', level: 'highschool', atLeast: true },
        ],
      },
      {
        title: 'Analista júnior',
        salary: 52_000,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'intelligence', min: 40 }],
      },
      {
        title: 'Analista pleno',
        salary: 78_000,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 55 },
          { type: 'performance', min: 45 },
        ],
      },
      {
        title: 'Analista sênior',
        salary: 125_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'intelligence', min: 65 },
          { type: 'performance', min: 55 },
          { type: 'education', level: 'bachelor', atLeast: true },
        ],
      },
      {
        title: 'Gerente',
        salary: 210_000,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 60 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Diretor',
        salary: 380_000,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 72 },
          { type: 'stat', stat: 'reputation', min: 55 },
          { type: 'performance', min: 75 },
        ],
      },
    ],
  },

  {
    id: 'business',
    name: 'Empresário',
    kind: 'business',
    entryLabel: 'Abrir o próprio negócio',
    entryHint: 'Renda alta e volátil. Ano ruim é prejuízo de verdade, e falência existe.',
    levels: [
      {
        title: 'Autônomo',
        salary: 32_000,
        volatility: 0.55,
        minYears: 0,
        requirements: [
          { type: 'age', min: 18 },
          { type: 'money', min: 5_000 },
        ],
      },
      {
        title: 'MEI com ponto fixo',
        salary: 72_000,
        volatility: 0.6,
        minYears: 2,
        requirements: [{ type: 'stat', stat: 'charisma', min: 45 }],
      },
      {
        title: 'Pequena empresa',
        salary: 155_000,
        volatility: 0.7,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 55 },
          { type: 'performance', min: 50 },
        ],
      },
      {
        title: 'Empresa média',
        salary: 340_000,
        volatility: 0.8,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 65 },
          { type: 'stat', stat: 'intelligence', min: 60 },
          { type: 'performance', min: 60 },
        ],
      },
      {
        title: 'Grupo empresarial',
        salary: 820_000,
        volatility: 0.85,
        minYears: 5,
        requirements: [
          { type: 'stat', stat: 'charisma', min: 75 },
          { type: 'stat', stat: 'reputation', min: 60 },
          { type: 'performance', min: 72 },
        ],
      },
    ],
  },

  {
    id: 'celebrity',
    name: 'Celebridade',
    kind: 'celebrity',
    entryLabel: 'Tentar viver de holofote',
    entryHint: 'Fama vira dinheiro. Escândalo derruba tudo, e quase ninguém chega ao topo.',
    annualEffects: [{ type: 'stat', stat: 'fame', op: 'delta', value: 3 }],
    levels: [
      {
        title: 'Criador de conteúdo',
        salary: 14_000,
        volatility: 0.7,
        minYears: 0,
        requirements: [{ type: 'age', min: 15 }],
      },
      {
        title: 'Nome conhecido',
        salary: 70_000,
        volatility: 0.7,
        minYears: 2,
        requirements: [
          { type: 'stat', stat: 'fame', min: 25 },
          { type: 'stat', stat: 'charisma', min: 50 },
        ],
      },
      {
        title: 'Artista nacional',
        salary: 280_000,
        volatility: 0.75,
        minYears: 3,
        requirements: [
          { type: 'stat', stat: 'fame', min: 50 },
          { type: 'stat', stat: 'looks', min: 55 },
          { type: 'performance', min: 55 },
        ],
      },
      {
        title: 'Celebridade',
        salary: 900_000,
        volatility: 0.8,
        minYears: 4,
        requirements: [
          { type: 'stat', stat: 'fame', min: 72 },
          { type: 'stat', stat: 'reputation', min: 50 },
          { type: 'performance', min: 65 },
        ],
      },
      {
        title: 'Ícone',
        salary: 2_400_000,
        volatility: 0.85,
        minYears: 6,
        requirements: [
          { type: 'stat', stat: 'fame', min: 88 },
          { type: 'stat', stat: 'reputation', min: 65 },
          { type: 'performance', min: 78 },
        ],
      },
    ],
  },
]
