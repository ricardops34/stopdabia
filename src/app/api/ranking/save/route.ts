import { NextRequest, NextResponse } from 'next/server'
import { saveGameResult, type GameMode } from '@/lib/redis/ranking'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    mode: GameMode
    nickname: string
    score: number
    letter: string
    categories: number
    answeredCorrect: number
  }

  try {
    await saveGameResult(body.mode, {
      id: randomUUID(),
      nickname: body.nickname,
      score: body.score,
      letter: body.letter,
      categories: body.categories,
      answeredCorrect: body.answeredCorrect,
      createdAt: Date.now(),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ranking/save]', err)
    return NextResponse.json({ ok: false, error: 'Redis unavailable' }, { status: 503 })
  }
}
