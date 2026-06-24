'use client'

import { useEffect } from 'react'
import { startMusic } from '@/lib/audio/manager'

export default function MusicAutoStart() {
  useEffect(() => {
    const handler = () => {
      startMusic()
      window.removeEventListener('click', handler)
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('keydown', handler)
    }
    window.addEventListener('click', handler, { passive: true })
    window.addEventListener('touchstart', handler, { passive: true })
    window.addEventListener('keydown', handler, { passive: true })
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [])

  return null
}
