import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'
import { DEFAULT_CONFIG, type GameConfig } from '@/lib/game/runtime-config'

const OWNER_EMAILS = ['ricardo.patay.sotomayor@gmail.com', 'ricardopataysotomayor@gmail.com']

const KEYS: (keyof GameConfig)[] = [
  'easterChancePlaying',
  'easterIntervalPlaying',
  'easterChanceCountdown',
  'easterChanceReview',
  'easterChanceReviewPerfect',
]

function emailFromJwt(token: string): string | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    return payload.email ?? payload.user_metadata?.email ?? null
  } catch {
    return null
  }
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const keyParam = req.nextUrl.searchParams.get('key')
  const envKey = process.env.ADMIN_KEY
  if (envKey && keyParam === envKey) return true

  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return false
  const email = emailFromJwt(token)
  return !!email && OWNER_EMAILS.includes(email)
}

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
  if (!await isAdmin(req)) {
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
