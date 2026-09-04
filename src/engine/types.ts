// Tipos do motor. Nada aqui importa Vue, e nada aqui contem logica.

export type StatKey =
  | 'health'
  | 'intelligence'
  | 'looks'
  | 'charisma'
  | 'happiness'
  | 'reputation'
  | 'fame'
  | 'luck'

export const STAT_KEYS: readonly StatKey[] = [
  'health',
  'intelligence',
  'looks',
  'charisma',
  'happiness',
  'reputation',
  'fame',
  'luck',
]

/** `luck` fica oculta do jogador: enviesa outcomes, nunca aparece na UI. */
export const VISIBLE_STAT_KEYS: readonly StatKey[] = [
  'health',
  'intelligence',
  'looks',
  'charisma',
  'happiness',
  'reputation',
]

/**
 * Fama so aparece no Perfil acima disso. Todo mundo nasce com 0..5 de fama, e
 * "Fama 2" para um contador e ruido, nao informacao.
 */
export const FAME_VISIBILITY_THRESHOLD = 12

export type EducationLevel = 'none' | 'elementary' | 'highschool' | 'bachelor' | 'postgrad'

/** Ordem importa: `education/atLeast` compara por indice. */
export const EDUCATION_ORDER: readonly EducationLevel[] = [
  'none',
  'elementary',
  'highschool',
  'bachelor',
  'postgrad',
]

/** Posicao na escada de escolaridade. Mora aqui porque a ordem mora aqui. */
export function educationRank(level: EducationLevel): number {
  return EDUCATION_ORDER.indexOf(level)
}

/** O maior entre dois niveis. Escolaridade sobe; nunca desce. */
export function highestEducation(a: EducationLevel, b: EducationLevel): EducationLevel {
  return educationRank(a) >= educationRank(b) ? a : b
}

export type SocialClass = 'poor' | 'lowerMiddle' | 'middle' | 'upperMiddle' | 'rich'

export type Gender = 'male' | 'female'

export type RelationKind = 'mother' | 'father' | 'sibling' | 'friend' | 'partner' | 'spouse' | 'child'

export type CareerKind =
  | 'clt'
  | 'business'
  | 'celebrity'
  | 'crime'
  | 'politics'
  | 'academia'

export interface CareerState {
  trackId: string
  /** Desnormalizado da trilha: evita o avaliador de condicoes ter que carregar
   *  o catalogo inteiro so para saber se voce e CLT ou empresario. */
  kind: CareerKind
  /** Indice do nivel dentro da trilha. */
  level: number
  yearsInLevel: number
  yearsInTrack: number
  /** 0..100. Sobe trabalhando, cai vacilando; e o motor da promocao. */
  performance: number
}

/** Como o curso esta sendo pago. Definido na matricula e nao muda depois. */
export type PaymentMode = 'scholarship' | 'cash' | 'financed'

export interface Enrollment {
  courseId: string
  targetLevel: EducationLevel
  yearsLeft: number
  annualCost: number
  mode: PaymentMode
  /** Se ja precisou recorrer a divida em algum ano. So para exibicao. */
  financed: boolean
}

export interface PrisonState {
  yearsLeft: number
  reason: string
  /** Anos ja cumpridos, para a timeline e as conquistas. */
  yearsServed: number
}

export type ActionGroup =
  | 'health'
  | 'education'
  | 'career'
  | 'assets'
  | 'social'
  | 'crime'

export type AssetKind = 'property' | 'vehicle' | 'investment'

export interface OwnedAsset {
  assetId: string
  /** Desnormalizado do catalogo, como em CareerState: o avaliador de condicoes
   *  nao recebe o ContentPack e nao deve receber. */
  kind: AssetKind
  /** Valor de mercado atual. Muda todo ano. */
  value: number
  boughtYear: number
}

export type EventCategory =
  | 'childhood'
  | 'school'
  | 'career'
  | 'relationship'
  | 'health'
  | 'crime'
  | 'random'

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

export interface Person {
  id: string
  name: string
  kind: RelationKind
  gender: Gender
  age: number
  /** 0..100 */
  relation: number
  alive: boolean
}

