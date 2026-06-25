import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  const envKey = process.env.ADMIN_KEY
  console.log('[stats] ADMIN_KEY definida:', !!envKey, '| tamanho:', envKey?.length ?? 0, '| key recebida tamanho:', key?.length ?? 0, '| match:', key === envKey)
  if (key !== envKey) {
    return NextResponse.json({ error: 'Unauthorized', debug: { envKeyDefined: !!envKey, envKeyLength: envKey?.length ?? 0, receivedKeyLength: key?.length ?? 0 } }, { status: 401 })
  }

  const redis = getRedis()

  // Últimos 30 dias
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
}
