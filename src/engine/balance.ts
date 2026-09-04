// Todo numero magico do jogo mora aqui. Balancear = editar um arquivo.

import type { SocialClass, StatKey } from './types'

export const STAT_MIN = 0
export const STAT_MAX = 100

export const MAX_AGE = 110

/** Pontos de acao por turno. E o que impede o jogador de fazer tudo. */
export const ACTION_POINTS_PER_TURN = 3

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
/** Quem treina com regularidade envelhece mais devagar. */
export const TRAINED_HEALTH_BONUS = 6
/** Condicao cronica: teto de saude menor e conta medica todo ano. */
export const CHRONIC_HEALTH_PENALTY = 12
export const CHRONIC_ANNUAL_COST = 9_000

/** Felicidade regride a media com esta fracao por ano. */
export const HAPPINESS_MEAN_REVERSION = 0.08
export const HAPPINESS_MEAN = 50

/**
 * Abaixo disto o ano conta como ano ruim, e o contador de anos seguidos sobe.
 *
 * O spec pede eventos de crise "se a felicidade zerar por VARIOS turnos", e
 * ate a Fase 6 so existiam dois gates instantaneos de felicidade baixa. Um
 * gate instantaneo dispara no primeiro ano ruim de uma vida boa; a crise que
 * interessa e a que se acumula. Reverter a media (`HAPPINESS_MEAN_REVERSION`)
 * puxa todo mundo de volta para 50, entao ficar abaixo de 30 por anos exige
 * que alguma coisa esteja empurrando para baixo o tempo todo.
 */
export const HAPPINESS_CRISIS_THRESHOLD = 30

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

/** Idade a partir da qual sair de uma carreira conta como aposentadoria. */
export const AGE_RETIREMENT_MIN = 58
/**
 * Fracao do ultimo salario que vira renda vitalicia. Sem isso, aposentar-se
 * jogava a renda para a informalidade e era puro prejuizo — o jogo pedia para
 * o jogador nunca parar de trabalhar.
 */
export const PENSION_RATE = 0.55