export interface Character {
  name: string
  gender: Gender
  birthYear: number
  age: number
  city: string
  uf: string
  socialClass: SocialClass
  stats: Record<StatKey, number>
  /** Dinheiro liquido em BRL. Nunca negativo: falta vira `debt`. */
  money: number
  debt: number
  education: EducationLevel
  /** null = desempregado. Carreira e conteudo; o estado do cargo mora aqui. */
  career: CareerState | null
  /** Nivel mais alto ja alcancado em cada trilha. Sobrevive a demissao. */
  careerHistory: Record<string, number>
  /** Renda anual vitalicia de quem se aposentou. 0 = nunca se aposentou. */
  pension: number
  /**
   * Anos SEGUIDOS com felicidade abaixo de `HAPPINESS_CRISIS_THRESHOLD`.
   *
   * Zera no primeiro ano bom. E a unica memoria de duracao que o jogo tem: as
   * outras condicoes olham o estado do turno, e por isso nao conseguem
   * distinguir um ano ruim de uma decada ruim.
   */
  unhappyYears: number
  /** null = solto. Preso, a vida roda num sub-loop com pool proprio. */
  prison: PrisonState | null
  /** null = nao esta estudando nada agora. */
  enrollment: Enrollment | null
  assets: OwnedAsset[]
  flags: Record<string, boolean>
  alive: boolean
  deathCause: string | null
  deathAge: number | null
}

export interface EffectLog {
  label: string
  text: string
  tone: 'good' | 'bad' | 'neutral'
}

export type TimelineEntry =
  /** Cabecalho do ano. `summary` e a linha de razao (renda/custo), se houver. */
  | { kind: 'year'; year: number; age: number; summary: string | null }
  | {
      kind: 'note'
      year: number
      text: string
      category: EventCategory | null
      effects: EffectLog[]
    }
  | { kind: 'death'; year: number; age: number; cause: string }

export interface ChoiceRecord {
  year: number
  eventId: string
  optionIndex: number
}

export type TurnPhase = 'idle' | 'resolving'

export interface GameState {
  seed: number
  /** Estado serializado do mulberry32. Reproduz a vida inteira junto do `choiceLog`. */
  rngState: number
  year: number
  /** Pontos de acao restantes no turno. Recarregam todo ano. */
  actionPoints: number
  character: Character
  relations: Person[]
  timeline: TimelineEntry[]
  firedEventIds: string[]
  /** Ultimo ano em que cada evento disparou, para respeitar `cooldown`. */
  lastFiredYear: Record<string, number>
  /** Idem para acoes. Namespace separado: ids de acao e de evento nao colidem. */
  lastActionYear: Record<string, number>
  /** Cooldown de acao de relacao, por `<personId>:<actionId>`. */
  lastRelationActionYear: Record<string, number>
  /** Ids de conquistas ja obtidas. */
  achievements: string[]
  choiceLog: ChoiceRecord[]
  pendingEventIds: string[]
  turnPhase: TurnPhase
}

// ---------------------------------------------------------------------------
// Conteudo declarativo
// ---------------------------------------------------------------------------

export type RelationRef =
  | { by: 'kind'; kind: RelationKind }
  | { by: 'id'; id: string }
  /**
   * A pessoa em quem a acao foi disparada. So faz sentido dentro de uma
   * RelationAction; o engine substitui por um ref de id antes de aplicar.
   */
  | { by: 'target' }

