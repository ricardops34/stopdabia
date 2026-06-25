'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BottomBar, { BtnSecondary } from '@/components/BottomBar'

interface RankEntry {
  nickname: string
  avatar?: string
  score: number
  rank: number
}

type Mode = 'solo' | 'multi'

const MEDAL = ['🥇', '🥈', '🥉']
const MODE_COLORS: Record<Mode, string> = { solo: '#FF6B6B', multi: '#4ECDC4' }

export default function RankingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('solo')
  const [entries, setEntries] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/ranking?mode=${mode}&limit=20`)
      .then((r) => r.json())
      .then((data: { ranking: RankEntry[] }) => setEntries(data.ranking ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [mode])

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0a1628', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px 16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Image src="/logo.png" alt="STOP" width={80} height={57} style={{ objectFit: 'contain' }} />
        <h1 style={{ color: '#FFD93D', fontSize: 22, fontWeight: 900, letterSpacing: 3, margin: 0 }}>RANKING</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, backgroundColor: '#0F3460', borderRadius: 12, padding: 4, width: '100%', maxWidth: 320 }}>
          {(['solo', 'multi'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
                backgroundColor: mode === m ? MODE_COLORS[m] : 'transparent',
                color: mode === m ? '#0a1628' : 'rgba(255,255,255,0.5)',
                fontSize: 12, fontWeight: 900, letterSpacing: 1, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'solo' ? 'INDIVIDUAL' : 'MULTIPLAYER'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 96px', scrollbarWidth: 'none' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700 }}>
            Carregando…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Image src="/cachorra/4.png" alt="" width={160} height={160} style={{ objectFit: 'contain', opacity: 0.5 }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700 }}>Nenhum resultado ainda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 440, margin: '0 auto' }}>
            {entries.map((e, i) => {
              const isTop3 = i < 3
              return (
                <div
                  key={`${e.nickname}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    backgroundColor: isTop3 ? '#0F3460' : '#16213E',
                    borderRadius: 14, padding: '10px 14px',
                    border: i === 0 ? '2px solid #FFD93D44' : i === 1 ? '2px solid rgba(192,192,192,0.3)' : i === 2 ? '2px solid rgba(205,127,50,0.3)' : '2px solid transparent',
                  }}
                >
                  {/* Posição */}
                  <div style={{ minWidth: 36, textAlign: 'center' }}>
                    {i < 3
                      ? <span style={{ fontSize: 22 }}>{MEDAL[i]}</span>
                      : <span style={{ fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  {e.avatar ? (
                    <Image src={e.avatar} alt="" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: MODE_COLORS[mode] + '33', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>👤</span>
                    </div>
                  )}

                  {/* Nome */}
                  <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#F8E7BF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.nickname}
                  </span>

                  {/* Score */}
                  <span style={{ fontSize: 18, fontWeight: 900, color: isTop3 ? '#FFD93D' : 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                    {e.score.toLocaleString('pt-BR')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomBar
        left={<BtnSecondary onClick={() => router.push('/')} iconSrc="/icons/btn_inicio.png" label="INÍCIO" size={60} />}
      />
    </div>
  )
}
