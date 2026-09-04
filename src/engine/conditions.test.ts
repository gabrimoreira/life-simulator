import { describe, expect, it } from 'vitest'
import { makeCharacter, makeState } from '../test/fixtures'
import { describe as describeCondition, evaluate, evaluateAll, firstFailure } from './conditions'
import type { Condition, GameState } from './types'

describe('evaluate', () => {
  it('age respeita min, max e intervalo', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    expect(evaluate({ type: 'age', min: 18 }, state)).toBe(true)
    expect(evaluate({ type: 'age', min: 21 }, state)).toBe(false)
    expect(evaluate({ type: 'age', max: 20 }, state)).toBe(true)
    expect(evaluate({ type: 'age', max: 19 }, state)).toBe(false)
    expect(evaluate({ type: 'age', min: 18, max: 25 }, state)).toBe(true)
  })

  it('stat lê o atributo certo', () => {
    const state = makeState()
    state.character.stats.intelligence = 80
    expect(evaluate({ type: 'stat', stat: 'intelligence', min: 70 }, state)).toBe(true)
    expect(evaluate({ type: 'stat', stat: 'charisma', min: 70 }, state)).toBe(false)
  })

  it('money compara o saldo líquido', () => {
    const state = makeState()
    state.character.money = 5000
    expect(evaluate({ type: 'money', min: 5000 }, state)).toBe(true)
    expect(evaluate({ type: 'money', min: 5001 }, state)).toBe(false)
  })

  it('flag trata ausente como false', () => {
    const state = makeState()
    expect(evaluate({ type: 'flag', flag: 'nunca_setada', value: false }, state)).toBe(true)
    expect(evaluate({ type: 'flag', flag: 'nunca_setada', value: true }, state)).toBe(false)
    state.character.flags['casado'] = true
    expect(evaluate({ type: 'flag', flag: 'casado', value: true }, state)).toBe(true)
  })

  it('education compara por nível quando atLeast', () => {
    const state = makeState({ character: makeCharacter({ education: 'bachelor' }) })
    expect(evaluate({ type: 'education', level: 'highschool', atLeast: true }, state)).toBe(true)
    expect(evaluate({ type: 'education', level: 'postgrad', atLeast: true }, state)).toBe(false)
    expect(evaluate({ type: 'education', level: 'highschool', atLeast: false }, state)).toBe(false)
    expect(evaluate({ type: 'education', level: 'bachelor', atLeast: false }, state)).toBe(true)
  })

  it('hasRelation ignora quem já morreu', () => {
    const state = makeState({
      relations: [
        { id: 'm', name: 'Ana', kind: 'mother', gender: 'female', age: 50, relation: 70, alive: false },
      ],
    })
    expect(evaluate({ type: 'hasRelation', kind: 'mother' }, state)).toBe(false)
    const alive = state.relations[0]
    if (alive) alive.alive = true
    expect(evaluate({ type: 'hasRelation', kind: 'mother' }, state)).toBe(true)
  })

  it('socialClass casa com a lista', () => {
    const state = makeState({ character: makeCharacter({ socialClass: 'poor' }) })
    expect(evaluate({ type: 'socialClass', oneOf: ['poor', 'rich'] }, state)).toBe(true)
    expect(evaluate({ type: 'socialClass', oneOf: ['middle'] }, state)).toBe(false)
  })

  it('not e anyOf compõem recursivamente', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    const nested: Condition = {
      type: 'not',
      condition: {
        type: 'anyOf',
        conditions: [
          { type: 'age', min: 60 },
          { type: 'stat', stat: 'charisma', min: 90 },
        ],
      },
    }
    expect(evaluate(nested, state)).toBe(true)

    state.character.stats.charisma = 95
    expect(evaluate(nested, state)).toBe(false)
  })

  it('evaluateAll exige todas as condições', () => {
    const state = makeState({ character: makeCharacter({ age: 20 }) })
    expect(evaluateAll([{ type: 'age', min: 18 }, { type: 'money', min: 1 }], state)).toBe(true)
    expect(evaluateAll([{ type: 'age', min: 18 }, { type: 'money', min: 999999 }], state)).toBe(false)
  })
})

describe('firstFailure', () => {
  it('devolve null quando tudo passa', () => {
    expect(firstFailure([{ type: 'age', min: 1 }], makeState())).toBeNull()
  })

  it('devolve o motivo da primeira condição que falha', () => {
    const state = makeState({ character: makeCharacter({ education: 'none' }) })
    const reason = firstFailure(
      [{ type: 'age', min: 1 }, { type: 'education', level: 'highschool', atLeast: true }],
      state,
    )
    expect(reason).toBe('Requer Ensino Médio')
  })
})

describe('describe', () => {
  it('gera motivos legíveis em pt-BR', () => {
    expect(describeCondition({ type: 'money', min: 5000 })).toContain('R$')
    expect(describeCondition({ type: 'stat', stat: 'intelligence', min: 60 })).toBe(
      'Requer Inteligência 60 ou mais',
    )
    expect(describeCondition({ type: 'age', min: 18, max: 25 })).toBe(
      'Requer idade entre 18 anos e 25 anos',
    )
  })
})

describe('relationLevel com mais de uma pessoa do mesmo tipo', () => {
  function comDoisFilhos(primeiro: number, segundo: number): GameState {
    const state = makeState({ character: makeCharacter({ age: 50 }) })
    state.relations.push(
      { id: 'c1', name: 'Rui Silva', kind: 'child', gender: 'male', age: 20, relation: primeiro, alive: true },
      { id: 'c2', name: 'Ana Silva', kind: 'child', gender: 'female', age: 17, relation: segundo, alive: true },
    )
    return state
  }

  it('basta um filho proximo, mesmo que nao seja o primeiro', () => {
    // Com `.find()` isto reprovava: a resposta vinha do primogenito frio, e a
    // conquista `devoted` ficava inalcancavel para quem tivesse dois filhos.
    const state = comDoisFilhos(10, 96)
    expect(evaluate({ type: 'relationLevel', kind: 'child', min: 95 }, state)).toBe(true)
  })

  it('continua valendo quando o proximo e o primeiro', () => {
    const state = comDoisFilhos(96, 10)
    expect(evaluate({ type: 'relationLevel', kind: 'child', min: 95 }, state)).toBe(true)
  })

  it('reprova quando nenhum dos dois chega la', () => {
    const state = comDoisFilhos(40, 50)
    expect(evaluate({ type: 'relationLevel', kind: 'child', min: 95 }, state)).toBe(false)
  })

  it('ignora quem morreu', () => {
    const state = comDoisFilhos(10, 96)
    state.relations[1]!.alive = false
    expect(evaluate({ type: 'relationLevel', kind: 'child', min: 95 }, state)).toBe(false)
  })
})
