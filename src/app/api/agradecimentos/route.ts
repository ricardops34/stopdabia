import { readdirSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  const dir = join(process.cwd(), 'public', 'agradecimentos')
  const images = readdirSync(dir)
    .filter((f) => f.match(/\.(jpg|jpeg|png|webp)$/i))
    .sort()
    .map((f) => `/agradecimentos/${f}`)
  return NextResponse.json({ images })
}
