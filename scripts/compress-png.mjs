import { readdirSync, statSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = 'c:/Ricardo/stop/public'
const SKIP_DIRS = ['imagens de referencia']

let totalBefore = 0
let totalAfter = 0
let count = 0

function findPngs(dir) {
  const results = []
  for (const f of readdirSync(dir)) {
    if (SKIP_DIRS.includes(f)) continue
    const full = join(dir, f)
    const stat = statSync(full)
    if (stat.isDirectory()) results.push(...findPngs(full))
    else if (extname(f).toLowerCase() === '.png') results.push(full)
  }
  return results
}

const pngs = findPngs(PUBLIC_DIR)
console.log(`Encontrados ${pngs.length} arquivos PNG\n`)

for (const img of pngs) {
  const before = statSync(img).size
  try {
    const buf = await sharp(img)
      .png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 })
      .toBuffer()

    if (buf.length < before) {
      writeFileSync(img, buf)
      totalBefore += before
      totalAfter += buf.length
      const pct = Math.round((1 - buf.length / before) * 100)
      const rel = img.replace(PUBLIC_DIR, '').substring(1)
      console.log(`✓ ${rel.padEnd(65)} ${(before/1024).toFixed(0)}KB → ${(buf.length/1024).toFixed(0)}KB (-${pct}%)`)
      count++
    } else {
      totalBefore += before
      totalAfter += before
    }
  } catch (e) {
    console.error(`✗ ${img}: ${e.message}`)
  }
}

const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)
console.log(`\n${count} arquivos comprimidos`)
console.log(`Total: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB  (economizados ${savedMB}MB)`)
