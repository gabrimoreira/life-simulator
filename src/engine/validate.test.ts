// As validacoes de conteudo eram chamadas so contra o conteudo real, esperando
// lista vazia. Isso prova que o conteudo esta bom, nao que o detector funciona:
// uma validacao que nunca dispara passa no teste do mesmo jeito. Aqui cada
// regra e alimentada com o conteudo quebrado que ela existe para pegar.

import { describe, expect, it } from 'vitest'
import {
  orphanFlags,
  validateAchievements,
  validateActions,
  validateAssets,
  validateCareers,
  validateCourses,
  validateEvents,
  validateRelationActions,
} from './validate'
import type {
  Achievement,
  AssetDef,
  CareerTrack,
  Course,
  GameAction,
  RelationAction,
} from './types'
import { makeContent, makeEvent } from '../test/fixtures'

/** Casa a mensagem por pedaco, para o teste nao quebrar ao reescrever texto. */
function has(problems: string[], fragment: string): boolean {
  return problems.some((p) => p.includes(fragment))
}

describe('validateEvents', () => {
  it('pega id duplicado', () => {
    const problems = validateEvents([makeEvent({ id: 'a' }), makeEvent({ id: 'a' })])
    expect(has(problems, 'id duplicado')).toBe(true)
  })

  it('pega weight zerado', () => {
    expect(has(validateEvents([makeEvent({ weight: 0 })]), 'weight')).toBe(true)
  })

  it('pega once e cooldown juntos', () => {
    const problems = validateEvents([makeEvent({ once: true, cooldown: 3 })])
    expect(has(problems, 'once e cooldown juntos')).toBe(true)
  })

  it('pega bias fora do teto — o atributo decidiria em vez de enviesar', () => {
    const event = makeEvent({})
    const opcao = {
      text: 'Negociar',
      outcomes: [
        { chance: 0.5, bias: { charisma: 5 }, text: 'Deu certo.', effects: [] },
        { chance: 0.5, text: 'Não deu.', effects: [] },
      ],
    }
    const problems = validateEvents([{ ...event, options: [opcao, event.options[1]!] }])
    expect(has(problems, 'passa do teto')).toBe(true)
  })

  it('pega bias decorativo em outcome único', () => {
    const event = makeEvent({})
    const opcao = {
      text: 'Tentar',
      outcomes: [{ chance: 1, bias: { looks: 0.5 }, text: 'Deu certo.', effects: [] }],
    }
    const problems = validateEvents([{ ...event, options: [opcao, event.options[1]!] }])
    expect(has(problems, 'outcome unico')).toBe(true)
  })

  it('pega peso zerado, que parece pesar e não pesa', () => {
    const event = makeEvent({})
    const opcao = {
      text: 'Tentar',
      outcomes: [
        { chance: 0.5, bias: { luck: 0 }, text: 'Deu certo.', effects: [] },
        { chance: 0.5, text: 'Não deu.', effects: [] },
      ],
    }
    const problems = validateEvents([{ ...event, options: [opcao, event.options[1]!] }])
    expect(has(problems, 'nao enviesa nada')).toBe(true)
  })

  it('pega token desconhecido no texto', () => {
    const problems = validateEvents([makeEvent({ text: 'Oi, {nome_inexistente}.' })])
    expect(has(problems, 'token desconhecido')).toBe(true)
  })

  it('pega evento com uma opcao so', () => {
    const event = makeEvent({})
    const problems = validateEvents([{ ...event, options: [event.options[0]!] }])
    expect(has(problems, 'opcoes')).toBe(true)
  })

  it('pega evento em que TODA opcao tem requisito — o jogador travaria', () => {
    const event = makeEvent({})
    const locked = event.options.map((o) => ({
      ...o,
      requirements: [{ type: 'money' as const, min: 1_000_000 }],
    }))
    const problems = validateEvents([{ ...event, options: locked }])
    expect(has(problems, 'pode travar')).toBe(true)
  })

  it('nao reclama de um evento saudavel', () => {
    expect(validateEvents([makeEvent({ id: 'ok' })])).toEqual([])
  })
})

