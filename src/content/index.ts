// O ContentPack que o jogo usa de verdade. Testes montam packs menores.

import type { ContentPack } from '../engine/content-pack'
import { ACHIEVEMENTS } from './achievements'
import { GAME_ACTIONS } from './actions'
import { ASSETS } from './assets'
import { CAREER_TRACKS } from './careers'
import { CITIES } from './cities'
import { COURSES } from './education'
import { RELATION_ACTIONS } from './relation-actions'
import { ALL_EVENTS } from './events'
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from './names'

export const GAME_CONTENT: ContentPack = {
  events: ALL_EVENTS,
  actions: GAME_ACTIONS,
  careers: CAREER_TRACKS,
  courses: COURSES,
  assets: ASSETS,
  relationActions: RELATION_ACTIONS,
  achievements: ACHIEVEMENTS,
  maleNames: MALE_NAMES,
  femaleNames: FEMALE_NAMES,
  surnames: SURNAMES,
  cities: CITIES,
}
