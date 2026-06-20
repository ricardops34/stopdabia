'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { setMuted, getMuted } from '@/lib/audio/manager'

// ─── Mute ────────────────────────────────────────────────────────────────────

function MuteToggle() {
  const [muted, setMutedState] = useState(false)
  useEffect(() => {
    const saved = getMuted()
    setMutedState(saved)
    setMuted(saved)
  }, [])
  function toggle() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    if (typeof window !== 'undefined') localStorage.setItem('audio_muted', next ? '1' : '0')
  }
  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Ativar som' : 'Silenciar'}
      className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform"
      style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{muted ? '🔇' : '🔊'}</span>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 0.5 }}>SOM</span>
    </button>
  )
}

// ─── Bar ─────────────────────────────────────────────────────────────────────

interface BottomBarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export default function BottomBar({ left, center, right }: BottomBarProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-evenly px-3"
      style={{ height: 76, backgroundColor: '#0a1628', borderTop: '1.5px solid rgba(255,255,255,0.07)' }}
    >
      {left}
      {center && (
        <div className="flex items-center gap-3">{center}</div>
      )}
      {right}
      <MuteToggle />
    </footer>
  )
}

// ─── Botão secundário (ação de retorno / secundária) ─────────────────────────

export function BtnSecondary({ onClick, label, icon = '←', color = 'rgba(255,255,255,0.08)', disabled }: {
  onClick: () => void
  label?: string
  icon?: string
  color?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform disabled:opacity-20"
      style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: color,
        border: '1.5px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
      {label && (
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 0.5, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </button>
  )
}

// ─── Botão primário (ação principal) ─────────────────────────────────────────

export function BtnPrimary({ onClick, label, icon, color = '#FF6B6B', disabled, pulse }: {
  onClick: () => void
  label: string
  icon?: string
  color?: string
  disabled?: boolean
  pulse?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform disabled:opacity-40${pulse ? ' animate-pulse-stop' : ''}`}
      style={{
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: color,
        border: '2.5px solid #FFD93D',
        flexShrink: 0,
      }}
    >
      {icon && <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>}
      <span style={{ fontSize: 8, color: 'white', fontWeight: 900, letterSpacing: 0.5, textAlign: 'center', textTransform: 'uppercase' }}>
        {label}
      </span>
    </button>
  )
}
