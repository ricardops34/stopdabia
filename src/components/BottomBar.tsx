'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { setMuted, getMuted } from '@/lib/audio/manager'

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
      className="flex flex-col items-center justify-center gap-1 rounded-xl font-extrabold text-white active:scale-95 transition-transform"
      style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{muted ? '🔇' : '🔊'}</span>
      <span style={{ fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>SOM</span>
    </button>
  )
}

interface BottomBarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

export default function BottomBar({ left, center, right }: BottomBarProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center px-3 gap-2 w-full"
      style={{ height: 72, backgroundColor: '#0a1628', borderTop: '1.5px solid rgba(255,255,255,0.07)' }}
    >
      {left}
      {center}
      {right}
      <MuteToggle />
    </footer>
  )
}

export function BtnSecondary({ onClick, label, icon = '←' }: {
  onClick: () => void; label?: string; icon?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl font-extrabold text-white active:scale-95 transition-transform"
      style={{ height: 56, backgroundColor: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', minWidth: 56 }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      {label && <span style={{ fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>{label}</span>}
    </button>
  )
}

// Botão primário (ação principal)
export function BtnPrimary({ onClick, label, icon, color = '#FF6B6B', disabled, pulse }: {
  onClick: () => void; label: string; icon?: string; color?: string; disabled?: boolean; pulse?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl font-black text-white active:scale-95 transition-transform disabled:opacity-40 disabled:animate-none${pulse ? ' animate-pulse-stop' : ''}`}
      style={{ height: 56, backgroundColor: color, border: '2px solid #FFD93D', textTransform: 'uppercase', minWidth: 56 }}
    >
      {icon && <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>}
      <span style={{ fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>{label}</span>
    </button>
  )
}
