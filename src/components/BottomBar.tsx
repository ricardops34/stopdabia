'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { getMuted, setMuted } from '@/lib/audio/manager'

interface BottomBarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

interface SecondaryButtonProps {
  onClick: () => void
  label?: string
  icon?: string
  iconSrc?: string
  color?: string
  disabled?: boolean
  size?: number
}

interface PrimaryButtonProps extends SecondaryButtonProps {
  pulse?: boolean
  size?: number
}

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio_muted', next ? '1' : '0')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Ativar som' : 'Silenciar'}
      className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90"
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        flexShrink: 0,
      }}
    >
      <Image
        src={muted ? '/icons/btn_som_off.png' : '/icons/btn_som_on.png'}
        alt={muted ? 'Som desligado' : 'Som ligado'}
        width={32}
        height={32}
        style={{ objectFit: 'contain' }}
      />
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 0.5 }}>
        SOM
      </span>
    </button>
  )
}

function ButtonIcon({
  icon,
  iconSrc,
  label,
  size,
}: {
  icon?: string
  iconSrc?: string
  label?: string
  size: number
}) {
  if (iconSrc) {
    return (
      <Image
        src={iconSrc}
        alt={label ?? 'Botao'}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
    )
  }

  if (!icon) return null

  return <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
}

export default function BottomBar({ left, center, right }: BottomBarProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-3"
      style={{
        height: 76,
        backgroundColor: '#0a1628',
        backgroundImage: 'url(/ui/barra_fundo.png)',
        backgroundPosition: 'center top',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'cover',
        borderTop: '1.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-between gap-3">
        <div className="flex items-center justify-start" style={{ width: 56 }}>
          {left}
        </div>
        <div className="flex flex-1 items-center justify-center gap-3">
          {center}
        </div>
        <div className="flex items-center justify-end" style={{ width: 56 }}>
          {right}
        </div>
        <MuteToggle />
      </div>
    </footer>
  )
}

export function BtnSecondary({
  onClick,
  label,
  icon,
  iconSrc,
  color = 'rgba(255,255,255,0.08)',
  disabled,
  size = 56,
}: SecondaryButtonProps) {
  const iconSize = size <= 56 ? 32 : 38

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1 transition-transform active:scale-90 disabled:opacity-20"
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: color,
        border: '1.5px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    >
      <ButtonIcon icon={icon} iconSrc={iconSrc} label={label} size={iconSize} />
      {label && (
        <span
          style={{
            fontSize: size <= 56 ? 8 : 9,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 700,
            letterSpacing: 0.5,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </button>
  )
}

export function BtnPrimary({
  onClick,
  label,
  icon,
  iconSrc,
  color = '#FF6B6B',
  disabled,
  pulse,
  size = 56,
}: PrimaryButtonProps) {
  const iconSize = size === 56 ? 32 : 40

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 transition-transform active:scale-90 disabled:opacity-40${pulse ? ' animate-pulse-stop' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: color,
        border: '2.5px solid #FFD93D',
        flexShrink: 0,
      }}
    >
      <ButtonIcon icon={icon} iconSrc={iconSrc} label={label} size={iconSize} />
      <span
        style={{
          fontSize: size === 56 ? 8 : 9,
          color: 'white',
          fontWeight: 900,
          letterSpacing: 0.5,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </button>
  )
}
