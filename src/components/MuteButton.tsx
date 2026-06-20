'use client'

import { useState, useEffect } from 'react'
import { setMuted, getMuted } from '@/lib/audio/manager'

export default function MuteButton() {
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio_muted', next ? '1' : '0')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Ativar som' : 'Silenciar'}
      className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform"
      style={{ backgroundColor: '#0F3460', border: '2px solid #ffffff22' }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
