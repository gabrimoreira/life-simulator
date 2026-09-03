// O ContentPack que o jogo usa de verdade. Testes montam packs menores.

import type { ContentPack } from '../engine/content-pack'
import { GAME_ACTIONS } from './actions'
import { CAREER_TRACKS } from './careers'
import { CITIES } from './cities'
import { COURSES } from './education'
import { ALL_EVENTS } from './events'
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from './names'

export const GAME_CONTENT: ContentPack = {
  events: ALL_EVENTS,
  actions: GAME_ACTIONS,
  careers: CAREER_TRACKS,
  courses: COURSES,
  maleNames: MALE_NAMES,
  femaleNames: FEMALE_NAMES,
  surnames: SURNAMES,
  cities: CITIES,
}
