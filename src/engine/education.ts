// Escolaridade. Fundamental e Médio são automáticos — criança não escolhe.
// Graduação e pós são matrícula + um ano de estudo por vez, e cada ano de
// estudo custa um ponto de ação: é aí que mora a decisão.

import {
  AGE_ELEMENTARY_DONE,
  AGE_HIGHSCHOOL_DONE,
  DROPOUT_CHANCE,
  DEBT_CEILING,
  DROPOUT_UNHAPPY_THRESHOLD,
  HIGHSCHOOL_MIN_INTELLIGENCE,
  STUDY_HAPPINESS_COST,
} from './balance'
import type { ContentPack } from './content-pack'
import { addMoney, applyEffects, setStat } from './effects'
import type { Rng } from './rng'
import { formatMoney } from './text'
import { makeNote } from './timeline'
import { evaluateAll } from './conditions'
import { courseFlag } from './types'
import type { Course, GameState, PaymentMode, TimelineEntry } from './types'

export function findCourse(content: ContentPack, courseId: string): Course | undefined {
  return content.courses.find((course) => course.id === courseId)
}

export function courseName(content: ContentPack, courseId: string): string {
  return findCourse(content, courseId)?.name ?? courseId
}

/** Avanca o nivel escolar automatico quando a idade chega. */
export function applySchooling(state: GameState): TimelineEntry | null {
  const c = state.character

  if (c.age === AGE_ELEMENTARY_DONE && c.education === 'none') {
    c.education = 'elementary'
    return makeNote(state, 'Você concluiu o Ensino Fundamental.', 'school', [
      { label: 'Educação', text: 'Ensino Fundamental', tone: 'good' },
    ])
  }

  if (c.age === AGE_HIGHSCHOOL_DONE && c.education === 'elementary') {
    if (c.stats.intelligence < HIGHSCHOOL_MIN_INTELLIGENCE) {
      return makeNote(
        state,
        'Você não conseguiu concluir o Ensino Médio e largou os estudos.',
        'school',
      )
    }
    c.education = 'highschool'
    return makeNote(state, 'Você concluiu o Ensino Médio.', 'school', [
      { label: 'Educação', text: 'Ensino Médio', tone: 'good' },
    ])
  }

  return null
}

export function enroll(
  state: GameState,
  content: ContentPack,
  courseId: string,
  mode: PaymentMode = 'cash',
): boolean {
  const course = findCourse(content, courseId)
  if (!course || state.character.enrollment !== null) return false
  if (mode === 'scholarship' && !hasScholarship(state, course)) return false

  state.character.enrollment = {
    courseId: course.id,
    targetLevel: course.grants,
    yearsLeft: course.years,
    annualCost: mode === 'scholarship' ? 0 : course.annualCost,
    mode,
    financed: mode === 'financed',
  }
  return true
}

/** Se o personagem passa nos requisitos da bolsa integral deste curso. */
export function hasScholarship(state: GameState, course: Course): boolean {
  return course.scholarship !== undefined && evaluateAll(course.scholarship, state)
}

export function dropOut(state: GameState): boolean {
  if (state.character.enrollment === null) return false
  state.character.enrollment = null
  return true
}

/**
 * Cursa um ano. Paga a mensalidade (ou aumenta a divida), e conclui o curso
 * quando os anos acabam.
 */
export function studyYear(
  state: GameState,
  content: ContentPack,
  rng: Rng,
): TimelineEntry | null {
  const c = state.character
  const enrollment = c.enrollment
  if (!enrollment) return null

  const course = findCourse(content, enrollment.courseId)
  if (!course) {
    c.enrollment = null
    return null
  }

  if (enrollment.annualCost > 0) {
    // Quem escolheu financiar sempre vai para a divida — e o ponto de ter
    // escolhido. Quem paga do proprio bolso so recorre a ela se faltar caixa.
    const mustBorrow = enrollment.mode === 'financed' || enrollment.annualCost > c.money
    if (mustBorrow) {
      c.debt = Math.min(DEBT_CEILING, c.debt + enrollment.annualCost)
      enrollment.financed = true
    } else {
      addMoney(c, -enrollment.annualCost)
    }
  }

  setStat(c, 'happiness', c.stats.happiness - STUDY_HAPPINESS_COST)
  enrollment.yearsLeft -= 1

  // Curso é maratona: quem está no fundo do poço larga.
  if (c.stats.happiness < DROPOUT_UNHAPPY_THRESHOLD && rng.chance(DROPOUT_CHANCE)) {
    c.enrollment = null
    return makeNote(state, `Você largou ${course.name}. Não dava mais.`, 'school', [
      { label: 'Curso', text: 'abandonado', tone: 'bad' },
    ])
  }

  if (enrollment.yearsLeft > 0) {
    const cost = enrollment.annualCost
    return makeNote(
      state,
      `Mais um ano de ${course.name}. Faltam ${enrollment.yearsLeft}.`,
      'school',
      cost > 0
        ? [
            {
              label: enrollment.financed ? 'Financiamento' : 'Mensalidades',
              text: `${enrollment.financed ? '+' : '−'}${formatMoney(cost)}`,
              tone: 'bad',
            },
          ]
        : [],
    )
  }

  // Conclusão.
  c.enrollment = null
  c.education = course.grants
  c.flags[courseFlag(course.id)] = true
  const logs = applyEffects(course.completionEffects, state, rng, content)

  return makeNote(state, `Você se formou em ${course.name}.`, 'school', [
    { label: 'Diploma', text: course.name, tone: 'good' },
    ...logs,
  ])
}
