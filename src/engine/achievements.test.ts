import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '../content'
import { makeCharacter, makeContent, makeState, playTurn } from '../test/fixtures'
import { checkAchievements, earnedAchievements } from './achievements'
import { createGame } from './generate'
import type { Achievement } from './types'

const RICO: Achievement = {
  id: 'rico',
  name: 'Rico',
  description: 'Juntou dinheiro.',
  conditions: [{ type: 'netWorth', min: 100_000 }],
}

const VELHO: Achievement = {
  id: 'velho',
  name: 'Velho',
  description: 'Chegou aos oitenta.',
  conditions: [{ type: 'age', min: 80 }],
}

const content = makeContent([], { achievements: [RICO, VELHO] })

describe('checkAchievements', () => {
  it('concede o que a condição permite e ignora o resto', () => {
    const state = makeState({ character: makeCharacter({ age: 30, money: 200_000 }) })
    const notes = checkAchievements(state, content)

    expect(state.achievements).toEqual(['rico'])
    expect(notes).toHaveLength(1)
  })

  it('não concede duas vezes', () => {
    const state = makeState({ character: makeCharacter({ age: 30, money: 200_000 }) })
    checkAchievements(state, content)
    expect(checkAchievements(state, content)).toEqual([])
    expect(state.achievements).toEqual(['rico'])
  })

  it('uma conquista não some quando a condição deixa de valer', () => {
    const state = makeState({ character: makeCharacter({ age: 30, money: 200_000 }) })
    checkAchievements(state, content)

    state.character.money = 0
    checkAchievements(state, content)
    expect(state.achievements).toEqual(['rico'])
  })

  it('vira nota na timeline no momento em que acontece', () => {
    const state = makeState({ character: makeCharacter({ age: 30, money: 200_000 }) })
    const note = checkAchievements(state, content)[0]
    expect(note?.kind).toBe('note')
    if (note?.kind === 'note') expect(note.text).toContain('Rico')
  })

  it('earnedAchievements devolve os objetos, na ordem do catálogo', () => {
    const state = makeState({ character: makeCharacter({ age: 90, money: 200_000 }) })
    checkAchievements(state, content)
    expect(earnedAchievements(state, content).map((a) => a.id)).toEqual(['rico', 'velho'])
  })
})

describe('no jogo de verdade', () => {
  it('o turno concede conquistas sozinho', () => {
    const state = createGame(
      { name: 'T', gender: 'male', seed: 3, birthYear: 2000 },
      GAME_CONTENT,
    )
    // `playTurn` e não limpar a fila à mão: limpar pula o `finishTurn`, e com
    // ele a checagem de morte E a de conquistas.
    for (let i = 0; i < 40 && state.character.alive; i++) {
      playTurn(state, GAME_CONTENT)
    }
    expect(state.achievements.length).toBeGreaterThan(0)
  })

  it('conquistas de fim de vida são avaliadas no turno da morte', () => {
    // A checagem roda DEPOIS da morte, de propósito: "chegou aos cem" e
    // "morreu no vermelho" só fazem sentido no turno em que a vida acaba.
    const state = makeState({ character: makeCharacter({ age: 79, alive: true }) })
    state.character.age = 80
    state.character.alive = false
    expect(checkAchievements(state, content).map((n) => n.kind)).toEqual(['note'])
    expect(state.achievements).toContain('velho')
  })
})
