'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_CONFIG, type GameConfig } from '@/lib/game/runtime-config'
import { createClient, supabaseConfigured } from '@/lib/supabase/client'
import { signInWithGoogle } from '@/lib/supabase/auth'

interface Stats {
  total: number; solo: number; multi: number; uniquePlayers: number
  ratingAvg: number | null; ratingCount: number
  daily: { date: string; games: number }[]
  redisDown?: boolean
}
interface RankEntry { nickname: string; score: number; avatar?: string }
interface RedisInfo {
  version: string; uptime: string; uptimeSeconds: number
  memUsed: string; memPeak: string
  aofEnabled: boolean; aofStatus: string; aofSize: string
  rdbStatus: string; totalKeys: number
  connectedClients: number; totalCommandsProcessed: number; loading: boolean
}

const CONFIG_LABELS: { key: keyof GameConfig; label: string; isPercent: boolean; min: number; max: number; step: number }[] = [
  { key: 'easterChancePlaying',       label: 'Chance durante o jogo',                isPercent: true,  min: 0, max: 100, step: 5 },
  { key: 'easterIntervalPlaying',     label: 'Intervalo durante o jogo (seg)',        isPercent: false, min: 5, max: 60,  step: 5 },
  { key: 'easterChanceCountdown',     label: 'Chance no countdown',                  isPercent: true,  min: 0, max: 100, step: 5 },
  { key: 'easterChanceReview',        label: 'Chance na correção (normal)',           isPercent: true,  min: 0, max: 100, step: 5 },
  { key: 'easterChanceReviewPerfect', label: 'Chance na correção (acerto perfeito)', isPercent: true,  min: 0, max: 100, step: 5 },
]

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#0F3460', borderRadius: 16, padding: 16,
  border: '1px solid rgba(255,255,255,0.07)',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.45,
  textTransform: 'uppercase', marginBottom: 12, display: 'block',
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, opacity: 0.45, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: color ?? '#F8E7BF', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function AdminPage() {
  const [token, setToken]               = useState<string | null>(null)
  const [stats, setStats]               = useState<Stats | null>(null)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(true)
  const [config, setConfig]             = useState<GameConfig>({ ...DEFAULT_CONFIG })
  const [saving, setSaving]             = useState(false)
  const [saveMsg, setSaveMsg]           = useState('')
  const [blocked, setBlocked]           = useState<string[]>([])
  const [newTerm, setNewTerm]           = useState('')
  const [banned, setBanned]             = useState<string[]>([])
  const [players, setPlayers]           = useState<RankEntry[]>([])
  const [repopulating, setRepopulating] = useState(false)
  const [repopMsg, setRepopMsg]         = useState('')
  const [redisInfo, setRedisInfo]       = useState<RedisInfo | null>(null)
  const [sbInfo, setSbInfo]             = useState<{ ok: boolean; latencyMs: number; profiles: number; trailProgress: number; matchResults: number; error?: string } | null>(null)

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); setError('Supabase não configurado'); return }
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) { setToken(session.access_token); loadData(session.access_token) }
      else setLoading(false)
    })
  }, [])

  async function loadData(tk: string) {
    setLoading(true); setError('')
    try {
      const debugRes = await fetch('/api/admin/debug-token', { headers: { Authorization: `Bearer ${tk}` } })
      const debug = await debugRes.json() as { email?: string }

      const [statsRes, cfgRes, blockedRes, bannedRes, playersRes, redisRes, sbRes] = await Promise.all([
        fetch('/api/stats', { headers: { Authorization: `Bearer ${tk}` } }),
        fetch('/api/config'),
        fetch('/api/admin/blocked-nicknames', { headers: { Authorization: `Bearer ${tk}` } }),
        fetch('/api/admin/ban', { headers: { Authorization: `Bearer ${tk}` } }),
        fetch('/api/ranking?mode=solo&limit=50'),
        fetch('/api/admin/redis-info', { headers: { Authorization: `Bearer ${tk}` } }),
        fetch('/api/admin/supabase-info', { headers: { Authorization: `Bearer ${tk}` } }),
      ])

      if (!statsRes.ok) {
        let detail = ''
        try {
          const e = await statsRes.json() as { debug?: { emailSeen?: string } }
          detail = `email token: ${debug.email ?? 'n/a'} | stats viu: ${e.debug?.emailSeen ?? 'n/a'}`
        } catch { detail = `HTTP ${statsRes.status}` }
        setError(`Acesso negado. ${detail}`)
        setLoading(false); return
      }

      const statsData = await statsRes.json() as Stats
      setStats(statsData)
      if (cfgRes.ok) setConfig(await cfgRes.json() as GameConfig)
      if (blockedRes.ok) setBlocked((await blockedRes.json() as { list: string[] }).list)
      if (bannedRes.ok) setBanned((await bannedRes.json() as { list: string[] }).list)
      if (playersRes.ok) {
        const pd = await playersRes.json() as { ranking: RankEntry[] }
        setPlayers(pd.ranking ?? [])
      }
      if (redisRes.ok) setRedisInfo(await redisRes.json() as RedisInfo)
      if (sbRes.ok) setSbInfo(await sbRes.json() as typeof sbInfo)
    } catch { setError('Erro ao carregar') }
    setLoading(false)
  }

  async function saveConfig() {
    if (!token) return
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(config) })
      setSaveMsg(res.ok ? 'Salvo!' : 'Erro ao salvar')
    } catch { setSaveMsg('Erro ao salvar') }
    setSaving(false); setTimeout(() => setSaveMsg(''), 2000)
  }

  async function addBlockedTerm() {
    if (!token || newTerm.trim().length < 2) return
    const res = await fetch('/api/admin/blocked-nicknames', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ term: newTerm.trim() }) })
    if (res.ok) { setBlocked((p) => [...p, newTerm.trim().toLowerCase()].sort()); setNewTerm('') }
  }

  async function removeBlockedTerm(term: string) {
    if (!token) return
    const res = await fetch('/api/admin/blocked-nicknames', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ term }) })
    if (res.ok) setBlocked((p) => p.filter((t) => t !== term))
  }

  async function banPlayer(nickname: string) {
    if (!token) return
    const res = await fetch('/api/admin/ban', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nickname }) })
    if (res.ok) { setBanned((p) => [...p, nickname.toLowerCase()].sort()); setPlayers((p) => p.filter((e) => e.nickname !== nickname)) }
  }

  async function unbanPlayer(nickname: string) {
    if (!token) return
    const res = await fetch('/api/admin/ban', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nickname }) })
    if (res.ok) setBanned((p) => p.filter((t) => t !== nickname.toLowerCase()))
  }

  async function repopulateRanking() {
    if (!token) return
    setRepopulating(true); setRepopMsg('')
    const res = await fetch('/api/admin/repopulate-ranking', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json() as { ok?: boolean; migrated?: number; total?: number; error?: string }
    setRepopMsg(data.ok ? `✅ ${data.migrated} jogadores migrados (${data.total} registros)` : `❌ ${data.error ?? 'Erro'}`)
    setRepopulating(false)
  }

  const today      = new Date().toISOString().slice(0, 10)
  const todayGames = stats?.daily.find((d) => d.date === today)?.games ?? 0
  const weekGames  = stats?.daily.slice(-7).reduce((s, d) => s + d.games, 0) ?? 0
  const maxBar     = stats ? Math.max(...stats.daily.map((d) => d.games), 1) : 1

  if (loading) return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#FFD93D', fontWeight: 900 }}>Carregando…</p>
    </div>
  )

  if (!stats) return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
        <h1 style={{ color: '#FFD93D', fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>ADMIN</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>Faça login com o email do administrador para acessar.</p>
        {error && <p style={{ color: '#FF6B6B', fontSize: 13 }}>{error}</p>}
        <button onClick={signInWithGoogle} style={{ padding: '14px 0', borderRadius: 12, backgroundColor: '#FFD93D', color: '#0a1628', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer' }}>
          LOGIN COM GOOGLE
        </button>
      </div>
    </div>
  )

  return (
    <div className="admin-page" style={{ minHeight: '100dvh', backgroundColor: '#0a1628', color: '#F8E7BF', overflowY: 'auto' }}>
      <style>{`
        @media (min-width: 1024px) {
          .admin-page { position: fixed; inset: 0; left: 240px; right: 240px; overflow-y: auto; }
          .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .admin-full { grid-column: 1 / -1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#FFD93D', fontSize: 20, fontWeight: 900, letterSpacing: 2, margin: 0 }}>ADMIN — BIA STOP</h1>
        <button onClick={() => { setStats(null); setToken(null) }} style={{ padding: '6px 16px', borderRadius: 8, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          SAIR
        </button>
      </div>

      <div className="admin-grid" style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Redis warning */}
        {stats.redisDown && (
          <div className="admin-full" style={{ backgroundColor: 'rgba(255,107,107,0.1)', border: '1px solid #FF6B6B', borderRadius: 12, padding: '10px 16px' }}>
            <p style={{ color: '#FF6B6B', fontSize: 13, fontWeight: 700, margin: 0 }}>⚠️ Redis indisponível — verifique <code>REDIS_URL</code> na stack do Docker Swarm</p>
          </div>
        )}

        {/* ── COLUNA ESQUERDA: métricas ── */}

        {/* Cards de totais */}
        <div className="admin-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'HOJE',        value: todayGames,          color: '#4ECDC4' },
            { label: 'SEMANA',      value: weekGames,           color: '#FFD93D' },
            { label: 'TOTAL JOGOS', value: stats.total,         color: '#FF6B6B' },
            { label: 'JOGADORES',   value: stats.uniquePlayers, color: '#9B59B6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...CARD_STYLE, textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color, margin: 0 }}>{value.toLocaleString('pt-BR')}</p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, opacity: 0.5, margin: '4px 0 0', textTransform: 'uppercase' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Saúde dos serviços ── */}
        <div className="admin-full" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Redis */}
          <div style={{ ...CARD_STYLE, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: redisInfo ? '#95E06C' : '#FF6B6B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.45, textTransform: 'uppercase' }}>Redis</span>
              {redisInfo && <span style={{ fontSize: 10, opacity: 0.35, marginLeft: 'auto' }}>v{redisInfo.version}</span>}
            </div>
            {redisInfo ? (
              <>
                <Row label="Uptime"       value={redisInfo.uptime} />
                <Row label="Memória"      value={`${redisInfo.memUsed} / pico ${redisInfo.memPeak}`} />
                <Row label="Chaves"       value={redisInfo.totalKeys.toLocaleString('pt-BR')} />
                <Row label="AOF"          value={redisInfo.aofEnabled ? '✅ ativo' : '❌ desligado'} color={redisInfo.aofEnabled ? '#95E06C' : '#FF6B6B'} />
                <Row label="AOF status"   value={redisInfo.aofStatus} color={redisInfo.aofStatus === 'ok' ? '#95E06C' : '#FF6B6B'} />
                <Row label="Arquivo AOF"  value={redisInfo.aofSize} />
                <Row label="Clientes"     value={String(redisInfo.connectedClients)} />
                {redisInfo.loading && <p style={{ color: '#FFD93D', fontSize: 11, fontWeight: 700, margin: 0 }}>⚠️ Carregando dados do disco…</p>}
              </>
            ) : (
              <p style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 700, margin: 0 }}>Indisponível</p>
            )}
          </div>

          {/* Supabase */}
          <div style={{ ...CARD_STYLE, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sbInfo?.ok ? '#95E06C' : '#FF6B6B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.45, textTransform: 'uppercase' }}>Supabase</span>
              {sbInfo?.ok && <span style={{ fontSize: 10, opacity: 0.35, marginLeft: 'auto' }}>{sbInfo.latencyMs}ms</span>}
            </div>
            {sbInfo?.ok ? (
              <>
                <Row label="Usuários"        value={sbInfo.profiles.toLocaleString('pt-BR')} />
                <Row label="Progresso trilha" value={sbInfo.trailProgress.toLocaleString('pt-BR')} />
                <Row label="Partidas multi"  value={sbInfo.matchResults.toLocaleString('pt-BR')} />
                <Row label="Latência"        value={`${sbInfo.latencyMs} ms`} color={sbInfo.latencyMs < 200 ? '#95E06C' : sbInfo.latencyMs < 600 ? '#FFD93D' : '#FF6B6B'} />
              </>
            ) : sbInfo ? (
              <p style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 700, margin: 0 }}>{sbInfo.error ?? 'Erro de conexão'}</p>
            ) : (
              <p style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 700, margin: 0 }}>Indisponível</p>
            )}
          </div>
        </div>

        {/* Gráfico + modo de jogo */}
        <div style={CARD_STYLE}>
          <span style={SECTION_LABEL}>Últimos 30 dias</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
            {stats.daily.map(({ date, games }) => {
              const h = Math.round((games / maxBar) * 80)
              const isToday = date === today
              return (
                <div key={date} title={`${date}: ${games}`} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: Math.max(h, games > 0 ? 3 : 1), borderRadius: 2, backgroundColor: isToday ? '#FFD93D' : '#4ECDC4', opacity: isToday ? 1 : 0.65 }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, opacity: 0.35, fontSize: 10 }}>
            <span>{stats.daily[0]?.date.slice(5)}</span>
            <span style={{ color: '#FFD93D', opacity: 1 }}>hoje</span>
          </div>

          {/* Solo vs Multi */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {[{ label: 'Solo', value: stats.solo, color: '#FF6B6B' }, { label: 'Multiplayer', value: stats.multi, color: '#4ECDC4' }].map(({ label, value, color }) => {
              const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
              return (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{value.toLocaleString('pt-BR')} <span style={{ opacity: 0.4 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, backgroundColor: '#16213E', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Avaliação */}
          {stats.ratingAvg !== null && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#FFD93D' }}>{stats.ratingAvg.toFixed(1)}</span>
              <div>
                <div style={{ fontSize: 18 }}>{'⭐'.repeat(Math.round(stats.ratingAvg))}</div>
                <div style={{ fontSize: 11, opacity: 0.4 }}>{stats.ratingCount.toLocaleString('pt-BR')} avaliações</div>
              </div>
            </div>
          )}
        </div>

        {/* Jogadores no ranking */}
        <div style={{ ...CARD_STYLE, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
          <span style={SECTION_LABEL}>Jogadores Solo ({players.length})</span>
          <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
            {players.length === 0
              ? <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center' }}>Sem dados no ranking</p>
              : players.map((p, i) => {
                const isBanned = banned.includes(p.nickname.toLowerCase())
                return (
                  <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: isBanned ? 0.4 : 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', minWidth: 24 }}>#{i + 1}</span>
                    {p.avatar
                      ? <img src={p.avatar} alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#16213E', flexShrink: 0 }} />
                    }
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isBanned ? 'line-through' : 'none' }}>{p.nickname}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#FFD93D', flexShrink: 0 }}>{p.score.toLocaleString('pt-BR')}</span>
                    {isBanned
                      ? <button onClick={() => unbanPlayer(p.nickname)} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #95E06C', backgroundColor: 'transparent', color: '#95E06C', cursor: 'pointer', flexShrink: 0 }}>DESBANIR</button>
                      : <button onClick={() => banPlayer(p.nickname)} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #FF6B6B', backgroundColor: 'transparent', color: '#FF6B6B', cursor: 'pointer', flexShrink: 0 }}>BANIR</button>
                    }
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* ── COLUNA DIREITA: configurações ── */}

        {/* Easter Egg */}
        <div style={CARD_STYLE}>
          <span style={SECTION_LABEL}>Easter Egg — Parâmetros</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CONFIG_LABELS.map(({ key: k, label, isPercent, min, max: maxV, step }) => {
              const raw = isPercent ? Math.round((config[k] as number) * 100) : (config[k] as number)
              return (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#FFD93D' }}>{isPercent ? `${raw}%` : `${raw}s`}</span>
                  </div>
                  <input type="range" min={min} max={maxV} step={step} value={raw} onChange={(e) => setConfig((p) => ({ ...p, [k]: isPercent ? Number(e.target.value) / 100 : Number(e.target.value) }))} style={{ width: '100%', accentColor: '#FFD93D', cursor: 'pointer' }} />
                </div>
              )
            })}
          </div>
          <button onClick={saveConfig} disabled={saving} style={{ marginTop: 16, width: '100%', padding: '11px 0', borderRadius: 10, backgroundColor: saving ? '#444' : saveMsg === 'Salvo!' ? '#95E06C' : '#FFD93D', color: '#0a1628', fontSize: 13, fontWeight: 900, border: 'none', cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'SALVANDO…' : saveMsg || 'SALVAR PARÂMETROS'}
          </button>
        </div>

        {/* Nicknames bloqueados */}
        <div style={CARD_STYLE}>
          <span style={SECTION_LABEL}>Nicknames Bloqueados ({blocked.length})</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input type="text" placeholder="Adicionar termo…" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBlockedTerm()} maxLength={40}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: '#16213E', border: '1px solid rgba(255,255,255,0.1)', color: '#F8E7BF', outline: 'none' }} />
            <button onClick={addBlockedTerm} disabled={newTerm.trim().length < 2} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#FFD93D', color: '#0a1628', fontSize: 12, fontWeight: 900, border: 'none', cursor: 'pointer', opacity: newTerm.trim().length < 2 ? 0.4 : 1 }}>+ ADD</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 130, overflowY: 'auto' }}>
            {blocked.length === 0
              ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Nenhum termo bloqueado</p>
              : blocked.map((term) => (
                <div key={term} style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{term}</span>
                  <button onClick={() => removeBlockedTerm(term)} style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', fontSize: 14, fontWeight: 900, padding: 0 }}>×</button>
                </div>
              ))
            }
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 8 }}>Termos parciais — &quot;idiot&quot; bloqueia &quot;idiotão&quot;, etc.</p>
        </div>

        {/* Banidos */}
        {banned.length > 0 && (
          <div style={CARD_STYLE}>
            <span style={SECTION_LABEL}>Jogadores Banidos ({banned.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {banned.map((nm) => (
                <div key={nm} style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{nm}</span>
                  <button onClick={() => unbanPlayer(nm)} style={{ background: 'none', border: 'none', color: '#95E06C', cursor: 'pointer', fontSize: 14, fontWeight: 900, padding: 0 }}>↩</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repopular ranking */}
        <div style={CARD_STYLE}>
          <span style={SECTION_LABEL}>Manutenção</span>
          <button onClick={repopulateRanking} disabled={repopulating} style={{ width: '100%', padding: '11px 0', borderRadius: 10, backgroundColor: repopulating ? '#444' : '#4ECDC4', color: '#0a1628', fontSize: 13, fontWeight: 900, border: 'none', cursor: repopulating ? 'default' : 'pointer' }}>
            {repopulating ? 'MIGRANDO…' : 'REPOPULAR RANKING DO SUPABASE'}
          </button>
          {repopMsg && <p style={{ color: '#95E06C', fontSize: 12, fontWeight: 700, marginTop: 8, textAlign: 'center' }}>{repopMsg}</p>}
        </div>

      </div>
    </div>
  )
}
