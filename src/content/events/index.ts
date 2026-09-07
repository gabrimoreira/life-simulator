// Agrega os pools por arquivo. Adicionar um evento a uma categoria existente
// exige editar UM arquivo — este aqui só muda quando nasce uma categoria nova.

import { ACADEMIA_EVENTS } from './academia'
import { ADULT_EVENTS } from './adult'
import { CALLBACK_EVENTS } from './callbacks'
import { CAREER_EVENTS } from './career'
import { CHANCE_EVENTS } from './chance'
import { CRIME_EVENTS } from './crime'
import { CRISIS_EVENTS } from './crisis'
import { GENDER_EVENTS } from './gender'
import { POLITICS_EVENTS } from './politics'
import { LATE_LIFE_EVENTS } from './late-life'
import { LUXURY_EVENTS } from './luxury'
import { MIDLIFE_EVENTS } from './midlife'
import { PARENTHOOD_EVENTS } from './parenthood'
import { PRISON_EVENTS } from './prison'
import { POVERTY_EVENTS } from './poverty'
import { PROFESSION_EVENTS } from './professions'
import { SECTOR_EVENTS } from './sectors'
import { SOCIAL_EVENTS } from './social'
import { CHILDHOOD_EVENTS } from './childhood'
import { ELDER_EVENTS } from './elder'
import { RANDOM_EVENTS } from './random'
import { SCHOOL_EVENTS } from './school'
import { YOUNG_EVENTS } from './young'
import { VICE_EVENTS } from './vices'
import { YOUNG_ADULT_EVENTS } from './young-adult'
import type { GameEvent } from '../../engine/types'

export const ALL_EVENTS: GameEvent[] = [
  ...CHILDHOOD_EVENTS,
  ...SCHOOL_EVENTS,
  ...YOUNG_ADULT_EVENTS,
  ...YOUNG_EVENTS,
  ...ADULT_EVENTS,
  ...CAREER_EVENTS,
  ...CALLBACK_EVENTS,
  ...PRISON_EVENTS,
  ...CRIME_EVENTS,
  ...CRISIS_EVENTS,
  ...VICE_EVENTS,
  ...GENDER_EVENTS,
  ...POLITICS_EVENTS,
  ...POVERTY_EVENTS,
  ...PROFESSION_EVENTS,
  ...SECTOR_EVENTS,
  ...ACADEMIA_EVENTS,
  ...PARENTHOOD_EVENTS,
  ...LUXURY_EVENTS,
  ...MIDLIFE_EVENTS,
  ...LATE_LIFE_EVENTS,
  ...CHANCE_EVENTS,
  ...SOCIAL_EVENTS,
  ...ELDER_EVENTS,
  ...RANDOM_EVENTS,
]
