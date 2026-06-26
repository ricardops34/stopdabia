import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

const OWNER_EMAILS = ['ricardo.patay.sotomayor@gmail.com', 'ricardopataysotomayor@gmail.com']

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

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return false

  const email = emailFromJwt(token)
  return !!email && OWNER_EMAILS.includes(email)
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()
  const emailSeen = token ? emailFromJwt(token) : null
  const adminOk = await isAdmin(req)
  if (!adminOk) {
    return NextResponse.json({
      error: 'Unauthorized',
      debug: { emailSeen, inOwnerList: emailSeen ? OWNER_EMAILS.includes(emailSeen) : false }
    }, { status: 401 })
  }

  try {
    const redis = getRedis()

    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }

    const [totalGames, soloGames, multiGames, uniquePlayers, ratingTotal, ratingCount, ...dailyCounts] = await Promise.all([
      redis.get('stats:games:total'),
      redis.get('stats:games:solo'),
      redis.get('stats:games:multi'),
      redis.pfcount('stats:players'),
      redis.get('rating:total'),
      redis.get('rating:count'),
      ...days.map((d) => redis.get(`stats:daily:${d}`)),
    ])

    const daily = days.map((date, i) => ({ date, games: Number(dailyCounts[i] ?? 0) }))
    const ratingAvg = Number(ratingCount ?? 0) > 0
      ? Math.round((Number(ratingTotal) / Number(ratingCount)) * 10) / 10
      : null

    return NextResponse.json({
      total: Number(totalGames ?? 0),
      solo: Number(soloGames ?? 0),
      multi: Number(multiGames ?? 0),
      uniquePlayers: Number(uniquePlayers ?? 0),
      ratingAvg,
      ratingCount: Number(ratingCount ?? 0),
      daily,
    })
  } catch {
    // Redis indisponível — retorna zeros para o admin funcionar mesmo assim
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    return NextResponse.json({
      total: 0, solo: 0, multi: 0, uniquePlayers: 0,
      ratingAvg: null, ratingCount: 0,
      daily: days.map((date) => ({ date, games: 0 })),
      redisDown: true,
    })
  }
}
