'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { getMuted, setMuted } from '@/lib/audio/manager'

interface BottomBarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
  spread?: boolean
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
      className="transition-transform active:scale-90"
      style={{ flexShrink: 0 }}
    >
      <Image
        src={muted ? '/icons/btn_som_off.png' : '/icons/btn_som_on.png'}
        alt={muted ? 'Som desligado' : 'Som ligado'}
        width={64}
        height={64}
        style={{ objectFit: 'contain' }}
      />
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

export default function BottomBar({ left, center, right, spread }: BottomBarProps) {
  const footerStyle: React.CSSProperties = {
    height: 76,
    backgroundColor: '#0a1628',
    backgroundImage: 'url(/ui/barra_fundo.png)',
    backgroundPosition: 'center top',
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'cover',
    borderTop: '1.5px solid rgba(255,255,255,0.08)',
  }

  if (spread) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40" style={footerStyle}>
        <div className="mx-auto flex w-full h-full max-w-[460px] items-center justify-center gap-4 px-3">
          {center}
          <MuteToggle />
        </div>
      </footer>
    )
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40" style={footerStyle}>
      <div className="mx-auto flex w-full h-full max-w-[460px] items-center justify-center gap-3 px-2">
        {left && <div className="flex items-center" style={{ flexShrink: 0 }}>{left}</div>}
        <div className="flex items-center justify-center gap-3">
          {center}
        </div>
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          {right}
          <MuteToggle />
        </div>
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
  if (iconSrc) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="transition-transform active:scale-90 disabled:opacity-20"
        style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0 }}
      >
        <Image src={iconSrc} alt={label ?? ''} width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} />
      </button>
    )
  }

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
      <ButtonIcon icon={icon} iconSrc={iconSrc} label={label} size={size} />
      {label && (
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 0.5, textAlign: 'center' }}>
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
  if (iconSrc) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`transition-transform active:scale-90 disabled:opacity-60${pulse ? ' animate-pulse-stop' : ''}`}
        style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0 }}
      >
        <Image src={iconSrc} alt={label ?? ''} width={size} height={size} style={{ objectFit: 'contain', display: 'block', filter: disabled ? 'grayscale(0.5)' : undefined }} />
      </button>
    )
  }

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
      <ButtonIcon icon={icon} iconSrc={iconSrc} label={label} size={size} />
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
