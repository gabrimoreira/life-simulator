// Conquistas. Dados puros: cada uma é um punhado de condições avaliadas no
// fim do turno. Não há gatilho nem contador escondido em lugar nenhum.

import type { Achievement } from '../engine/types'

export const ACHIEVEMENTS: Achievement[] = [
  // --- Dinheiro ------------------------------------------------------------
  {
    id: 'first_hundred_k',
    name: 'Cem mil',
    description: 'Juntou o primeiro patrimônio de verdade.',
    conditions: [{ type: 'netWorth', min: 100_000 }],
  },
  {
    id: 'millionaire',
    name: 'Milionário',
    description: 'Um milhão de patrimônio líquido.',
    conditions: [{ type: 'netWorth', min: 1_000_000 }],
  },
  {
    id: 'ten_million',
    name: 'Dez milhões',
    description: 'A conta parou de fazer sentido.',
    conditions: [{ type: 'netWorth', min: 10_000_000 }],
  },
  {
    id: 'underwater',
    name: 'No vermelho',
    description: 'Deveu mais do que tinha, e por muito.',
    conditions: [{ type: 'netWorth', max: -100_000 }],
  },
  {
    id: 'landlord',
    name: 'Dono do próprio teto',
    description: 'Comprou um imóvel.',
    conditions: [{ type: 'ownsAsset', kind: 'property' }],
  },
  {
    id: 'investor',
    name: 'Investidor',
    description: 'Botou dinheiro para trabalhar.',
    conditions: [{ type: 'ownsAsset', kind: 'investment' }],
  },

  // --- Carreira ------------------------------------------------------------
  {
    id: 'first_job',
    name: 'Carteira assinada',
    description: 'Entrou no primeiro emprego formal.',
    conditions: [{ type: 'careerKind', kind: 'clt' }],
  },
  {
    id: 'director',
    name: 'Diretoria',
    description: 'Chegou ao topo do corporativo.',
    conditions: [
      { type: 'careerKind', kind: 'clt' },
      { type: 'careerLevel', min: 5 },
    ],
  },
  {
    id: 'own_boss',
    name: 'Patrão',
    description: 'Abriu o próprio negócio.',
    conditions: [{ type: 'careerKind', kind: 'business' }],
  },
  {
    id: 'empire',
    name: 'Grupo empresarial',
    description: 'O negócio virou um império.',
    conditions: [
      { type: 'careerKind', kind: 'business' },
      { type: 'careerLevel', min: 4 },
    ],
  },
  {
    id: 'icon',
    name: 'Ícone',
    description: 'Chegou ao topo da fama.',
    conditions: [
      { type: 'careerKind', kind: 'celebrity' },
      { type: 'careerLevel', min: 4 },
    ],
  },
  {
    id: 'governor',
    name: 'Governador',
    description: 'Chegou ao topo da política.',
    conditions: [
      { type: 'careerKind', kind: 'politics' },
      { type: 'careerLevel', min: 4 },
    ],
  },
  {
    id: 'kingpin',
    name: 'Chefão',
    description: 'Chegou ao topo do crime.',
    conditions: [
      { type: 'careerKind', kind: 'crime' },
      { type: 'careerLevel', min: 4 },
    ],
  },
  {
    id: 'full_professor',
    name: 'Titular',
    description: 'Chegou ao topo da academia.',
    conditions: [
      { type: 'careerKind', kind: 'academia' },
      { type: 'careerLevel', min: 3 },
    ],
  },
  {
    id: 'retired_well',
    name: 'Aposentadoria',
    description: 'Parou de trabalhar por decisão própria.',
    conditions: [{ type: 'flag', flag: 'retired', value: true }],
  },

  // --- Educação ------------------------------------------------------------
  {
    id: 'graduate',
    name: 'Diploma',
    description: 'Concluiu uma graduação.',
    conditions: [{ type: 'education', level: 'bachelor', atLeast: true }],
  },
  {
    id: 'postgrad',
    name: 'Pós-graduado',
    description: 'Foi até o fim do que dava para estudar.',
    conditions: [{ type: 'education', level: 'postgrad', atLeast: true }],
  },
  {
    id: 'genius',
    name: 'Cabeça feita',
    description: 'Inteligência no teto.',
    conditions: [{ type: 'stat', stat: 'intelligence', min: 95 }],
  },

  // --- Família -------------------------------------------------------------
  {
    id: 'married',
    name: 'Casado',
    description: 'Alguém disse sim.',
    conditions: [{ type: 'hasRelation', kind: 'spouse' }],
  },
  {
    id: 'parent',
    name: 'Pai ou mãe',
    description: 'Teve um filho.',
    conditions: [{ type: 'hasRelation', kind: 'child' }],
  },
  {
    id: 'big_family',
    name: 'Casa cheia',
    description: 'Quatro filhos vivos ao mesmo tempo.',
    conditions: [{ type: 'relationCount', kind: 'child', min: 4 }],
  },
  {
    id: 'popular',
    name: 'Muitos amigos',
    description: 'Cinco amizades vivas ao mesmo tempo.',
    conditions: [{ type: 'relationCount', kind: 'friend', min: 5 }],
  },
  {
    id: 'devoted',
    name: 'Presente',
    description: 'Manteve uma relação no topo apesar dos anos.',
    conditions: [
      { type: 'age', min: 45 },
      { type: 'relationLevel', kind: 'child', min: 95 },
    ],
  },

  // --- Vida ----------------------------------------------------------------
  {
    id: 'octogenarian',
    name: 'Oitenta anos',
    description: 'Chegou aos oitenta.',
    conditions: [{ type: 'age', min: 80 }],
  },
  {
    id: 'centenarian',
    name: 'Cem anos',
    description: 'Chegou aos cem.',
    conditions: [{ type: 'age', min: 100 }],
  },
  {
    id: 'iron_health',
    name: 'Saúde de ferro',
    description: 'Passou dos sessenta com saúde acima de oitenta.',
    conditions: [
      { type: 'age', min: 60 },
      { type: 'stat', stat: 'health', min: 80 },
    ],
  },
  {
    id: 'content',
    name: 'Em paz',
    description: 'Passou dos setenta feliz.',
    conditions: [
      { type: 'age', min: 70 },
      { type: 'stat', stat: 'happiness', min: 85 },
    ],
  },

  // --- Crime ---------------------------------------------------------------
  {
    id: 'record',
    name: 'Ficha suja',
    description: 'Foi condenado alguma vez.',
    conditions: [{ type: 'flag', flag: 'criminal_record', value: true }],
  },
  {
    id: 'inside',
    name: 'Atrás das grades',
    description: 'Cumpriu pena.',
    conditions: [{ type: 'inPrison', value: true }],
  },
  {
    id: 'redemption',
    name: 'Recomeço',
    description: 'Passou pela cadeia e ainda assim juntou patrimônio.',
    conditions: [
      { type: 'flag', flag: 'criminal_record', value: true },
      { type: 'inPrison', value: false },
      { type: 'netWorth', min: 500_000 },
    ],
  },

  // --- Fama ----------------------------------------------------------------
  {
    id: 'famous',
    name: 'Reconhecido na rua',
    description: 'Fama acima de setenta.',
    conditions: [{ type: 'stat', stat: 'fame', min: 70 }],
  },
  {
    id: 'beloved',
    name: 'Bem falado',
    description: 'Reputação acima de noventa.',
    conditions: [{ type: 'stat', stat: 'reputation', min: 90 }],
  },
]
