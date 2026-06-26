import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis/client'

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

function parseInfo(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of raw.split('\r\n')) {
    if (!line || line.startsWith('#')) continue
    const [k, ...rest] = line.split(':')
    result[k.trim()] = rest.join(':').trim()
  }
  return result
}

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${seconds % 60}s`
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const redis = getRedis()
    const [infoRaw, dbSize] = await Promise.all([
      redis.info(),
      redis.dbsize(),
    ])

    const info = parseInfo(infoRaw)

    return NextResponse.json({
      version:        info['redis_version'] ?? '?',
      uptime:         fmtUptime(Number(info['uptime_in_seconds'] ?? 0)),
      uptimeSeconds:  Number(info['uptime_in_seconds'] ?? 0),
      memUsed:        info['used_memory_human'] ?? '?',
      memPeak:        info['used_memory_peak_human'] ?? '?',
      aofEnabled:     info['aof_enabled'] === '1',
      aofStatus:      info['aof_last_bgrewrite_status'] ?? '?',
      aofSize:        info['aof_current_size'] ? `${(Number(info['aof_current_size']) / 1024).toFixed(1)} KB` : '?',
      rdbStatus:      info['rdb_last_bgsave_status'] ?? '?',
      totalKeys:      dbSize,
      connectedClients: Number(info['connected_clients'] ?? 0),
      totalCommandsProcessed: Number(info['total_commands_processed'] ?? 0),
      loading:        info['loading'] === '1',
    })
  } catch {
    return NextResponse.json({ error: 'Redis indisponível' }, { status: 503 })
  }
}
