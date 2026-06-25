import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = new URL('../public', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const MAX_WIDTH = 1200
const QUALITY = 78

let totalBefore = 0
let totalAfter = 0

function findImages(dir) {
  const results = []
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...findImages(full))
    } else if (['.jpg', '.jpeg'].includes(extname(f).toLowerCase())) {
      results.push(full)
    }
  }
  return results
}

const images = findImages(PUBLIC_DIR)
console.log(`Encontradas ${images.length} imagens JPEG\n`)

for (const img of images) {
  const before = statSync(img).size
  try {
    const buf = await sharp(img)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true })
      .toBuffer()

    if (buf.length < before) {
      const { writeFileSync } = await import('fs')
      writeFileSync(img, buf)
      totalBefore += before
      totalAfter += buf.length
      const pct = Math.round((1 - buf.length / before) * 100)
      console.log(`✓ ${img.replace(PUBLIC_DIR, '').padEnd(60)} ${(before/1024).toFixed(0)}KB → ${(buf.length/1024).toFixed(0)}KB (-${pct}%)`)
    } else {
      totalBefore += before
      totalAfter += before
      console.log(`- ${img.replace(PUBLIC_DIR, '').padEnd(60)} ${(before/1024).toFixed(0)}KB (já otimizado)`)
    }
  } catch (e) {
    console.error(`✗ ${img}: ${e.message}`)
  }
}

console.log(`\nTotal: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB (-${Math.round((1-totalAfter/totalBefore)*100)}%)`)
