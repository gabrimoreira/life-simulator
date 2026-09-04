import { describe, expect, it } from 'vitest'
import { makeCharacter, makeState } from '../test/fixtures'
import { extractTokens, formatMoney, interpolate } from './text'

describe('interpolate', () => {
  const state = makeState({
    character: makeCharacter({ name: 'Joana', city: 'Recife', uf: 'PE', age: 24, money: 3240 }),
    relations: [
      { id: 'm', name: 'Ana Silva', kind: 'mother', gender: 'female', age: 50, relation: 70, alive: true },
    ],
  })

  it('substitui dados do personagem', () => {
    expect(interpolate('{name} tem {age} anos e mora em {city}/{uf}.', state)).toBe(
      'Joana tem 24 anos e mora em Recife/PE.',
    )
  })

  it('usa o nome real da mãe quando existe', () => {
    expect(interpolate('{mother} ligou.', state)).toBe('Ana Silva ligou.')
  })

  it('cai num rótulo genérico quando a relação não existe', () => {
    expect(interpolate('{father} ligou.', state)).toBe('seu pai ligou.')
  })

  // O spec listava `{conjuge}` desde o começo e o token nunca existiu: um
  // evento de casamento não tinha como citar a pessoa pelo nome.
  it('usa o primeiro nome do cônjuge vivo', () => {
    const casado = makeState({
      character: makeCharacter({ name: 'Joana' }),
      relations: [
        { id: 's', name: 'Rui Barbosa', kind: 'spouse', gender: 'male', age: 40, relation: 70, alive: true },
      ],
    })
    expect(interpolate('{conjuge} não gostou.', casado)).toBe('Rui não gostou.')
  })

  it('não cita cônjuge morto: a flag de casado sobrevive à viuvez', () => {
    const viuva = makeState({
      relations: [
        { id: 's', name: 'Rui Barbosa', kind: 'spouse', gender: 'male', age: 40, relation: 70, alive: false },
      ],
    })
    expect(interpolate('{conjuge} não gostou.', viuva)).toBe('seu cônjuge não gostou.')
  })

  it('resolve concordância de gênero pelo personagem', () => {
    const feminino = makeState({ character: makeCharacter({ gender: 'female' }) })
    const masculino = makeState({ character: makeCharacter({ gender: 'male' }) })
    expect(interpolate('Você foi promovid{o}.', feminino)).toBe('Você foi promovida.')
    expect(interpolate('Você foi promovid{o}.', masculino)).toBe('Você foi promovido.')
    expect(interpolate('{Ele} disse que era {dele}.', feminino)).toBe('Ela disse que era dela.')
  })

  it('deixa token desconhecido intacto em vez de quebrar', () => {
    expect(interpolate('Oi {inexistente}.', state)).toBe('Oi {inexistente}.')
  })

  it('formata dinheiro em BRL', () => {
    expect(formatMoney(3240)).toContain('3.240')
    expect(formatMoney(0)).toContain('0')
  })
})

describe('extractTokens', () => {
  it('lista os tokens presentes', () => {
    expect(extractTokens('{name} e {city} e {name}')).toEqual(['name', 'city', 'name'])
    expect(extractTokens('sem token')).toEqual([])
  })
})
