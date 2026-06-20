'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket } from '@/lib/socket/client'
import { playTrack } from '@/lib/audio/manager'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'

type View = 'home' | 'play' | 'friends'

const BG_PINK = '#F472B6'
const BG_PINK_GRAD = 'radial-gradient(circle at 20% 20%, #FB7185 0%, #F472B6 50%, #EC4899 100%)'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)

// ─── Componentes ─────────────────────────────────────────────────────────────

// ─── Avatar Picker ────────────────────────────────────────────────────────────

function AvatarPicker({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-white/70 text-sm font-bold pl-1">Escolha seu avatar</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 18 }}
        >
          ‹
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto flex-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => onSelect(a)}
              className="rounded-full active:scale-90 transition-transform shrink-0 snap-center"
              style={{
                width: 64,
                height: 64,
                border: selected === a ? '3px solid #FFD93D' : '3px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: 3,
              }}
            >
              <Image src={a} alt="avatar" width={54} height={54} className="rounded-full object-cover" />
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 18 }}
        >
          ›
        </button>
      </div>
    </div>
  )
}

function BackgroundLetters() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {['A', 'B', 'C', 'D', 'E', 'F'].map((l, i) => (
        <span
          key={l}
          className="absolute text-6xl font-bold opacity-10 text-white"
          style={{ top: `${10 + i * 14}%`, left: `${(i % 2 === 0 ? 5 : 80) + Math.sin(i) * 5}%`, transform: `rotate(${-15 + i * 8}deg)` }}
        >
          {l}
        </span>
      ))}
    </div>
  )
}

// ─── Tela de formulário (avatar + apelido) ────────────────────────────────────

