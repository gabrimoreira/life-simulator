// Gera os ícones PNG do PWA a partir de SVG inline. Roda no build, nunca em
// runtime — o jogo não faz uma única chamada de rede depois de instalado.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/icons')

const PAPER = '#F4F0E6'
const INK = '#1E1B16'
const OCHRE = '#A8621B'

/** `inset` é a margem de segurança das áreas maskable (mínimo 10% de cada lado). */
const card = (inset) => {
  const size = 512
  const x = size * inset
  const w = size * (1 - inset * 2)
  const h = w * 1.1
  const y = (size - h) / 2
  const line = (ratio, widthRatio, color, stroke) =>
    `<line x1="${x + w * 0.14}" y1="${y + h * ratio}" x2="${x + w * 0.14 + w * 0.72 * widthRatio}" y2="${y + h * ratio}" stroke="${color}" stroke-width="${stroke}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="${size * 0.045}"/>
  ${line(0.26, 1, OCHRE, size * 0.045)}
  ${line(0.47, 1, INK, size * 0.028)}
  ${line(0.62, 0.62, INK, size * 0.028)}
  ${line(0.77, 0.85, INK, size * 0.028)}
</svg>`
}

const targets = [
  { file: 'icon-192.png', size: 192, svg: card(0.14) },
  { file: 'icon-512.png', size: 512, svg: card(0.14) },
  // Maskable: conteúdo dentro dos 80% centrais, para o Android poder recortar.
  { file: 'icon-maskable-512.png', size: 512, svg: card(0.26) },
]

await mkdir(outDir, { recursive: true })

for (const { file, size, svg } of targets) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
  await writeFile(resolve(outDir, file), png)
  console.log(`✓ ${file} (${size}×${size})`)
}
