// Os invariantes do spec eram verificados por grep na mao, a cada fase, por
// quem lembrasse de rodar. Isso nao e uma garantia: e um habito. Aqui eles
// passam a quebrar o CI.

import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = new URL('.', import.meta.url).pathname

function filesUnder(dir: string, extensions: string[]): string[] {
  const out: string[] = []
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(full)
    }
  }
  walk(join(ROOT, dir))
  return out
}

/** Sem comentarios de linha e de bloco, para nao acusar prosa que cita o proibido. */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function short(file: string): string {
  return relative(ROOT, file)
}

// Este arquivo cita os proibidos por dever de oficio; ele mesmo fica de fora.
const SELF = 'architecture.test.ts'
const SOURCE = filesUnder('.', ['.ts', '.vue']).filter(
  (f) => !f.endsWith('.d.ts') && !f.endsWith(SELF),
)
const ENGINE = filesUnder('engine', ['.ts']).filter((f) => !f.endsWith('.test.ts'))
const CONTENT = filesUnder('content', ['.ts']).filter((f) => !f.endsWith('.test.ts'))

describe('invariantes de arquitetura', () => {
  it('nenhum `any` em todo o src', () => {
    const offenders = SOURCE.filter((file) => /(:|<|\bas\s+)\s*any\b/.test(code(file))).map(short)
    expect(offenders).toEqual([])
  })

  it('Math.random so existe no rng.ts', () => {
    const offenders = SOURCE.filter(
      (file) => code(file).includes('Math.random') && !file.endsWith('engine/rng.ts'),
    ).map(short)
    expect(offenders).toEqual([])
  })

  it('o engine nao importa o conteudo — e o ContentPack que os une', () => {
    const offenders = ENGINE.filter((file) => /from\s+'[^']*\/content\//.test(code(file))).map(short)
    expect(offenders).toEqual([])
  })

  it('nem o engine nem o conteudo importam Vue', () => {
    const offenders = [...ENGINE, ...CONTENT]
      .filter((file) => /from\s+'(vue|pinia)'/.test(code(file)))
      .map(short)
    expect(offenders).toEqual([])
  })

  it('o conteudo nao importa o store nem componentes', () => {
    const offenders = CONTENT.filter((file) =>
      /from\s+'[^']*\/(stores|components|views)\//.test(code(file)),
    ).map(short)
    expect(offenders).toEqual([])
  })

  it('as regras de jogo nao vivem no store', () => {
    // O store adapta o engine ao Vue e persiste. Se ele passar a sortear ou a
    // mexer em stat direto, a fronteira que sustenta os testes acabou.
    const store = code(join(ROOT, 'stores/game.ts'))
    expect(store).not.toMatch(/Math\.random|createRng|\bsetStat\b|applyEffects/)
  })

  it('sao os arquivos esperados — o teste nao ficou lendo uma pasta vazia', () => {
    expect(SOURCE.length).toBeGreaterThan(40)
    expect(ENGINE.length).toBeGreaterThan(10)
    expect(CONTENT.length).toBeGreaterThan(10)
  })
})
