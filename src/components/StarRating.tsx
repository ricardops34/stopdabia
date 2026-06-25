'use client'

import { useState } from 'react'

interface StarRatingProps {
  onRate: (stars: number) => void
  rated: boolean
}

export default function StarRating({ onRate, rated }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)

  if (rated) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#FFD93D', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>OBRIGADO PELA AVALIAÇÃO! ⭐</p>
      </div>
    )
  }

  function handle(stars: number) {
    setSelected(stars)
    onRate(stars)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ color: 'rgba(248,231,191,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
        Avalie o jogo
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hover || selected)
          return (
            <button
              key={star}
              onClick={() => handle(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', fontSize: 36, lineHeight: 1, transition: 'transform 0.1s', transform: active ? 'scale(1.15)' : 'scale(1)' }}
            >
              <span style={{ filter: active ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
