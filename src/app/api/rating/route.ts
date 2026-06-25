import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

export async function POST(req: NextRequest) {
  const { stars } = await req.json() as { stars: number }
  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  try {
    const redis = getRedis()
    await Promise.all([
      redis.incrby('rating:total', stars),
      redis.incr('rating:count'),
    ])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
