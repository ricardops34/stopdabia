import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

const BANNED_KEY = 'banned:players'

function emailFromJwt(token: string): string | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    return payload.email ?? payload.user_metadata?.email ?? null
  } catch { return null }
}

const OWNER_EMAILS = ['ricardo.patay.sotomayor@gmail.com', 'ricardopataysotomayor@gmail.com']

function isAdmin(req: NextRequest): boolean {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return false
  return OWNER_EMAILS.includes(emailFromJwt(token) ?? '')
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const redis = getRedis()
  const list = await redis.smembers(BANNED_KEY)
  return NextResponse.json({ list: list.sort() })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { nickname } = await req.json() as { nickname?: string }
  if (!nickname?.trim()) return NextResponse.json({ error: 'Nickname inválido' }, { status: 400 })
  const redis = getRedis()
  const nm = nickname.trim().toLowerCase()
  await redis.sadd(BANNED_KEY, nm)
  // Remove do ranking
  await redis.zrem('ranking:solo', nickname.trim())
  await redis.zrem('ranking:multi', nickname.trim())
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { nickname } = await req.json() as { nickname?: string }
  if (!nickname) return NextResponse.json({ error: 'Nickname inválido' }, { status: 400 })
  const redis = getRedis()
  await redis.srem(BANNED_KEY, nickname.toLowerCase())
  return NextResponse.json({ ok: true })
}