function FormScreen({
  title, children, onBack, actionIcon, actionLabel, actionColor, onAction, actionDisabled, actionLoading,
}: {
  title: string
  children: React.ReactNode
  onBack: () => void
  actionIcon: string
  actionLabel: string
  actionColor: string
  onAction: () => void
  actionDisabled: boolean
  actionLoading: boolean
}) {
  return (
    <main
      className="flex flex-col overflow-hidden relative min-h-[100dvh]"
      style={{ backgroundColor: BG_PINK, backgroundImage: BG_PINK_GRAD }}
    >
      <BackgroundLetters />

      <div className="relative z-10 flex flex-col px-6 pt-8 pb-32 gap-5 w-full max-w-sm mx-auto animate-slide-up flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col items-center w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="STOP ADEDONHA" width={160} style={{ height: 'auto', display: 'block' }} />
          <h2 className="text-2xl font-extrabold text-white drop-shadow mt-4">{title}</h2>
        </div>

        {children}
      </div>

      <BottomBar
        left={<BtnSecondary onClick={onBack} label="VOLTAR" />}
        center={
          <BtnPrimary
            onClick={onAction}
            icon={actionLoading ? '⏳' : actionIcon}
            label={actionLoading ? 'AGUARDE' : actionLabel}
            color={actionColor}
            disabled={actionDisabled}
            pulse
          />
        }
      />
    </main>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('home')
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cachorra, setCachorra] = useState(1)

  useEffect(() => {
    setCachorra(Math.floor(Math.random() * 4) + 1)
    playTrack('home', 0.3)
    const saved = localStorage.getItem('stop_player')
    if (saved) {
      try {
        const { nickname: n, avatar: a } = JSON.parse(saved)
        if (n) setNickname(n)
        if (a && AVATARS.includes(a)) setAvatar(a)
      } catch { /* ignora JSON inválido */ }
    }
  }, [])

  function savePlayer(n: string, a: string) {
    localStorage.setItem('stop_player', JSON.stringify({ nickname: n, avatar: a }))
  }

  function saveSession(code: string, n: string) {
    sessionStorage.setItem('stop_session', JSON.stringify({ code, nickname: n }))
  }

  function handlePlay() {
    setError('')
    if (nickname.trim().length < 3) { setError('Apelido precisa ter pelo menos 3 letras'); return }
    setLoading(true)
    const socket = connectSocket()
    const doCreate = () => {
      socket.emit('room:create', nickname.trim(), avatar, (res) => {
        setLoading(false)
        if (res.error) { setError(res.error); return }
        savePlayer(nickname.trim(), avatar)
        saveSession(res.code, nickname.trim())
        router.push(`/room/${res.code}`)
      })
    }
    if (socket.connected) doCreate()
    else socket.once('connect', doCreate)
  }

  function handleJoinFriends() {
    setError('')
    if (nickname.trim().length < 3) { setError('Apelido precisa ter pelo menos 3 letras'); return }
    if (code.trim().length < 6) { setError('Código inválido'); return }
    setLoading(true)
    const socket = connectSocket()
    const doJoin = () => {
      socket.emit('room:join', code.trim().toUpperCase(), nickname.trim(), avatar, (res) => {
        setLoading(false)
        if (!res.ok) { setError(res.error ?? 'Erro ao entrar'); return }
        savePlayer(nickname.trim(), avatar)
        saveSession(code.trim().toUpperCase(), nickname.trim())
        router.push(`/room/${code.trim().toUpperCase()}`)
      })
    }
    if (socket.connected) doJoin()
    else socket.once('connect', doJoin)
  }

  function back() { setView('home'); setError(''); setNickname('') }

  // ─── Criar Sala ───────────────────────────────────────────────────────────
  if (view === 'play') {
    return (
      <FormScreen
        title="Criar Sala"
        onBack={back}
        actionIcon="▶"
        actionLabel={loading ? 'CRIANDO' : 'CRIAR SALA'}
        actionColor="#FF9500"
        onAction={handlePlay}
        actionDisabled={loading || nickname.trim().length < 3}
        actionLoading={loading}
      >
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        <input
          type="text"
          placeholder="Seu apelido…"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
          maxLength={20}
          autoFocus
          className="w-full px-5 py-4 text-xl rounded-2xl text-white placeholder-white/50 outline-none text-center font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '3px solid rgba(255,255,255,0.5)' }}
        />
        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}
      </FormScreen>
    )
  }

  // ─── Entrar na Sala ───────────────────────────────────────────────────────
  if (view === 'friends') {
    return (
      <FormScreen
        title="Entrar na Sala"
        onBack={back}
        actionIcon="👫"
        actionLabel={loading ? 'ENTRANDO' : 'ENTRAR'}
        actionColor="#9B59B6"
        onAction={handleJoinFriends}
        actionDisabled={loading || nickname.trim().length < 3 || code.trim().length < 6}
        actionLoading={loading}
      >
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        <input
          type="text"
          placeholder="Seu apelido…"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          autoFocus
          className="w-full px-5 py-4 text-xl rounded-2xl text-white placeholder-white/50 outline-none text-center font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '3px solid rgba(255,255,255,0.5)' }}
        />
        <input
          type="text"
          placeholder="Código da sala"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinFriends()}
          maxLength={6}
          className="w-full px-5 py-4 text-2xl rounded-2xl text-white placeholder-white/30 outline-none text-center font-extrabold tracking-[0.3em] uppercase"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '3px solid rgba(255,255,255,0.5)' }}
        />
        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}
      </FormScreen>
    )
  }

  // ─── Home ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="flex flex-col items-center justify-center px-4 gap-4 relative overflow-hidden"
      style={{ minHeight: '100dvh', backgroundColor: BG_PINK, backgroundImage: BG_PINK_GRAD }}
    >
      <BackgroundLetters />

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="STOP ADEDONHA"
          width={260}
          className="animate-slide-up"
          style={{ height: 'auto', display: 'block' }}
        />

        {/* Cachorra */}
        <div
          className="rounded-full flex items-center justify-center border-4 shadow-xl"
          style={{ backgroundColor: '#4ECDC4', borderColor: '#FFD93D', width: 100, height: 100 }}
        >
          <Image src={`/cachorra/${cachorra}.png`} alt="cachorra" width={84} height={84} className="object-contain" priority />
        </div>

        {/* Tagline */}
        <div className="px-5 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <p className="text-center font-extrabold text-base" style={{ color: '#FFD93D', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            O jogo de STOP mais divertido! 🎉
          </p>
        </div>

        {/* Subtítulo */}
        <p
          className="text-sm font-bold px-4 py-1.5 rounded-full"
          style={{ color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.15)', letterSpacing: 0.5 }}
        >
          Sem cadastro. É só jogar.
        </p>
      </div>

      <BottomBar
        center={
          <>
            <BtnSecondary onClick={() => router.push('/solo')} label="INDIVIDUAL" icon="🎮" />
            <BtnPrimary onClick={() => setView('play')} label="CRIAR SALA" icon="▶" color="#FF9500" pulse />
            <BtnSecondary onClick={() => setView('friends')} label="ENTRAR" icon="👫" />
          </>
        }
      />
    </main>
  )
}