export type Condition =
  | { type: 'age'; min?: number; max?: number }
  | { type: 'stat'; stat: StatKey; min?: number; max?: number }
  | { type: 'money'; min?: number; max?: number }
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'gender'; gender: Gender }
  | { type: 'socialClass'; oneOf: SocialClass[] }
  | { type: 'education'; level: EducationLevel; atLeast: boolean }
  | { type: 'hasRelation'; kind: RelationKind }
  | { type: 'hasCareer'; value: boolean }
  | { type: 'careerTrack'; trackId: string }
  /**
   * Se o jogador escolheu uma opcao especifica de um evento especifico.
   *
   * E a unica memoria do jogo que nao e flag booleana. Uma flag responde "isso
   * aconteceu"; esta responde "voce escolheu isto", que e o que permite um
   * callback reagir a decisao em vez de ao resultado — e permite cadeias, ja
   * que o callback tambem e um evento com id e opcoes.
   */
  | { type: 'chose'; eventId: string; optionIndex: number }
  | { type: 'careerKind'; kind: CareerKind }
  | { type: 'careerLevel'; min?: number; max?: number }
  | { type: 'performance'; min?: number; max?: number }
  | { type: 'enrolled'; value: boolean }
  | { type: 'inPrison'; value: boolean }
  /** Anos SEGUIDOS de infelicidade. Ver `Character.unhappyYears`. */
  | { type: 'unhappyYears'; min?: number; max?: number }
  | { type: 'ownsAsset'; assetId?: string; kind?: AssetKind }
  | { type: 'netWorth'; min?: number; max?: number }
  | { type: 'relationLevel'; kind: RelationKind; min?: number; max?: number }
  /**
   * Quantas pessoas daquele tipo estao vivas.
   *
   * `minRelation` restringe a contagem a quem de fato gosta de voce, e existe
   * porque sem ele a condicao nao prendia nada: uma vida acumula ~20 amigos
   * (ninguem nunca sai da lista), e "rede de contatos" virava um gate que todo
   * mundo passa sem fazer nada. Acima de 60 sao ~5; acima de 80, ~1.
   */
  | {
      type: 'relationCount'
      kind: RelationKind
      min?: number
      max?: number
      minRelation?: number
    }
  | { type: 'not'; condition: Condition }
  | { type: 'anyOf'; conditions: Condition[] }

export type Effect =
  | { type: 'stat'; stat: StatKey; op: 'delta' | 'set'; value: number }
  | { type: 'money'; delta: number }
  | { type: 'debt'; delta: number }
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'education'; level: EducationLevel }
  | { type: 'relation'; target: RelationRef; delta: number }
  | { type: 'addRelation'; kind: RelationKind }
  | { type: 'removeRelation'; target: RelationRef }
  | { type: 'career'; action: 'hire' | 'quit' | 'fire' | 'promote'; trackId?: string }
  | { type: 'performance'; delta: number }
  | { type: 'enroll'; courseId: string }
  | { type: 'study' }
  | { type: 'dropOut' }
  | { type: 'actionPoints'; delta: number }
  | { type: 'asset'; action: 'buy' | 'sell'; assetId: string }
  /** Converte uma relacao existente em outro tipo: namorado vira conjuge. */
  | { type: 'relationKind'; target: RelationRef; kind: RelationKind }
  | { type: 'jail'; years: number; reason: string }
  | { type: 'release' }
  | { type: 'death'; cause: string }

export interface Outcome {
  /** 0..1. As chances de um mesmo option somam 1. */
  chance: number
  text: string
  /**
   * Quanto a Sorte enviesa este outcome. Positivo = sorte favorece.
   * chance efetiva = chance * (1 + luckBias * (luck - 50) / 50), renormalizado.
   */
  luckBias?: number
  effects: Effect[]
}

export interface EventOption {
  text: string
  /** Se falhar, a opcao aparece desabilitada com o motivo vindo de `describe()`. */
  requirements?: Condition[]
  outcomes: Outcome[]
}

export interface CareerLevel {
  title: string
  /** Renda anual bruta do nivel. */
  salary: number
  /**
   * Volatilidade da renda, 0..0.95. 0 = salario fixo (CLT). Empresario e
   * celebridade ganham muito mais na media e muito menos nos anos ruins.
   */
  volatility?: number
  /** Para ser promovido A ESTE nivel. No nivel 0, e o requisito de entrada. */
  requirements: Condition[]
  /** Anos minimos no nivel anterior antes da promocao ficar possivel. */
  minYears: number
}

export interface CareerTrack {
  id: string
  name: string
  kind: CareerKind
  /** Como o jogador entra: e o texto do botao na aba Acoes. */
  entryLabel: string
  entryHint: string
  /** Efeitos aplicados todo ano so por estar na trilha (fama, desgaste). */
  annualEffects?: Effect[]
  levels: CareerLevel[]
}

