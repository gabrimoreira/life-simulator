// Adapta o engine ao Vue e cuida do save. Nenhuma regra de jogo mora aqui.

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { GAME_CONTENT } from '../content'
import { FLAG_LABELS } from '../content/flags'
import { CLASS_PROFILES } from '../engine/balance'
import { ACTION_GROUP_LABELS, availableActions } from '../engine/actions'
import type { ActionGroup, PaymentMode, Person } from '../engine/types'
import { achievementCatalog, earnedAchievements } from '../engine/achievements'
import { netWorth, ownedWithDef } from '../engine/assets'
import { costOfLiving, spouseIncome } from '../engine/economy'
import { careerTitle, currentLevel, nextLevel, peakCareer, promotionReady } from '../engine/careers'
import { canContinue, createHeir, heirCandidates } from '../engine/heir'
import { livingRelations, relationActionsFor } from '../engine/relations'
import { courseName } from '../engine/education'
import { firstFailure } from '../engine/conditions'
import { createGame } from '../engine/generate'
import { interpolate } from '../engine/text'
import { advanceYear, chooseOption, currentEvent, runAction, runRelationAction } from '../engine/turn'
import type { EventOption, GameState, Gender, TimelineEntry } from '../engine/types'
import { CURRENT_SAVE_VERSION } from '../save/adapter'
import type { PersistedSave, SaveAdapter, SaveProblem } from '../save/adapter'
import { createLocalStorageAdapter } from '../save/local-storage-adapter'
import { migrate } from '../save/migrations'

export interface ActionGroupView {
  key: ActionGroup
  label: string
  actions: ReturnType<typeof availableActions>
}

/**
 * Troca id de flag por rótulo nos motivos de bloqueio.
 *
 * `conditions.ts` monta "Requer: course_medicina" porque é engine e não pode
 * importar `content/` — os rótulos são conteúdo. Traduzir aqui é justamente o
 * trabalho do store, que é a camada que liga os dois. Sem isto o jogador lia
 * o id cru da flag na tela.
 */
function humanize(reason: string | null): string | null {
  if (reason === null) return reason
  return reason.replace(/(Requer|Impedido por): ([a-z0-9_]+)/g, (whole, prefixo: string, flag: string) => {
    const label = FLAG_LABELS[flag]
    return label === undefined ? whole : `${prefixo}: ${label.toLowerCase()}`
  })
}

export interface OptionStatus {
  text: string
  enabled: boolean
  reason: string | null
}