describe('validateActions', () => {
  const base: GameAction = {
    id: 'treinar',
    group: 'health',
    label: 'Treinar',
    hint: 'Suar um pouco.',
    cost: 1,
    conditions: [{ type: 'age', min: 12 }],
    outcomes: [{ chance: 1, text: 'Foi bom.', effects: [] }],
  }

  it('pega ":" reservado para acoes derivadas', () => {
    expect(has(validateActions([{ ...base, id: 'enroll:direito' }]), 'reservado')).toBe(true)
  })

  it('pega id que colide com uma acao derivada do engine', () => {
    expect(has(validateActions([{ ...base, id: 'study' }]), 'colide')).toBe(true)
    expect(has(validateActions([{ ...base, id: 'drop_out' }]), 'colide')).toBe(true)
  })

  it('pega cost negativo e hint vazio', () => {
    expect(has(validateActions([{ ...base, cost: -1 }]), 'cost negativo')).toBe(true)
    expect(has(validateActions([{ ...base, hint: '  ' }]), 'hint vazio')).toBe(true)
  })

  it('pega cooldown zerado', () => {
    expect(has(validateActions([{ ...base, cooldown: 0 }]), 'cooldown')).toBe(true)
  })

  it('nao reclama de uma acao saudavel', () => {
    expect(validateActions([base])).toEqual([])
  })
})

describe('validateCareers', () => {
  const track: CareerTrack = {
    id: 't',
    name: 'Trilha',
    kind: 'clt',
    entryLabel: 'Entrar',
    entryHint: 'Entrar na trilha.',
    levels: [
      { title: 'Junior', salary: 30_000, minYears: 0, requirements: [] },
      { title: 'Pleno', salary: 60_000, minYears: 2, requirements: [] },
    ],
  }

  it('pega trilha com um nivel so', () => {
    const problems = validateCareers([{ ...track, levels: [track.levels[0]!] }])
    expect(has(problems, 'pelo menos 2 niveis')).toBe(true)
  })

  it('pega salario que nao sobe — nao seria promocao', () => {
    const flat = { ...track, levels: [track.levels[0]!, { ...track.levels[1]!, salary: 30_000 }] }
    expect(has(validateCareers([flat]), 'salario nao sobe')).toBe(true)
  })

  it('pega volatility fora da faixa', () => {
    const wild = { ...track, levels: [track.levels[0]!, { ...track.levels[1]!, volatility: 1.5 }] }
    expect(has(validateCareers([wild]), 'volatility')).toBe(true)
  })

  it('nao reclama de uma trilha saudavel', () => {
    expect(validateCareers([track])).toEqual([])
  })
})

describe('validateCareers, nomes', () => {
  it('pega duas trilhas com o mesmo nome', () => {
    const base: CareerTrack = {
      id: 'a',
      name: 'Tecnologia',
      kind: 'clt',
      entryLabel: 'Entrar',
      entryHint: 'Dica',
      levels: [
        { title: 'Um', salary: 10, minYears: 0, requirements: [] },
        { title: 'Dois', salary: 20, minYears: 1, requirements: [] },
      ],
    }
    const problems = validateCareers([base, { ...base, id: 'b' }])
    expect(has(problems, 'duplicado')).toBe(true)
  })
})

describe('validateCourses', () => {
  const course: Course = {
    id: 'c',
    name: 'Curso',
    grants: 'bachelor',
    years: 4,
    annualCost: 10_000,
    requirements: [],
    completionEffects: [],
  }

  it('pega years zerado e custo negativo', () => {
    expect(has(validateCourses([{ ...course, years: 0 }]), 'years')).toBe(true)
    expect(has(validateCourses([{ ...course, annualCost: -1 }]), 'annualCost')).toBe(true)
  })

  it('pega id duplicado', () => {
    expect(has(validateCourses([course, course]), 'id duplicado')).toBe(true)
  })

  it('nao reclama de um curso saudavel', () => {
    expect(validateCourses([course])).toEqual([])
  })
})

describe('validateAssets', () => {
  const asset: AssetDef = {
    id: 'a',
    name: 'Apartamento',
    kind: 'property',
    hint: 'Um teto.',
    price: 200_000,
    upkeepRate: 0.01,
    appreciation: 0.03,
    volatility: 0.05,
    requirements: [],
  }

  it('pega dinheiro de graca: valoriza forte, sem custo e sem risco', () => {
    const free = { ...asset, appreciation: 0.2, upkeepRate: 0, volatility: 0 }
    expect(has(validateAssets([free]), 'sem custo nem risco')).toBe(true)
  })

  it('pega price zerado e upkeep negativo', () => {
    expect(has(validateAssets([{ ...asset, price: 0 }]), 'price')).toBe(true)
    expect(has(validateAssets([{ ...asset, upkeepRate: -0.1 }]), 'upkeepRate')).toBe(true)
  })

  it('nao reclama de um ativo saudavel', () => {
    expect(validateAssets([asset])).toEqual([])
  })
})

