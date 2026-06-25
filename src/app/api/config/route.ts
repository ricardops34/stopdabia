import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'
import { DEFAULT_CONFIG, type GameConfig } from '@/lib/game/runtime-config'

const KEYS: (keyof GameConfig)[] = [
  'easterChancePlaying',
  'easterIntervalPlaying',
  'easterChanceCountdown',
  'easterChanceReview',
  'easterChanceReviewPerfect',
]

export async function GET() {
  try {
    const redis = getRedis()
    const values = await Promise.all(KEYS.map((k) => redis.get(`config:${k}`)))
    const config: GameConfig = { ...DEFAULT_CONFIG }
    KEYS.forEach((k, i) => {
      if (values[i] !== null) (config as unknown as Record<string, number>)[k] = Number(values[i])
    })
    return NextResponse.json(config)
  } catch {
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json() as Partial<GameConfig>
  const redis = getRedis()
  await Promise.all(
    KEYS.filter((k) => body[k] !== undefined)
      .map((k) => redis.set(`config:${k}`, String(body[k])))
  )
  return NextResponse.json({ ok: true })
}
