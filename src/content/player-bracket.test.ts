// O que a escolha muda, e o que ela não muda.
//
// Todo número de balanceamento deste projeto vinha com a mesma ressalva: o
// jogador scriptado sempre escolhe a primeira opção disponível, que nos
// eventos destrutivos é a pior. Isso torna cada medida um PISO, e um piso
// sozinho não diz se o jogo é difícil ou se o jogador é ruim.
//
// Com dois jogadores — o que se sabota e o que apenas não faz besteira — a
// distância entre eles vira a informação. Um número que só melhora com o
// jogador sensato depende de escolha; um número igual nos dois é estrutural,
// e mexer nele exige mexer nas regras.

import { describe, expect, it } from 'vitest'
import { GAME_CONTENT } from '.'
import { netWorth } from '../engine/assets'
import { canContinue } from '../engine/heir'
import { simulateMany } from '../test/player'
import type { GameState } from '../engine/types'

const N = 60

/**
 * Longevidade precisa de mais vidas que o resto.
 *
 * Com 60 vidas a mediana da idade de morte anda em degraus de anos inteiros:
 * a mesma afirmação media 5 numa leva e 7 na seguinte sem nada ter mudado no
 * jogo. Medido em 150 vidas por jogador, a diferença assenta em ~1,7 ano e
 * para de depender de quais sementes caíram na amostra.
 */
const N_LONGEVIDADE = 150

function media(valores: number[]): number {
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}

function mediana(valores: number[]): number {
  const ordenado = [...valores].sort((a, b) => a - b)
  return ordenado[Math.floor(ordenado.length / 2)] ?? 0
}

function levas(actions: string[], social: string[] = []): {
  ruim: GameState[]
  bom: GameState[]
} {
  return {
    ruim: simulateMany(N, GAME_CONTENT, { actions, social, policy: 'first' }),
    bom: simulateMany(N, GAME_CONTENT, { actions, social, policy: 'sensible' }),
  }
}

describe('escolher bem muda o dinheiro', () => {
  const { ruim, bom } = levas(['Cursar mais um ano', 'Procurar emprego', 'Se dedicar ao trabalho'])

  it('o jogador que não se sabota termina com mais patrimônio', () => {
    // A afirmação já foi "1,25x" e não sobrevivia à própria amostra: a
    // mediana de patrimônio tem cauda pesada, e a mesma comparação mede 1,77
    // com 40 vidas, 1,14 com 60, 1,13 com 80 e 1,32 com 150. Qualquer número
    // fixo aqui é sorte da amostra; o que se sustenta é a DIREÇÃO.
    const patrimonioRuim = mediana(ruim.map(netWorth))
    expect(mediana(bom.map(netWorth))).toBeGreaterThan(patrimonioRuim)

    // E a estatística que não depende da cauda: mais da metade das vidas
    // sensatas passa a vida MEDIANA de quem se sabota.
    const acima = bom.filter((s) => netWorth(s) > patrimonioRuim).length
    expect(acima / N).toBeGreaterThan(0.5)
  })

  it('e quase não morre no vermelho', () => {
    // Medido: 11 em 100 contra 2. Morrer devendo é quase inteiramente
    // consequência de escolha, não de a economia ser dura — que é a forma
    // certa. Se fosse o contrário, o jogo estaria punindo por existir.
    const vermelhoRuim = ruim.filter((s) => netWorth(s) < 0).length
    const vermelhoBom = bom.filter((s) => netWorth(s) < 0).length
    expect(vermelhoBom).toBeLessThanOrEqual(vermelhoRuim)
    expect(vermelhoBom / N).toBeLessThan(0.1)
  })
})

describe('mas não muda tudo', () => {
  const acoes = ['Procurar emprego']
  const ruim = simulateMany(N_LONGEVIDADE, GAME_CONTENT, { actions: acoes, policy: 'first' })
  const bom = simulateMany(N_LONGEVIDADE, GAME_CONTENT, { actions: acoes, policy: 'sensible' })

  it('a idade de morte depende pouco de escolha — e o pouco é o vício', () => {
    // Até a Fase 8 a resposta era "nada": 69,3 contra 71,0 anos, e a
    // longevidade saía inteira da curva de Gompertz e do teto de saúde da
    // idade. Os vícios são a primeira escolha do jogo que compra anos de
    // vida: 67,2 contra 71,7, com 49% dos personagens do jogador que se
    // sabota terminando alcoolistas contra 21% do jogador sensato.
    //
    // Continua sendo POUCO de propósito. Se a diferença passar de seis anos,
    // alguma escolha virou um botão de viver mais, e isso precisa ser
    // deliberado em vez de acontecer.
    const idade = (vidas: GameState[]): number => media(vidas.map((s) => s.character.deathAge ?? 0))
    expect(Math.abs(idade(bom) - idade(ruim))).toBeLessThanOrEqual(6)
  })
})

describe('a linhagem é alcançável para os dois', () => {
  const { ruim, bom } = levas(
    ['Procurar emprego', 'Procurar um relacionamento'],
    ['Pedir em casamento', 'Ter um filho', 'Conversar'],
  )

  it('mesmo o jogador que se sabota chega ao herdeiro com frequência', () => {
    expect(ruim.filter(canContinue).length / N).toBeGreaterThan(0.4)
  })

  it('e cuidar das escolhas ajuda, sem ser a única coisa que importa', () => {
    // Medido: 52 contra 61 em 100. A família depende mais de onde os pontos de
    // ação vão do que de escolher bem dentro do evento.
    expect(bom.filter(canContinue).length).toBeGreaterThanOrEqual(ruim.filter(canContinue).length)
  })
})