export const useGameStore = defineStore('game', () => {
  const adapter: SaveAdapter = createLocalStorageAdapter()

  const state = ref<GameState | null>(null)
  const ready = ref(false)

  /**
   * O que a última ação produziu, para ser mostrado onde ela foi clicada.
   *
   * `runAction` escreve a nota na timeline, que só é renderizada na aba Vida:
   * clicar "Treinar" na aba Ações mudava apenas o contador de pontos, e o
   * resultado do dado ia parar numa tela que o jogador não estava olhando.
   */
  const lastResult = ref<TimelineEntry | null>(null)

  /**
   * O que deu errado com a persistência, se deu.
   *
   * Save corrompido era descartado em silêncio: o jogador perdia uma vida de
   * setenta anos e via a tela de novo jogo, sem nenhuma explicação e sem a
   * chance de guardar o arquivo. Escrita falhando também era silenciosa — só
   * se descobria ao recarregar a página.
   */
  const saveProblem = ref<SaveProblem | null>(null)

  /**
   * O que quebrou, se quebrou.
   *
   * Sem isto, uma excecao dentro de `chooseOption` deixava o jogo parado com o
   * modal aberto e o turno preso em 'resolving': nenhum botao respondia, nada
   * aparecia na tela, e a unica saida era limpar o navegador — levando junto a
   * vida inteira. Registrado aqui, o jogador ao menos consegue ver o que
   * houve e baixar o save antes de recomecar.
   */
  const fatal = ref<string | null>(null)

  function reportFatal(error: unknown): void {
    fatal.value = error instanceof Error ? error.message : String(error)
  }

  function dismissFatal(): void {
    fatal.value = null
  }

  const activeTab = ref<'life' | 'actions' | 'relations' | 'assets' | 'profile'>('life')

  const character = computed(() => state.value?.character ?? null)
  const alive = computed(() => state.value?.character.alive ?? false)
  const hasGame = computed(() => state.value !== null)

  const pendingEvent = computed(() => {
    if (!state.value) return null
    return currentEvent(state.value, GAME_CONTENT)
  })

  const pendingEventText = computed(() => {
    if (!state.value || !pendingEvent.value) return ''
    return interpolate(pendingEvent.value.text, state.value)
  })

  /** Opções do evento atual já com o motivo de bloqueio resolvido. */
  const pendingOptions = computed<OptionStatus[]>(() => {
    const current = state.value
    const event = pendingEvent.value
    if (!current || !event) return []

    return event.options.map((option: EventOption) => {
      const reason = option.requirements ? firstFailure(option.requirements, current) : null
      return {
        text: interpolate(option.text, current),
        enabled: reason === null,
        reason: humanize(reason),
      }
    })
  })

  function snapshot(): PersistedSave | null {
    if (!state.value) return null
    return {
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: Date.now(),
      state: JSON.parse(JSON.stringify(state.value)) as GameState,
    }
  }

  async function persist(): Promise<void> {
    const payload = snapshot()
    if (!payload) return
    const problem = await adapter.save(payload)
    // Uma escrita que volta a funcionar limpa o aviso; uma que falha o mantém.
    if (problem !== null || saveProblem.value?.kind === 'unwritable') {
      saveProblem.value = problem
    }
  }

  async function init(): Promise<void> {
    const { save, problem } = await adapter.load()
    state.value = save?.state ?? null
    saveProblem.value = problem
    ready.value = true
  }

  function dismissSaveProblem(): void {
    saveProblem.value = null
  }

  /** O save atual como texto, para o jogador guardar onde quiser. */
  function exportSave(): string | null {
    const payload = snapshot()
    return payload === null ? null : JSON.stringify(payload, null, 2)
  }

  /**
   * Carrega um save de fora. Passa pela MESMA migração e checagem de forma do
   * save do navegador — arquivo de terceiro não é mais confiável que
   * localStorage corrompido.
   */
  async function importSave(text: string): Promise<boolean> {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return false
    }

    const migrado = migrate(parsed)
    if (migrado === null) return false

    state.value = migrado.state
    lastResult.value = null
    activeTab.value = 'life'
    saveProblem.value = null
    await persist()
    return true
  }


  async function newGame(name: string, gender: Gender, seed?: number): Promise<void> {
    // A seed sempre existiu em `GameState` e nunca foi exibida nem aceita: o
    // engine é determinístico por design e não havia como repetir uma vida.
    state.value = createGame(seed === undefined ? { name, gender } : { name, gender, seed }, GAME_CONTENT)
    lastResult.value = null
    activeTab.value = 'life'
    await persist()
  }

  /** A nota recém-escrita na timeline, se a última coisa gravada foi uma. */
  function captureResult(): void {
    const timeline = state.value?.timeline
    const last = timeline?.[timeline.length - 1]
    lastResult.value = last !== undefined && last.kind === 'note' ? last : null
  }

  async function nextYear(): Promise<void> {
    if (!state.value) return
    lastResult.value = null
    advanceYear(state.value, GAME_CONTENT)
    await persist()
  }

  async function choose(optionIndex: number): Promise<void> {
    if (!state.value) return
    chooseOption(state.value, GAME_CONTENT, optionIndex)
    await persist()
  }

  const actionGroups = computed<ActionGroupView[]>(() => {
    const current = state.value
    if (!current) return []

    const all = availableActions(current, GAME_CONTENT)
    const order: ActionGroup[] = ['career', 'education', 'assets', 'health', 'social', 'crime']

    return order
      .map((key) => ({
        key,
        label: ACTION_GROUP_LABELS[key],
        actions: all
          .filter((action) => action.group === key)
          .map((action) => ({ ...action, reason: humanize(action.reason) })),
      }))
      .filter((group) => group.actions.length > 0)
  })

  const jobTitle = computed(() => (state.value ? careerTitle(state.value, GAME_CONTENT) : null))

  /** Para o balanço final: o cargo mais alto de toda a vida, não o último. */
  const peakJob = computed(() => (state.value ? peakCareer(state.value, GAME_CONTENT) : null))

  /** Números que só fazem sentido depois que a vida acabou. */
  const lifeSummary = computed(() => {
    const current = state.value
    if (!current) return null
    const children = current.relations.filter((p) => p.kind === 'child')
    return {
      peakJob: peakJob.value,
      children: children.length,
      married: current.character.flags['married'] === true,
      yearsJailed: current.character.prison?.yearsServed ?? 0,
      hadRecord: current.character.flags['criminal_record'] === true,
    }
  })

  /**
   * De onde vem o dinheiro do ano, com o mesmo critério da economia.
   *
   * Mostrava só `baseIncome` sob o rótulo "Renda informal", inclusive para
   * quem tinha se aposentado: a economia pagava `max(pension, baseIncome)`
   * (economy.ts) e a tela exibia outro número, sem nunca dizer a palavra
   * pensão. Aposentar-se tinha consequência financeira invisível.
   */
  const income = computed<{ label: string; value: number }>(() => {
    const current = state.value
    if (!current) return { label: 'Renda', value: 0 }

    const level = currentLevel(current, GAME_CONTENT)
    if (level) return { label: 'Salário base', value: level.salary }

    const informal = CLASS_PROFILES[current.character.socialClass].baseIncome
    const pension = current.character.pension
    return pension > informal
      ? { label: 'Pensão', value: pension }
      : { label: 'Renda informal', value: informal }
  })

  const currentSalary = computed(() => income.value.value)

  /**
   * O proximo degrau da carreira e se ele ja esta ao alcance.
   *
   * `nextLevel` e `promotionReady` existiam, tinham teste, e nenhuma tela
   * chamava: o jogador via "Desempenho 62" sem nenhuma forma de saber que o
   * proximo cargo pedia 65.
   */
  const promotion = computed(() => {
    const current = state.value
    if (!current || current.character.career === null) return null
    const next = nextLevel(current, GAME_CONTENT)
    if (!next) return { title: null, ready: false, minYears: 0 }
    return {
      title: next.title,
      ready: promotionReady(current, GAME_CONTENT),
      minYears: next.minYears,
    }
  })

  /**
   * O custo de vida de verdade, e o que o conjuge poe na mesa.
   *
   * A aba Patrimonio mostrava o PISO da classe social sob o rotulo "custo de
   * vida minimo" e explicava em letra miuda que o real era outro numero — que
   * ela nao mostrava. `costOfLiving` e `spouseIncome` ja calculavam os dois.
   */
  const yearCost = computed(() => (state.value ? costOfLiving(state.value, currentSalary.value) : 0))

  const spouseContribution = computed(() =>
    state.value ? spouseIncome(state.value, currentSalary.value) : 0,
  )

  /** Como o curso esta sendo pago, em palavra em vez de enum. */
  const PAYMENT_LABELS: Record<PaymentMode, string> = {
    scholarship: 'Bolsa integral',
    cash: 'Do próprio bolso',
    financed: 'Financiado',
  }

  const studying = computed(() => {
    const enrollment = state.value?.character.enrollment
    if (!enrollment) return null
    return {
      name: courseName(GAME_CONTENT, enrollment.courseId),
      yearsLeft: enrollment.yearsLeft,
      // `annualCost` e `mode` eram gravados na matricula e nao apareciam em
      // lugar nenhum: a tela dizia "Financiado" ou "Em dia" a partir de um
      // booleano diferente, e chamava de "Em dia" ate quem tinha bolsa
      // integral e nunca pagou nada.
      annualCost: enrollment.annualCost,
      payment: PAYMENT_LABELS[enrollment.mode],
      /** Ja precisou recorrer a divida em algum ano do curso. */
      neededDebt: enrollment.financed,
    }
  })

  const people = computed<Person[]>(() => (state.value ? livingRelations(state.value) : []))

  const assets = computed(() => (state.value ? ownedWithDef(state.value, GAME_CONTENT) : []))

  const worth = computed(() => (state.value ? netWorth(state.value) : 0))

  const heirs = computed(() => (state.value ? heirCandidates(state.value) : []))

  const achievements = computed(() =>
    state.value ? earnedAchievements(state.value, GAME_CONTENT) : [],
  )

  /** Catálogo inteiro, para o jogador saber o que ainda falta caçar. */
  const allAchievements = computed(() =>
    state.value ? achievementCatalog(state.value, GAME_CONTENT) : [],
  )

  const canContinueLineage = computed(() => (state.value ? canContinue(state.value) : false))

  function actionsForPerson(person: Person): ReturnType<typeof relationActionsFor> {
    if (!state.value) return []
    return relationActionsFor(state.value, GAME_CONTENT, person).map((action) => ({
      ...action,
      reason: humanize(action.reason),
    }))
  }

  async function actOnPerson(personId: string, actionId: string): Promise<void> {
    if (!state.value) return
    lastResult.value = null
    if (!runRelationAction(state.value, GAME_CONTENT, personId, actionId)) return
    captureResult()
    await persist()
  }

  /** Recomeça como um filho, herdando parte do patrimônio e dos atributos. */
  async function continueAsHeir(heirId: string): Promise<void> {
    if (!state.value) return
    const heir = createHeir(state.value, heirId)
    if (!heir) return
    state.value = heir
    activeTab.value = 'life'
    await persist()
  }

  async function act(actionId: string): Promise<void> {
    if (!state.value) return
    // Limpa ANTES de tentar: uma ação recusada (sem ponto de ação, cooldown,
    // requisito) deixava o eco anterior na tela, e o jogador lia o resultado
    // de outra coisa como se fosse a resposta ao que acabou de clicar.
    lastResult.value = null
    if (!runAction(state.value, GAME_CONTENT, actionId)) return
    captureResult()
    await persist()
  }

  async function discard(): Promise<void> {
    state.value = null
    activeTab.value = 'life'
    await adapter.clear()
  }

  return {
    state,
    ready,
    activeTab,
    lastResult,
    character,
    alive,
    hasGame,
    pendingEvent,
    pendingEventText,
    pendingOptions,
    actionGroups,
    people,
    assets,
    worth,
    heirs,
    achievements,
    allAchievements,
    canContinueLineage,
    actionsForPerson,
    actOnPerson,
    continueAsHeir,
    jobTitle,
    peakJob,
    lifeSummary,
    income,
    currentSalary,
    promotion,
    yearCost,
    spouseContribution,
    studying,
    act,
    saveProblem,
    dismissSaveProblem,
    fatal,
    reportFatal,
    dismissFatal,
    exportSave,
    importSave,
    init,
    newGame,
    nextYear,
    choose,
    discard,
  }
})