describe('validateRelationActions', () => {
  const action: RelationAction = {
    id: 'conversar',
    kinds: ['friend'],
    label: 'Conversar',
    hint: 'Puxar assunto.',
    cost: 1,
    outcomes: [{ chance: 1, text: 'Boa conversa.', effects: [] }],
  }

  it('pega faixa de relacao impossivel — a acao nunca apareceria', () => {
    const impossible = { ...action, minRelation: 80, maxRelation: 20 }
    expect(has(validateRelationActions([impossible]), 'nunca aparece')).toBe(true)
  })

  it('pega acao sem nenhum tipo de relacao', () => {
    expect(has(validateRelationActions([{ ...action, kinds: [] }]), 'sem tipos')).toBe(true)
  })

  it('nao reclama de uma acao saudavel', () => {
    expect(validateRelationActions([action])).toEqual([])
  })
})

describe('validateAchievements', () => {
  const achievement: Achievement = {
    id: 'rico',
    name: 'Rico',
    description: 'Juntou dinheiro.',
    conditions: [{ type: 'money', min: 1_000_000 }],
  }

  it('pega conquista sem condicao — seria dada no primeiro turno', () => {
    expect(has(validateAchievements([{ ...achievement, conditions: [] }]), 'sem condicoes')).toBe(
      true,
    )
  })

  it('pega id duplicado e descricao vazia', () => {
    expect(has(validateAchievements([achievement, achievement]), 'id duplicado')).toBe(true)
    expect(has(validateAchievements([{ ...achievement, description: ' ' }]), 'description')).toBe(
      true,
    )
  })

  it('nao reclama de uma conquista saudavel', () => {
    expect(validateAchievements([achievement])).toEqual([])
  })
})

describe('orphanFlags', () => {
  it('acusa uma flag escrita e nunca lida', () => {
    const content = makeContent([
      makeEvent({
        id: 'escreve',
        options: [
          {
            text: 'A',
            outcomes: [
              { chance: 1, text: 'ok', effects: [{ type: 'flag', flag: 'ninguem_le', value: true }] },
            ],
          },
          { text: 'B', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
        ],
      }),
    ])
    expect(orphanFlags(content)).toContain('ninguem_le')
  })

  it('conta uma conquista como leitora — antes era falso positivo', () => {
    const content = makeContent(
      [
        makeEvent({
          id: 'escreve',
          options: [
            {
              text: 'A',
              outcomes: [
                {
                  chance: 1,
                  text: 'ok',
                  effects: [{ type: 'flag', flag: 'so_conquista_le', value: true }],
                },
              ],
            },
            { text: 'B', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
          ],
        }),
      ],
      {
        achievements: [
          {
            id: 'q',
            name: 'Q',
            description: 'Q.',
            conditions: [{ type: 'flag', flag: 'so_conquista_le', value: true }],
          },
        ],
      },
    )
    expect(orphanFlags(content)).toEqual([])
  })

  it('conta o requisito de bolsa como leitura', () => {
    const content = makeContent(
      [
        makeEvent({
          id: 'escreve',
          options: [
            {
              text: 'A',
              outcomes: [
                {
                  chance: 1,
                  text: 'ok',
                  effects: [{ type: 'flag', flag: 'so_bolsa_le', value: true }],
                },
              ],
            },
            { text: 'B', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
          ],
        }),
      ],
      {
        courses: [
          {
            id: 'c',
            name: 'Curso',
            grants: 'bachelor',
            years: 4,
            annualCost: 0,
            requirements: [],
            scholarship: [{ type: 'flag', flag: 'so_bolsa_le', value: true }],
            completionEffects: [],
          },
        ],
      },
    )
    expect(orphanFlags(content)).toEqual([])
  })

  it('enxerga flag escrita pelo efeito anual de um bem', () => {
    const content = makeContent([makeEvent({ id: 'nada' })], {
      assets: [
        {
          id: 'a',
          name: 'Iate',
          kind: 'property',
          hint: 'Caro.',
          price: 1_000_000,
          upkeepRate: 0.1,
          appreciation: -0.05,
          volatility: 0.1,
          requirements: [],
          annualEffects: [{ type: 'flag', flag: 'escrita_pelo_bem', value: true }],
        },
      ],
    })
    expect(orphanFlags(content)).toContain('escrita_pelo_bem')
  })

  it('nao acusa uma flag que alguem le', () => {
    const content = makeContent([
      makeEvent({
        id: 'escreve',
        options: [
          {
            text: 'A',
            outcomes: [
              { chance: 1, text: 'ok', effects: [{ type: 'flag', flag: 'alguem_le', value: true }] },
            ],
          },
          { text: 'B', outcomes: [{ chance: 1, text: 'ok', effects: [] }] },
        ],
      }),
      makeEvent({ id: 'le', conditions: [{ type: 'flag', flag: 'alguem_le', value: true }] }),
    ])
    expect(orphanFlags(content)).toEqual([])
  })
})
