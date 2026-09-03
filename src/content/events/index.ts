// Agrega os pools por arquivo. Adicionar um evento a uma categoria existente
// exige editar UM arquivo — este aqui só muda quando nasce uma categoria nova.

import { ADULT_EVENTS } from './adult'
import { CALLBACK_EVENTS } from './callbacks'
import { CAREER_EVENTS } from './career'
import { PRISON_EVENTS } from './prison'
import { CHILDHOOD_EVENTS } from './childhood'
import { ELDER_EVENTS } from './elder'
import { RANDOM_EVENTS } from './random'
import { SCHOOL_EVENTS } from './school'
import { YOUNG_ADULT_EVENTS } from './young-adult'
import type { GameEvent } from '../../engine/types'

export const ALL_EVENTS: GameEvent[] = [
  ...CHILDHOOD_EVENTS,
  ...SCHOOL_EVENTS,
  ...YOUNG_ADULT_EVENTS,
  ...ADULT_EVENTS,
  ...CAREER_EVENTS,
  ...CALLBACK_EVENTS,
  ...PRISON_EVENTS,
  ...ELDER_EVENTS,
  ...RANDOM_EVENTS,
]
