import { describe, expect, it } from 'vitest'
import {
  validateAchievements,
  validateActions,
  validateAssets,
  validateCareers,
  validateCourses,
  validateEvents,
  validateRelationActions,
  danglingChoices,
  orphanFlags,
  orphanPersonFlags,
} from '../engine/validate'
import { eligibleEvents } from '../engine/events'
import { makeCharacter, makeState } from '../test/fixtures'
import { createGame } from '../engine/generate'
import { lazy, simulate } from '../test/player'
import { GAME_CONTENT } from '.'
import { ALL_EVENTS } from './events'

describe('conteúdo do jogo', () => {
  it('passa na validação estrutural', () => {
    expect(validateEvents(ALL_EVENTS)).toEqual([])
    expect(validateActions(GAME_CONTENT.actions)).toEqual([])
    expect(validateCareers(GAME_CONTENT.careers)).toEqual([])
    expect(validateCourses(GAME_CONTENT.courses)).toEqual([])
    expect(validateAssets(GAME_CONTENT.assets)).toEqual([])
    expect(validateRelationActions(GAME_CONTENT.relationActions)).toEqual([])
    expect(validateAchievements(GAME_CONTENT.achievements)).toEqual([])
  })

  it('toda trilha tem um nível de entrada alcançável cedo', () => {
    for (const track of GAME_CONTENT.careers) {
      const entry = track.levels[0]
      expect(entry, track.id).toBeDefined()
      expect(entry?.minYears, track.id).toBe(0)
    }
  })

  it('tem eventos elegíveis em toda idade jogável', () => {
    // Um ano sem nenhum evento possível é aceitável; uma faixa inteira vazia
    // significa que a vida adulta virou silêncio.
    for (let age = 0; age <= 100; age += 5) {
      const state = makeState({ character: makeCharacter({ age, education: 'highschool' }) })
      const pool = eligibleEvents(state, GAME_CONTENT)
      if (age >= 5 && age <= 90) {
        expect(pool.length, `nenhum evento elegível aos ${age} anos`).toBeGreaterThan(0)
      }
    }
  })

  it('não tem nomes nem cidades duplicados', () => {
    expect(new Set(GAME_CONTENT.maleNames).size).toBe(GAME_CONTENT.maleNames.length)
    expect(new Set(GAME_CONTENT.femaleNames).size).toBe(GAME_CONTENT.femaleNames.length)
    expect(new Set(GAME_CONTENT.surnames).size).toBe(GAME_CONTENT.surnames.length)
  })
})

