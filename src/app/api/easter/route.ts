import { readdirSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  const publicDir = join(process.cwd(), 'public')

  const audioFiles = readdirSync(join(publicDir, 'audio', 'easter'))
    .filter((f) => f.endsWith('.mp3') || f.endsWith('.wav'))
    .sort()
    .map((f) => `/audio/easter/${f}`)

  const imageFiles = readdirSync(join(publicDir, 'easter'))
    .filter((f) => f.match(/\.(png|jpg|webp)$/i))
    .sort()
    .map((f) => `/easter/${f}`)

  return NextResponse.json({ audio: audioFiles, images: imageFiles })
}
