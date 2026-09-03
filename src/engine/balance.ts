// Todo numero magico do jogo mora aqui. Balancear = editar um arquivo.

import type { SocialClass, StatKey } from './types'

export const STAT_MIN = 0
export const STAT_MAX = 100

export const MAX_AGE = 110

/** Eventos sorteados por turno. */
export const EVENTS_PER_TURN = { min: 1, max: 3 } as const

// --- Morte -----------------------------------------------------------------

/** Gompertz: chance base de morrer no ano, so pela idade. ~18%/ano aos 80. */
export const MORTALITY_BASE = 0.0002
export const MORTALITY_GROWTH = 0.085

/** Multiplicador por saude: 0.4x com saude 100, 1x com 50, 2x com 0. */
export const MORTALITY_HEALTH_MIN_MULT = 0.4
export const MORTALITY_HEALTH_MAX_MULT = 2.0

export const DEATH_CAUSES_BY_AGE: readonly { maxAge: number; causes: readonly string[] }[] = [
  { maxAge: 12, causes: ['doença na infância', 'acidente doméstico'] },
  { maxAge: 29, causes: ['acidente de trânsito', 'acidente', 'violência urbana'] },
  { maxAge: 59, causes: ['infarto', 'câncer', 'acidente', 'complicações de saúde'] },
  { maxAge: Infinity, causes: ['causas naturais', 'infarto', 'AVC', 'complicações de saúde'] },
]

export const DEATH_CAUSE_POOR_HEALTH = 'saúde debilitada'
export const DEATH_CAUSE_OLD_AGE = 'velhice'

// --- Envelhecimento --------------------------------------------------------

/**
 * Saude nao so decai: ela converge para um teto que a idade vai baixando.
 * Corpo jovem se recupera de porrada, corpo velho nao. Sem essa reversao a
 * saude vira um recurso que so drena e todo mundo morre na adolescencia.
 */
export const HEALTH_PEAK_AGE = 25
/** Queda anual do teto de saude depois do pico. */
export const HEALTH_BASELINE_DECLINE = 1.05
/** Fracao da distancia ate o teto percorrida por ano. */
export const HEALTH_RECOVERY_RATE = 0.18

/** Felicidade regride a media com esta fracao por ano. */
export const HAPPINESS_MEAN_REVERSION = 0.08
export const HAPPINESS_MEAN = 50

/** Aparencia cai devagar depois desta idade. */
export const LOOKS_DECAY_START_AGE = 35
export const LOOKS_DECAY_FACTOR = 0.045

/** Inteligencia cresce sozinha durante a escola. */
export const INTELLIGENCE_SCHOOL_AGES = { min: 6, max: 17 } as const
export const INTELLIGENCE_SCHOOL_GAIN = { min: 0, max: 2 } as const

// --- Educacao --------------------------------------------------------------

export const AGE_ELEMENTARY_DONE = 14
export const AGE_HIGHSCHOOL_DONE = 18
/** Ensino medio exige um minimo de inteligencia; abaixo disso, o personagem para. */
export const HIGHSCHOOL_MIN_INTELLIGENCE = 25

// --- Economia (Fase 1: mesada / custo de vida por classe) -------------------

export const AGE_FINANCIALLY_INDEPENDENT = 18

export interface ClassProfile {
  label: string
  /** Renda anual liquida antes da independencia (mesada da familia). */
  allowance: number
  /** Renda anual base depois dos 18, sem carreira: bico, informalidade. */
  baseIncome: number
  /** Custo de vida anual depois dos 18. */
  costOfLiving: number
  startingMoney: number
  /** Deslocamento aplicado aos stats iniciais. */
  statBias: Partial<Record<StatKey, number>>
  weight: number
}

export const CLASS_PROFILES: Record<SocialClass, ClassProfile> = {
  poor: {
    label: 'classe baixa',
    allowance: 300,
    baseIncome: 16_000,
    costOfLiving: 14_000,
    startingMoney: 0,
    statBias: { health: -8, intelligence: -5, happiness: -4 },
    weight: 25,
  },
  lowerMiddle: {
    label: 'classe média baixa',
    allowance: 900,
    baseIncome: 26_000,
    costOfLiving: 22_000,
    startingMoney: 500,
    statBias: { health: -3, intelligence: -1 },
    weight: 33,
  },
  middle: {
    label: 'classe média',
    allowance: 2_400,
    baseIncome: 42_000,
    costOfLiving: 35_000,
    startingMoney: 2_000,
    statBias: {},
    weight: 25,
  },
  upperMiddle: {
    label: 'classe média alta',
    allowance: 6_000,
    baseIncome: 70_000,
    costOfLiving: 58_000,
    startingMoney: 12_000,
    statBias: { health: 4, intelligence: 5, looks: 3 },
    weight: 13,
  },
  rich: {
    label: 'classe alta',
    allowance: 18_000,
    baseIncome: 140_000,
    costOfLiving: 110_000,
    startingMoney: 80_000,
    statBias: { health: 8, intelligence: 6, looks: 6, reputation: 8 },
    weight: 4,
  },
}

/**
 * Juros anuais sobre divida nao paga. A 12% compostos por 50 anos um
 * financiamento estudantil de 90 mil vira 26 milhoes — numero grande demais
 * para significar qualquer coisa. O teto existe porque, na vida real, divida
 * dessa idade e renegociada ou prescreve; modelar isso direito e Fase 2.
 */
export const DEBT_INTEREST_RATE = 0.06
export const DEBT_CEILING = 400_000

// --- Geracao do personagem -------------------------------------------------

/** Stats iniciais: media de 3 rolagens 0..100, puxando pro centro. */
export const STAT_ROLLS = 3

export const SIBLING_COUNT = { min: 0, max: 3 } as const
/** Quem ja existe quando voce nasce e, por definicao, mais velho que voce. */
export const SIBLING_AGE_AT_BIRTH = { min: 1, max: 12 } as const
/**
 * Idade minima de um pai no nascimento do PRIMEIRO filho. Sem isso o sorteio
 * produz uma mae de 19 com uma filha de 12 — coisa que o jogador le lado a
 * lado na aba Relacoes.
 */
export const PARENT_MIN_AGE_AT_FIRST_CHILD = 16
export const PARENT_AGE_AT_BIRTH = { min: 19, max: 42 } as const
export const INITIAL_RELATION = { min: 55, max: 90 } as const

/**
 * Relacoes ignoradas decaem sozinhas todo ano — mas so ate um piso. Na Fase 1
 * o jogador nao tem NENHUMA acao para cuidar de alguem, entao deixar tudo
 * chegar a zero seria punicao sem agencia. O piso sai quando a aba Relacoes
 * ganhar acoes, na Fase 3.
 */
export const RELATION_ANNUAL_DECAY = 1
export const RELATION_DECAY_FLOOR = 30
