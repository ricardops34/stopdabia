import { NextRequest, NextResponse } from 'next/server'
import { getTopRanking, type GameMode } from '@/lib/redis/ranking'

export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get('mode') ?? 'multi') as GameMode
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '10'), 50)

  try {
    const ranking = await getTopRanking(mode, limit)
    console.log('[ranking] mode:', mode, '| entries:', ranking.length, '| data:', JSON.stringify(ranking.slice(0, 3)))
    return NextResponse.json({ mode, ranking })
  } catch (err) {
    console.error('[ranking] Redis unavailable:', err)
    return NextResponse.json({ mode, ranking: [], error: 'Redis unavailable' }, { status: 503 })
  }
}
