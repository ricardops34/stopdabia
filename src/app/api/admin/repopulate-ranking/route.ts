import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'
import { createClient } from '@supabase/supabase-js'

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
  const email = emailFromJwt(token)
  return !!email && OWNER_EMAILS.includes(email)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Carrega todo o histórico: trail_progress + perfis
  const { data: progress, error } = await supabase
    .from('trail_progress')
    .select('user_id, letter, score, played_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!progress?.length) return NextResponse.json({ ok: true, migrated: 0 })

  // Carrega perfis para obter nickname e avatar
  const userIds = [...new Set(progress.map((r) => r.user_id as string))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_id')
    .in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [
      p.id as string,
      { nickname: p.nickname as string, avatar_id: p.avatar_id as number },
    ])
  )

  const redis = getRedis()

  // Para cada entrada: zincrby no ranking:solo por nickname (score acumulado por letra)
  // Primeiro, agrupa por user_id somando os scores
  const totals: Record<string, { score: number; avatar?: string }> = {}
  for (const row of progress) {
    const profile = profileMap[row.user_id as string]
    if (!profile?.nickname) continue
    const key = profile.nickname
    if (!totals[key]) {
      const avatarPath = `/avatar/avatar_${String(profile.avatar_id ?? 1).padStart(2, '0')}.png`
      totals[key] = { score: 0, avatar: avatarPath }
    }
    totals[key].score += Number(row.score ?? 0)
  }

  // Zera ranking:solo e reconstrói
  await redis.del('ranking:solo')
  let migrated = 0
  for (const [nickname, { score, avatar }] of Object.entries(totals)) {
    if (score <= 0) continue
    await redis.zadd('ranking:solo', score, nickname)
    if (avatar) await redis.hset(`player:${nickname}`, { avatar })
    migrated++
  }

  return NextResponse.json({ ok: true, migrated, total: progress.length })
}
