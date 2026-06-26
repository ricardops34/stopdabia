import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

const KEY = 'blocked:nicknames'

function emailFromJwt(token: string): string | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    return payload.email ?? payload.user_metadata?.email ?? null
  } catch { return null }
}

const OWNER_EMAILS = ['ricardo.patay.sotomayor@gmail.com', 'ricardopataysotomayor@gmail.com', 'beatrizzangirolamisotomayor@gmail.com']

function isAdmin(req: NextRequest): boolean {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return false
  const email = emailFromJwt(token)
  return !!email && OWNER_EMAILS.includes(email)
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const redis = getRedis()
  const list = await redis.smembers(KEY)
  return NextResponse.json({ list: list.sort() })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { term } = await req.json() as { term?: string }
  if (!term || term.trim().length < 2) return NextResponse.json({ error: 'Termo inválido' }, { status: 400 })
  const redis = getRedis()
  await redis.sadd(KEY, term.trim().toLowerCase())
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { term } = await req.json() as { term?: string }
  if (!term) return NextResponse.json({ error: 'Termo inválido' }, { status: 400 })
  const redis = getRedis()
  await redis.srem(KEY, term)
  return NextResponse.json({ ok: true })
}
