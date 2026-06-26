import { readdirSync, statSync, writeFileSync } from 'fs'
import { join, extname, relative } from 'path'
import sharp from 'sharp'

const PUBLIC_DIR = 'C:/Ricardo/stop/public'
const SKIP_DIRS = new Set(['imagens de referencia'])
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

const RULES = [
  { test: (p) => /^icons\/btn_.*\.png$/i.test(p), maxWidth: 256, maxHeight: 256, format: 'png' },
  { test: (p) => /^icons\/letra_.*\.png$/i.test(p), maxWidth: 256, maxHeight: 256, format: 'png' },
  { test: (p) => /^icons\/bau_.*\.png$/i.test(p), maxWidth: 512, maxHeight: 512, format: 'png' },
  { test: (p) => /^aviso\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^cachorra\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^avatar\/.*\.png$/i.test(p), maxWidth: 256, maxHeight: 256, format: 'png' },
  { test: (p) => /^contagem\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^easter\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^letras_sorteio\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^trail\/node_.*\.png$/i.test(p), maxWidth: 256, maxHeight: 256, format: 'png' },
  { test: (p) => /^trail\/secao_.*\.png$/i.test(p), maxWidth: 1024, maxHeight: 512, format: 'png' },
  { test: (p) => /^trail\/fio.*\.png$/i.test(p), maxWidth: 512, maxHeight: 512, format: 'png' },
  { test: (p) => /^imagens\/logo-home\.png$/i.test(p), maxWidth: 900, maxHeight: 900, format: 'png' },
  { test: (p) => /^imagens\/.*\.png$/i.test(p), maxWidth: 768, maxHeight: 768, format: 'png' },
  { test: (p) => /^logo\.png$/i.test(p), maxWidth: 512, maxHeight: 512, format: 'png' },
  { test: (p) => /^favico\.png$/i.test(p), maxWidth: 256, maxHeight: 256, format: 'png' },
  { test: (p) => /^ui\/barra_fundo\.png$/i.test(p), maxWidth: 1024, maxHeight: 96, format: 'png' },
  { test: (p) => /^agradecimentos\/.*\.(jpg|jpeg)$/i.test(p), maxWidth: 1600, maxHeight: 1600, format: 'jpeg' },
  { test: () => true, maxWidth: 1024, maxHeight: 1024, format: 'source' },
]

function findImages(dir) {
  const results = []
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      results.push(...findImages(full))
      continue
    }
    if (IMAGE_EXTS.has(extname(name).toLowerCase())) results.push(full)
  }
  return results
}

function getRule(relPath) {
  const normalized = relPath.replace(/\\/g, '/')
  return RULES.find((rule) => rule.test(normalized))
}

function fmtKB(bytes) {
  return `${Math.round(bytes / 1024)}KB`
}

async function optimize(file) {
  const rel = relative(PUBLIC_DIR, file).replace(/\\/g, '/')
  const rule = getRule(rel)
  const before = statSync(file).size
  const image = sharp(file, { animated: false })
  const meta = await image.metadata()

  const pipeline = image.resize({
    width: rule.maxWidth,
    height: rule.maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  })

  let out
  const sourceExt = extname(file).toLowerCase()

  if (rule.format === 'jpeg' || sourceExt === '.jpg' || sourceExt === '.jpeg') {
    out = await pipeline.jpeg({ quality: 76, progressive: true, mozjpeg: true }).toBuffer()
  } else if (sourceExt === '.webp') {
    out = await pipeline.webp({ quality: 78, effort: 6 }).toBuffer()
  } else {
    out = await pipeline.png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 }).toBuffer()
  }

  if (out.length < before) {
    writeFileSync(file, out)
    return {
      rel,
      before,
      after: out.length,
      resized: `${meta.width}x${meta.height}`,
      saved: before - out.length,
      changed: true,
    }
  }

  return {
    rel,
    before,
    after: before,
    resized: `${meta.width}x${meta.height}`,
    saved: 0,
    changed: false,
  }
}

const files = findImages(PUBLIC_DIR)
let totalBefore = 0
let totalAfter = 0
let changed = 0
const topSavings = []

console.log(`Encontrados ${files.length} arquivos de imagem em runtime\\n`)

for (const file of files) {
  try {
    const result = await optimize(file)
    totalBefore += result.before
    totalAfter += result.after
    if (result.changed) {
      changed += 1
      topSavings.push(result)
      console.log(`✓ ${result.rel.padEnd(48)} ${fmtKB(result.before)} -> ${fmtKB(result.after)}`)
    }
  } catch (error) {
    console.error(`✗ ${relative(PUBLIC_DIR, file)}: ${error.message}`)
  }
}

topSavings.sort((a, b) => b.saved - a.saved)

console.log(`\\n${changed} arquivos otimizados`)
console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`)
console.log(`Economia: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)}MB\\n`)
console.log('Maiores reducoes:')
for (const item of topSavings.slice(0, 20)) {
  console.log(`- ${item.rel} (-${fmtKB(item.saved)})`)
}
