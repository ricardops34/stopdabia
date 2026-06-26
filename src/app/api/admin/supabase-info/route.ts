import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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
  return OWNER_EMAILS.includes(emailFromJwt(token) ?? '')
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sb = await createServerClient()
    const start = Date.now()

    const [profilesRes, progressRes, matchesRes] = await Promise.all([
      sb.from('profiles').select('id', { count: 'exact', head: true }),
      sb.from('trail_progress').select('id', { count: 'exact', head: true }),
      sb.from('match_results').select('id', { count: 'exact', head: true }),
    ])

    const latency = Date.now() - start

    return NextResponse.json({
      ok: true,
      latencyMs: latency,
      profiles:      profilesRes.count  ?? 0,
      trailProgress: progressRes.count  ?? 0,
      matchResults:  matchesRes.count   ?? 0,
      profilesError: profilesRes.error?.message ?? null,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 503 })
  }
}