export interface ClassProfile {
  label: string
  /** Renda anual liquida antes da independencia (mesada da familia). */
  allowance: number
  /**
   * Renda anual sem carreira nenhuma: bico, informalidade. E de proposito
   * pior que o custo de vida — ficar sem trabalho tem que doer devagar.
   */
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
    baseIncome: 9_000,
    costOfLiving: 14_000,
    startingMoney: 0,
    statBias: { health: -8, intelligence: -5, happiness: -4 },
    weight: 25,
  },
  lowerMiddle: {
    label: 'classe média baixa',
    allowance: 900,
    baseIncome: 14_000,
    costOfLiving: 24_000,
    startingMoney: 500,
    statBias: { health: -3, intelligence: -1 },
    weight: 33,
  },
  middle: {
    label: 'classe média',
    allowance: 2_400,
    baseIncome: 18_000,
    costOfLiving: 36_000,
    startingMoney: 2_000,
    statBias: {},
    weight: 25,
  },
  upperMiddle: {
    label: 'classe média alta',
    allowance: 6_000,
    baseIncome: 26_000,
    costOfLiving: 60_000,
    startingMoney: 12_000,
    statBias: { health: 4, intelligence: 5, looks: 3 },
    weight: 13,
  },
  rich: {
    label: 'classe alta',
    allowance: 18_000,
    baseIncome: 45_000,
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
 * dessa idade e renegociada ou prescreve. Modelar renegociacao de verdade
 * continua fora de escopo: o teto e a aproximacao assumida.
 */
export const DEBT_INTEREST_RATE = 0.06
export const DEBT_CEILING = 400_000
/**
 * Reserva mantida antes de amortizar divida. Ninguem zera a conta para quitar
 * um financiamento, mas tambem ninguem senta em cima de dois milhoes pagando
 * juros de cinquenta mil — que era o que acontecia antes desta regra.
 */
export const DEBT_PAYDOWN_BUFFER_YEARS = 1

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
 * Relacoes ignoradas decaem sozinhas todo ano. O piso que existia na Fase 1
 * caiu junto com o motivo dele: agora o jogador TEM como cuidar de alguem, e
 * ver a barra chegar a zero e a consequencia de nao ter feito nada.
 */
export const RELATION_ANNUAL_DECAY = 2


// --- Carreira ---------------------------------------------------------------

export const PERFORMANCE_START = 50
/** Fracao da distancia ate a baseline percorrida por ano, sem esforco. */
export const PERFORMANCE_DRIFT = 0.15
/** Baseline de desempenho = intelligence * A + charisma * B. */
export const PERFORMANCE_FROM_INTELLIGENCE = 0.6
export const PERFORMANCE_FROM_CHARISMA = 0.4

/**
 * Chance de promocao quando tempo e requisitos ja passaram, e o quanto o
 * desempenho acima de 50 pesa nela.
 *
 * Com 0.16 e 0.5, quem se dedicava ao maximo ainda esperava ~3 anos por
 * promocao ALEM do minimo do nivel — sete anos por degrau, trinta e cinco para
 * chegar ao topo. Na pratica a mediana travava no meio da trilha e "se dedicar
 * ao trabalho" nao pagava. Agora vai de 20% (sem esforco) a ~68% (maximo).
 */
export const PROMOTION_BASE_CHANCE = 0.2
export const PROMOTION_PERFORMANCE_WEIGHT = 1.2

/** Abaixo deste desempenho o emprego comeca a correr risco. */
export const FIRE_PERFORMANCE_THRESHOLD = 20
export const FIRE_CHANCE = 0.3

/**
 * Chance anual de ser preso trabalhando no crime, multiplicada pelo nivel:
 * quanto mais alto, mais exposto. Sem isso o crime era a trilha mais rentavel
 * do jogo e a unica sem mecanismo de ruina — CLT tem demissao, empresario tem
 * falencia, e o crime tinha so eventos.
 */
export const CRIME_JAIL_BASE_CHANCE = 0.045
export const CRIME_JAIL_LEVEL_FACTOR = 0.6
/** Pena sorteada, em anos, escalando com o nivel. */
export const CRIME_SENTENCE_PER_LEVEL = 2

/** Ano em que a receita do negocio fica abaixo desta fracao vira risco real. */
export const BANKRUPTCY_INCOME_RATIO = 0.4
export const BANKRUPTCY_CHANCE = 0.16
/** Falencia deixa divida proporcional ao tamanho do negocio. */
export const BANKRUPTCY_DEBT_RATIO = 0.5

/**
 * Degraus perdidos ao recomecar numa trilha em que voce ja trabalhou. Ser
 * demitido custa caro, mas um ex-diretor nao volta a ser estagiario — a
 * experiencia continua no curriculo.
 */
export const CAREER_RESTART_PENALTY = 2

// --- Custo de vida ----------------------------------------------------------

/**
 * Quem ganha mais gasta mais. O custo de vida e o maior entre o piso da classe
 * social e esta fracao da renda — sem isso, salario alto viraria dinheiro
 * infinito acumulado sem nenhuma decisao no meio.
 */
export const COST_OF_LIVING_INCOME_SHARE = 0.42

/** Comer e ter um teto. Ninguem vive por menos que isto. */
export const SUBSISTENCE_COST = 22_000
/**
 * Teto do padrao de vida herdado, como fracao da renda. Nascer rico te torna
 * caro, mas nao te condena: se a renda nao sustenta o padrao da familia, ele
 * desce ate caber. Sem esse limite, um filho de classe alta com salario de
 * analista ficava no vermelho a vida inteira sem nada que pudesse fazer.
 */
export const INHERITED_LIFESTYLE_CAP = 1.15

/**
 * Estudante vive como estudante: republica, casa dos pais, arroz e feijao.
 * Sem isso, cursar uma faculdade paga enquanto se paga custo de vida cheio
 * com salario de estagiario nao fecha para ninguem.
 */
export const STUDENT_COST_OF_LIVING_SHARE = 0.55

// --- Educacao ---------------------------------------------------------------

/** Chance de largar o curso num ano em que a felicidade esta no chao. */
export const DROPOUT_UNHAPPY_THRESHOLD = 15
export const DROPOUT_CHANCE = 0.25
/** Estudar cansa. */
export const STUDY_HAPPINESS_COST = 2


// --- Ativos -----------------------------------------------------------------

/** Corretagem, imposto, comprador negociando: vender sempre custa. */
export const ASSET_SALE_HAIRCUT = 0.08
/** Piso do valor de um ativo, como fracao do preco de compra. */
export const ASSET_VALUE_FLOOR = 0.05

// --- Relacoes ---------------------------------------------------------------

/** Parentes envelhecem e morrem. Mesma curva de Gompertz, saude media fixa. */
export const RELATIVE_MORTALITY_BASE = 0.00018
export const RELATIVE_MORTALITY_GROWTH = 0.085

/** Perder alguem proximo cobra felicidade proporcional a relacao. */
export const GRIEF_MAX_HAPPINESS_LOSS = 25

// --- Heranca ----------------------------------------------------------------

/** Fatia do patrimonio liquido que passa para os filhos, dividida entre eles. */
export const INHERITANCE_SHARE = 0.7
/**
 * Quanto os stats do pai puxam os do filho. O resto e regressao a media, senao
 * uma linhagem otimizada viraria uma escada infinita de superpessoas.
 */
export const HEIR_STAT_INHERITANCE = 0.45
export const HEIR_STAT_NOISE = 12


// --- Prisao -----------------------------------------------------------------

/** Cada ano preso cobra isto de saude e de felicidade. */
export const PRISON_HEALTH_COST = 5
export const PRISON_HAPPINESS_COST = 12
/** E custa reputacao, uma vez, na entrada. */
export const PRISON_REPUTATION_COST = 30
/** Relacoes esfriam mais rapido com voce preso. */
export const PRISON_RELATION_DECAY = 6