describe('validateEvents', () => {
  it('pega chances que não somam 1', () => {
    const problems = validateEvents([
      {
        id: 'quebrado',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'x',
        options: [
          {
            text: 'a',
            outcomes: [
              { chance: 0.5, text: 'a', effects: [] },
              { chance: 0.2, text: 'b', effects: [] },
            ],
          },
          { text: 'b', outcomes: [{ chance: 1, text: 'c', effects: [] }] },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('somam'))).toBe(true)
  })

  it('pega id duplicado', () => {
    const event = {
      id: 'dup',
      category: 'random' as const,
      weight: 1,
      conditions: [],
      text: 'x',
      options: [
        { text: 'a', outcomes: [{ chance: 1, text: 'a', effects: [] }] },
        { text: 'b', outcomes: [{ chance: 1, text: 'b', effects: [] }] },
      ],
    }
    expect(validateEvents([event, event]).some((p) => p.includes('duplicado'))).toBe(true)
  })

  it('pega token de interpolação desconhecido', () => {
    const problems = validateEvents([
      {
        id: 'token',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'Olá {nomeErrado}',
        options: [
          { text: 'a', outcomes: [{ chance: 1, text: 'a', effects: [] }] },
          { text: 'b', outcomes: [{ chance: 1, text: 'b', effects: [] }] },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('token desconhecido'))).toBe(true)
  })

  it('pega evento em que todas as opções têm requisito', () => {
    const problems = validateEvents([
      {
        id: 'travado',
        category: 'random',
        weight: 1,
        conditions: [],
        text: 'x',
        options: [
          {
            text: 'a',
            requirements: [{ type: 'money', min: 1 }],
            outcomes: [{ chance: 1, text: 'a', effects: [] }],
          },
          {
            text: 'b',
            requirements: [{ type: 'money', min: 2 }],
            outcomes: [{ chance: 1, text: 'b', effects: [] }],
          },
        ],
      },
    ])
    expect(problems.some((p) => p.includes('travar'))).toBe(true)
  })
})

describe('saúde do conteúdo', () => {
  it('nenhuma flag é escrita sem que alguém a leia', () => {
    // Onze das dezesseis flags eram write-only quando isto foi medido: o
    // Perfil exibia "Ficha suja" e nada no jogo se comportava diferente.
    // Hoje são dezoito flags e nenhuma órfã.
    expect(orphanFlags(GAME_CONTENT)).toEqual([])
  })

  it('nenhuma flag de pessoa é decorativa, nos dois sentidos', () => {
    // A regra é mais dura que a das flags globais porque o silêncio é pior:
    // uma flag de pessoa escrita e nunca lida some, e uma flag LIDA e nunca
    // escrita esconde o conteúdo que ela gateia — a condição nunca é
    // verdadeira e nada reclama.
    expect(orphanPersonFlags(GAME_CONTENT)).toEqual([])
  })

  it('setor que divide o kind com outro tem evento próprio', () => {
    // Um `kind` com uma trilha só se vira com eventos de `careerKind`. Dois ou
    // mais dividindo o mesmo kind, não: sem evento que nomeie a trilha,
    // "Alimentação" e "Tecnologia" são a mesma vida com outro nome na tela do
    // Perfil, e `careerTrack` volta a ser uma condição que ninguém usa.
    const porKind = new Map<string, string[]>()
    for (const track of GAME_CONTENT.careers) {
      porKind.set(track.kind, [...(porKind.get(track.kind) ?? []), track.id])
    }

    const nomeados = new Set<string>()
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(walk)
      if (value === null || typeof value !== 'object') return
      const record = value as Record<string, unknown>
      if (record['type'] === 'careerTrack' && typeof record['trackId'] === 'string') {
        nomeados.add(record['trackId'])
      }
      Object.values(record).forEach(walk)
    }
    walk(GAME_CONTENT.events)

    const orfas = [...porKind.values()]
      .filter((ids) => ids.length > 1)
      .flat()
      .filter((id) => !nomeados.has(id))
    expect(orfas).toEqual([])
  })

  it('nenhuma condição `chose` aponta para um evento ou opção que não existe', () => {
    // `chose` guarda uma coordenada, não um nome: renomear um evento ou
    // reordenar suas opções quebra o callback em silêncio.
    expect(danglingChoices(GAME_CONTENT)).toEqual([])
  })
})

describe('densidade do sorteio', () => {
  /** Um personagem representativo da idade, para medir o pool disponível. */
  function personaAos(age: number): ReturnType<typeof createGame> {
    const state = createGame({ name: 'T', gender: 'male', seed: 1, birthYear: 2000 }, GAME_CONTENT)
    state.character.age = age
    state.character.education = age >= 23 ? 'bachelor' : age >= 18 ? 'highschool' : 'none'
    state.character.money = 500_000

    if (age >= 24) {
      state.character.career = {
        trackId: 'clt',
        kind: 'clt',
        level: 2,
        yearsInLevel: 3,
        yearsInTrack: 6,
        performance: 60,
      }
    }
    if (age >= 30) {
      state.character.flags['married'] = true
      state.relations.push(
        { id: 'sp', name: 'Ana Silva', kind: 'spouse', gender: 'female', age, relation: 70, alive: true, flags: {} },
        { id: 'ch', name: 'Rui Silva', kind: 'child', gender: 'male', age: Math.max(1, age - 28), relation: 70, alive: true, flags: {} },
      )
    }
    return state
  }

  it('o pool não deixa a vida adulta virar repetição', () => {
    // Uma vida sorteia ~120 eventos. Com um punhado de elegíveis por idade, a
    // vida adulta repetia os mesmos quatro por trinta turnos seguidos.
    for (let age = 20; age <= 80; age += 5) {
      const pool = eligibleEvents(personaAos(age), GAME_CONTENT)
      expect(pool.length, `aos ${age} anos`).toBeGreaterThanOrEqual(22)
    }
  })

  /** Quem o conteúdo esquece: sem dinheiro, sem carreira, sem família, preso. */
  function personaMagra(
    age: number,
    tweak: (state: ReturnType<typeof createGame>) => void = () => {},
  ): ReturnType<typeof createGame> {
    const state = createGame({ name: 'T', gender: 'male', seed: 1, birthYear: 2000 }, GAME_CONTENT)
    state.character.age = age
    state.character.education = age >= 18 ? 'highschool' : 'none'
    state.character.money = 0
    state.character.socialClass = 'poor'
    state.relations = []
    tweak(state)
    return state
  }

  // O teste antigo media só uma persona rica, casada e empregada — 38 eventos
  // elegíveis aos 45 — e por isso não enxergava que o mesmo jogo entregava
  // 20 para quem não venceu. O jogo tinha sete eventos sobre ter iate e
  // nenhum sobre não ter o que comer.
  it('quem não venceu na vida também tem o que viver', () => {
    for (const age of [25, 35, 45, 60]) {
      const pool = eligibleEvents(personaMagra(age), GAME_CONTENT)
      expect(pool.length, `pobre sem nada aos ${age} anos`).toBeGreaterThanOrEqual(25)
    }
  })

  it('a cadeia não é o mesmo punhado de textos por uma pena inteira', () => {
    // Penas chegam a 9 anos, e prison_fight ainda soma 3. Com um pool de 4
    // repetíveis o jogador via os mesmos textos o tempo todo.
    const preso = personaMagra(30, (state) => {
      state.character.prison = { yearsLeft: 6, reason: 'roubo', yearsServed: 1 }
    })
    expect(eligibleEvents(preso, GAME_CONTENT).length).toBeGreaterThanOrEqual(12)
  })

  it('a aposentadoria dura décadas e precisa de pool para elas', () => {
    const aposentado = personaMagra(78, (state) => {
      state.character.flags['retired'] = true
      state.character.pension = 30_000
    })
    expect(eligibleEvents(aposentado, GAME_CONTENT).length).toBeGreaterThanOrEqual(25)
  })

  it('os primeiros anos de vida não são turnos vazios', () => {
    // O jogo começa aos 0. Se o pool for 0, "Avançar ano" só imprime o
    // cabeçalho do ano, e a primeira impressão do jogo é a de um jogo quebrado.
    // Era 0 aos 0 anos e 1 dos 1 aos 3: quatro turnos em que "Avançar ano" só
    // imprimia o cabeçalho, e essa é a primeira impressão que o jogo dá.
    for (const age of [0, 1, 2, 3]) {
      expect(eligibleEvents(personaMagra(age), GAME_CONTENT).length, `aos ${age}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('a infância e a adolescência têm com o que trabalhar', () => {
    // A infância é curta: são poucos turnos, então um pool menor não vira
    // repetição do jeito que viraria numa vida adulta de trinta anos.
    expect(eligibleEvents(personaAos(5), GAME_CONTENT).length).toBeGreaterThanOrEqual(5)
    expect(eligibleEvents(personaAos(10), GAME_CONTENT).length).toBeGreaterThanOrEqual(8)
    expect(eligibleEvents(personaAos(15), GAME_CONTENT).length).toBeGreaterThanOrEqual(12)
  })
})

describe('a crise de felicidade acontece de verdade', () => {
  /** Vive sem plano nenhum, que é o pior caso para a felicidade. */
  function vidaSemPlano(seed: number): ReturnType<typeof createGame> {
    // O pico só existe DURANTE a vida: o contador zera no primeiro ano bom, e
    // o estado final não lembra do fundo do poço. `onYear` é o que dá acesso.
    let pico = 0
    const state = simulate(seed, GAME_CONTENT, {
      onYear: (s) => void (pico = Math.max(pico, s.character.unhappyYears)),
    })
    state.character.unhappyYears = pico
    return state
  }

  // Adiada: no corpo do `describe` estas 40 vidas rodavam na fase de coleta,
  // em toda rodada do Vitest, inclusive com `-t` filtrando outro teste.
  const amostra = lazy(() => Array.from({ length: 40 }, (_, i) => vidaSemPlano(i + 1)))

  it('a sequência de anos infelizes chega aos gates mais fundos', () => {
    // O spec pede crise "se a felicidade zerar por VÁRIOS turnos". Sem esta
    // medida, um evento gated em `unhappyYears min 6` poderia ser conteúdo
    // morto e ninguém notaria — foi exatamente o que aconteceu com o time de
    // futebol de R$40 milhões.
    const picos = amostra().map((s) => s.character.unhappyYears)
    expect(Math.max(...picos), 'maior sequência vista').toBeGreaterThanOrEqual(6)
  }, 20_000)

  it('mas a infelicidade não é o estado normal da vida', () => {
    // Se todo mundo vivesse em crise, a crise não significaria nada.
    const vidas = amostra()
    const medio = vidas.reduce((sum, s) => sum + s.character.unhappyYears, 0) / vidas.length
    expect(medio).toBeLessThan(8)
  })

  it('todo evento de crise é alcançável pelo contador', () => {
    const crises = ALL_EVENTS.filter((e) => e.id.startsWith('crisis_'))
    expect(crises.length).toBeGreaterThan(0)

    const maiorGate = Math.max(
      ...crises.flatMap((e) =>
        e.conditions.filter((c) => c.type === 'unhappyYears').map((c) => c.min ?? 0),
      ),
    )
    const maiorVisto = Math.max(...amostra().map((s) => s.character.unhappyYears))
    expect(maiorVisto, `gate mais fundo é ${maiorGate}`).toBeGreaterThanOrEqual(maiorGate)
  })
})