export interface Achievement {
  id: string
  name: string
  /** Uma linha, mostrada abaixo do nome. Explica o que foi feito, nao como. */
  description: string
  /** Avaliadas no fim de cada turno, inclusive no turno da morte. */
  conditions: Condition[]
}

export interface AssetDef {
  id: string
  name: string
  kind: AssetKind
  hint: string
  price: number
  /** Manutencao anual como fracao do valor atual. IPTU, seguro, taxa. */
  upkeepRate: number
  /** Valorizacao anual media, em fracao. Negativa = deprecia. */
  appreciation: number
  /** Oscilacao em torno da media. 0 = valor previsivel. */
  volatility: number
  requirements: Condition[]
  /**
   * Aplicados todo ano so por possuir a coisa. E o que faz um iate comprar
   * felicidade em vez de ser mais um numero na lista de bens.
   */
  annualEffects?: Effect[]
}

/**
 * Acao dirigida a uma pessoa. Vive na aba Relacoes, nao na lista global de
 * acoes: com N pessoas na vida, N x 6 linhas soltas seria ilegivel.
 */
export interface RelationAction {
  id: string
  label: string
  hint: string
  cost: number
  /** Tipos de relacao em que a acao aparece. */
  kinds: RelationKind[]
  /** Sobre o personagem, nao sobre o alvo. */
  conditions?: Condition[]
  requirements?: Condition[]
  /**
   * Nivel de relacao COM O ALVO. Nao da para expressar isso como Condition:
   * o avaliador nao conhece o alvo, e `relationLevel` compara por TIPO de
   * relacao, o que responderia por outra pessoa quando ha duas do mesmo tipo.
   */
  minRelation?: number
  maxRelation?: number
  /** Anos minimos entre dois usos NA MESMA pessoa. */
  cooldown?: number
  /** Ver `GameAction.confirm`. */
  confirm?: string
  outcomes: Outcome[]
}

export interface Course {
  id: string
  name: string
  /** Nivel de escolaridade que o curso concede ao terminar. */
  grants: EducationLevel
  years: number
  /** Custo anual. 0 = publica. */
  annualCost: number
  requirements: Condition[]
  /**
   * Requisitos da bolsa integral. Quem passa neles cursa de graca — e a
   * escolha entre bolsa, a vista e financiado passa a existir de verdade.
   */
  scholarship?: Condition[]
  /** Efeitos aplicados na CONCLUSAO. A flag do curso e adicionada sozinha. */
  completionEffects: Effect[]
}

/** Flag setada quando um curso e concluido: `course_<id>`. */
export function courseFlag(courseId: string): string {
  return `course_${courseId}`
}

/**
 * Acao da aba Acoes. Reusa Outcome/Effect do evento de proposito: acao e
 * evento sao a mesma coisa, so muda quem puxa o gatilho.
 */
export interface GameAction {
  id: string
  group: ActionGroup
  label: string
  /** Uma linha explicando o que a acao faz, mostrada abaixo do titulo. */
  hint: string
  /** Pontos de acao consumidos. */
  cost: number
  /** Se falhar, a acao nem aparece na lista. */
  conditions: Condition[]
  /** Se falhar, a acao aparece desabilitada com o motivo. */
  requirements?: Condition[]
  cooldown?: number
  /**
   * Pergunta de confirmacao. Presente = a acao e irreversivel o bastante para
   * merecer um segundo toque: largar um curso apaga anos de estudo, romper um
   * casamento nao tem volta.
   */
  confirm?: string
  outcomes: Outcome[]
}

export interface GameEvent {
  id: string
  category: EventCategory
  weight: number
  /** Dispara no maximo uma vez por vida. */
  once?: boolean
  /**
   * Anos minimos entre dois disparos. Sem isso um evento repetivel de peso
   * alto — uma promocao, por exemplo — cai em anos consecutivos e a vida vira
   * um loop.
   */
  cooldown?: number
  /** TODAS precisam passar. */
  conditions: Condition[]
  text: string
  options: EventOption[]
}

// ---------------------------------------------------------------------------

/** Garante exaustividade em switch sobre union discriminada. */
export function assertNever(value: never, context: string): never {
  throw new Error(`${context}: caso nao tratado ${JSON.stringify(value)}`)
}
