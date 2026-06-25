'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_CONFIG, type GameConfig } from '@/lib/game/runtime-config'

interface Stats {
  total: number
  solo: number
  multi: number
  uniquePlayers: number
  ratingAvg: number | null
  ratingCount: number
  daily: { date: string; games: number }[]
}

const CONFIG_LABELS: { key: keyof GameConfig; label: string; isPercent: boolean; min: number; max: number; step: number }[] = [
  { key: 'easterChancePlaying',        label: 'Chance durante o jogo',               isPercent: true,  min: 0,  max: 100, step: 5  },
  { key: 'easterIntervalPlaying',      label: 'Intervalo durante o jogo (seg)',       isPercent: false, min: 5,  max: 60,  step: 5  },
  { key: 'easterChanceCountdown',      label: 'Chance no countdown',                 isPercent: true,  min: 0,  max: 100, step: 5  },
  { key: 'easterChanceReview',         label: 'Chance na correção (resposta normal)', isPercent: true,  min: 0,  max: 100, step: 5  },
  { key: 'easterChanceReviewPerfect',  label: 'Chance na correção (acerto perfeito)', isPercent: true, min: 0,  max: 100, step: 5  },
]

export default function AdminPage() {
  const [key, setKey]         = useState('')
  const [stats, setStats]     = useState<Stats | null>(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig]   = useState<GameConfig>({ ...DEFAULT_CONFIG })
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_key')
    if (saved) { setKey(saved); load(saved) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(k = key) {
    setLoading(true)
    setError('')
    try {
      const [statsRes, cfgRes] = await Promise.all([
        fetch(`/api/stats?key=${encodeURIComponent(k)}`),
        fetch('/api/config'),
      ])
      if (!statsRes.ok) { setError('Chave inválida'); setLoading(false); return }
      setStats(await statsRes.json() as Stats)
      sessionStorage.setItem('admin_key', k)
      if (cfgRes.ok) setConfig(await cfgRes.json() as GameConfig)
    } catch {
      setError('Erro ao carregar')
    }
    setLoading(false)
  }

  async function saveConfig() {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/config?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      setSaveMsg(res.ok ? 'Salvo!' : 'Erro ao salvar')
    } catch {
      setSaveMsg('Erro ao salvar')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 2000)
  }

  function setConfigVal(k: keyof GameConfig, raw: number, isPercent: boolean) {
    setConfig((prev) => ({ ...prev, [k]: isPercent ? raw / 100 : raw }))
  }

  const maxBar    = stats ? Math.max(...stats.daily.map((d) => d.games), 1) : 1
  const today     = new Date().toISOString().slice(0, 10)
  const todayGames = stats?.daily.find((d) => d.date === today)?.games ?? 0
  const weekGames  = stats?.daily.slice(-7).reduce((s, d) => s + d.games, 0) ?? 0

  if (!stats) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ color: '#FFD93D', fontSize: 24, fontWeight: 900, textAlign: 'center', letterSpacing: 2 }}>ADMIN</h1>
          <input
            type="password"
            placeholder="Chave de acesso"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            style={{ padding: '14px 16px', borderRadius: 12, border: '2px solid #FFD93D', backgroundColor: '#0F3460', color: '#F8E7BF', fontSize: 16, fontWeight: 700, outline: 'none' }}
          />
          {error && <p style={{ color: '#FF6B6B', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          <button
            onClick={() => load()}
            disabled={loading}
            style={{ padding: '14px 0', borderRadius: 12, backgroundColor: '#FFD93D', color: '#0a1628', fontSize: 15, fontWeight: 900, border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Carregando…' : 'ENTRAR'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', padding: '24px 16px', color: '#F8E7BF' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <h1 style={{ color: '#FFD93D', fontSize: 22, fontWeight: 900, letterSpacing: 2, textAlign: 'center' }}>ESTATÍSTICAS</h1>

        {/* Cards de totais */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'HOJE',            value: todayGames,         color: '#4ECDC4' },
            { label: 'ESTA SEMANA',     value: weekGames,          color: '#FFD93D' },
            { label: 'TOTAL DE JOGOS',  value: stats.total,        color: '#FF6B6B' },
            { label: 'JOGADORES ÚNICOS', value: stats.uniquePlayers, color: '#9B59B6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: '#0F3460', borderRadius: 16, padding: '16px 12px', textAlign: 'center', border: `2px solid ${color}22` }}>
              <p style={{ fontSize: 32, fontWeight: 900, color, margin: 0 }}>{value.toLocaleString('pt-BR')}</p>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, opacity: 0.6, margin: '4px 0 0', textTransform: 'uppercase' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Avaliação */}
        {stats.ratingAvg !== null && (
          <div style={{ backgroundColor: '#0F3460', borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Avaliação dos Jogadores</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: '#FFD93D' }}>{stats.ratingAvg.toFixed(1)}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{ fontSize: 20 }}>{'⭐'.repeat(Math.round(stats.ratingAvg))}</span>
                <span style={{ fontSize: 11, opacity: 0.4 }}>{stats.ratingCount.toLocaleString('pt-BR')} avaliações</span>
              </div>
            </div>
          </div>
        )}

        {/* Solo vs Multi */}
        <div style={{ backgroundColor: '#0F3460', borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Modo de Jogo</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Solo',       value: stats.solo,  color: '#FF6B6B' },
              { label: 'Multiplayer', value: stats.multi, color: '#4ECDC4' },
            ].map(({ label, value, color }) => {
              const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
              return (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{value.toLocaleString('pt-BR')} <span style={{ opacity: 0.4 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, backgroundColor: '#16213E', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Gráfico de barras — últimos 30 dias */}
        <div style={{ backgroundColor: '#0F3460', borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Últimos 30 dias</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
            {stats.daily.map(({ date, games }) => {
              const h = maxBar > 0 ? Math.round((games / maxBar) * 80) : 0
              const isToday = date === today
              return (
                <div key={date} title={`${date}: ${games} jogos`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: Math.max(h, games > 0 ? 3 : 0), borderRadius: 2, backgroundColor: isToday ? '#FFD93D' : '#4ECDC4', opacity: isToday ? 1 : 0.7 }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, opacity: 0.4, fontSize: 10 }}>
            <span>{stats.daily[0]?.date.slice(5)}</span>
            <span style={{ color: '#FFD93D', opacity: 1 }}>hoje</span>
          </div>
        </div>

        {/* ── PARÂMETROS DE EASTER EGG ── */}
        <div style={{ backgroundColor: '#0F3460', borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, textTransform: 'uppercase', marginBottom: 16 }}>Easter Egg — Parâmetros</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {CONFIG_LABELS.map(({ key: k, label, isPercent, min, max: maxV, step }) => {
              const raw     = isPercent ? Math.round((config[k] as number) * 100) : (config[k] as number)
              const display = isPercent ? `${raw}%` : `${raw}s`
              return (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#FFD93D', minWidth: 48, textAlign: 'right' }}>{display}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={maxV}
                    step={step}
                    value={raw}
                    onChange={(e) => setConfigVal(k, Number(e.target.value), isPercent)}
                    style={{ width: '100%', accentColor: '#FFD93D', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.35, marginTop: 2 }}>
                    <span>{isPercent ? `${min}%` : `${min}s`}</span>
                    <span>{isPercent ? `${maxV}%` : `${maxV}s`}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={saveConfig}
            disabled={saving}
            style={{
              marginTop: 20, width: '100%', padding: '13px 0',
              borderRadius: 12,
              backgroundColor: saving ? '#444' : saveMsg === 'Salvo!' ? '#95E06C' : '#FFD93D',
              color: '#0a1628', fontSize: 14, fontWeight: 900,
              border: 'none', cursor: saving ? 'default' : 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            {saving ? 'SALVANDO…' : saveMsg || 'SALVAR PARÂMETROS'}
          </button>
        </div>

        <button
          onClick={() => { setStats(null); sessionStorage.removeItem('admin_key') }}
          style={{ padding: '12px 0', borderRadius: 12, backgroundColor: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          SAIR
        </button>

      </div>
    </div>
  )
}
