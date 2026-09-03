// O ContentPack que o jogo usa de verdade. Testes montam packs menores.

import type { ContentPack } from '../engine/content-pack'
import { CITIES } from './cities'
import { ALL_EVENTS } from './events'
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from './names'

export const GAME_CONTENT: ContentPack = {
  events: ALL_EVENTS,
  maleNames: MALE_NAMES,
  femaleNames: FEMALE_NAMES,
  surnames: SURNAMES,
  cities: CITIES,
}
