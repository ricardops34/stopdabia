'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket } from '@/lib/socket/client'
import { playTrack } from '@/lib/audio/manager'

type View = 'home' | 'play' | 'friends'

const BG_PINK = '#F472B6'
const BG_PINK_GRAD = 'radial-gradient(circle at 20% 20%, #FB7185 0%, #F472B6 50%, #EC4899 100%)'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)

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
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 16 }}
        >
          ‹
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => onSelect(a)}
              className="rounded-full active:scale-90 transition-transform shrink-0"
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
          style={{ width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.25)', color: 'white', fontSize: 16 }}
        >
          ›
        </button>
      </div>
    </div>
  )
}

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
    // Restaura apelido e avatar salvos
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
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 gap-5 relative"
        style={{ backgroundColor: BG_PINK, backgroundImage: BG_PINK_GRAD }}
      >
        <BackgroundLetters />
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5 animate-slide-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="STOP ADEDONHA" width={180} style={{ height: 'auto', display: 'block' }} />

          <h2 className="text-2xl font-extrabold text-white drop-shadow">Criar Sala</h2>

          <AvatarPicker selected={avatar} onSelect={setAvatar} />

          <div className="w-full flex flex-col gap-3">
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
          </div>
        </div>

        {/* Botão Voltar — esquerdo */}
        <button
          onClick={back}
          className="fixed left-6 z-40 flex flex-col items-center justify-center gap-0.5 text-white shadow-2xl active:scale-90 transition-transform"
          style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.3)', border: '3px solid rgba(255,255,255,0.6)', bottom: 88 }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>←</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, opacity: 0.8 }}>VOLTAR</span>
        </button>

        {/* Botão Criar Sala — direito */}
        <button
          onClick={handlePlay}
          disabled={loading || nickname.trim().length < 3}
          className="fixed right-6 z-40 flex flex-col items-center justify-center gap-0.5 text-white shadow-2xl active:scale-90 transition-transform animate-pulse-stop disabled:opacity-40 disabled:animate-none"
          style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#FF9500', border: '3px solid #FFD93D', bottom: 88 }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>▶</span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.5 }}>{loading ? 'CRIANDO' : 'CRIAR SALA'}</span>
        </button>
      </main>
    )
  }

  // ─── Entrar na Sala ───────────────────────────────────────────────────────
  if (view === 'friends') {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 gap-5 relative"
        style={{ backgroundColor: BG_PINK, backgroundImage: BG_PINK_GRAD }}
      >
        <BackgroundLetters />
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5 animate-slide-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="STOP ADEDONHA" width={180} style={{ height: 'auto', display: 'block' }} />

          <h2 className="text-2xl font-extrabold text-white drop-shadow">Entrar na Sala</h2>

          <AvatarPicker selected={avatar} onSelect={setAvatar} />

          <div className="w-full flex flex-col gap-3">
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
          </div>
        </div>

        {/* Botão Voltar — esquerdo */}
        <button
          onClick={back}
          className="fixed left-6 z-40 flex flex-col items-center justify-center gap-0.5 text-white shadow-2xl active:scale-90 transition-transform"
          style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.3)', border: '3px solid rgba(255,255,255,0.6)', bottom: 88 }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>←</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, opacity: 0.8 }}>VOLTAR</span>
        </button>

        {/* Botão Entrar — direito */}
        <button
          onClick={handleJoinFriends}
          disabled={loading || nickname.trim().length < 3 || code.trim().length < 6}
          className="fixed right-6 z-40 flex flex-col items-center justify-center gap-0.5 text-white shadow-2xl active:scale-90 transition-transform animate-pulse-stop disabled:opacity-40 disabled:animate-none"
          style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#9B59B6', border: '3px solid #FFD93D', bottom: 88 }}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>👫</span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.5 }}>{loading ? 'ENTRANDO' : 'ENTRAR'}</span>
        </button>
      </main>
    )
  }

  // ─── Home ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ minHeight: '100dvh', backgroundColor: BG_PINK, backgroundImage: BG_PINK_GRAD }}
    >
      <BackgroundLetters />

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="STOP ADEDONHA"
          width={260}
          className="animate-slide-up"
          style={{ height: 'auto', display: 'block' }}
        />

        <div
          className="rounded-full flex items-center justify-center border-4 shadow-xl"
          style={{ backgroundColor: '#4ECDC4', borderColor: '#FFD93D', width: 110, height: 110 }}
        >
          <Image src={`/cachorra/${cachorra}.png`} alt="cachorra" width={92} height={92} className="object-contain" priority />
        </div>

        <p className="text-center font-extrabold text-base" style={{ color: '#FFD93D', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
          O jogo de STOP mais divertido!
        </p>

        <div className="w-full flex gap-2 animate-slide-up">
          <button
            onClick={() => router.push('/solo')}
            className="flex-1 flex flex-col items-center gap-1 py-4 px-1 rounded-2xl font-bold text-xs text-white active:scale-95 transition-transform shadow-lg"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            <span className="text-xl">🎮</span>
            <span className="leading-tight text-center">JOGAR<br />SOZINHO</span>
          </button>

          <button
            onClick={() => setView('play')}
            className="flex-[1.4] flex flex-col items-center gap-1 py-4 px-1 rounded-2xl font-extrabold text-lg text-white active:scale-95 transition-transform shadow-xl"
            style={{ backgroundColor: '#FF9500', border: '3px solid #FFD93D' }}
          >
            <span className="text-2xl">▶</span>
            <span className="leading-tight text-center text-sm">CRIAR<br />SALA</span>
          </button>

          <button
            onClick={() => setView('friends')}
            className="flex-1 flex flex-col items-center gap-1 py-4 px-1 rounded-2xl font-bold text-xs text-white active:scale-95 transition-transform shadow-lg"
            style={{ backgroundColor: '#9B59B6' }}
          >
            <span className="text-xl">👫</span>
            <span className="leading-tight text-center">ENTRAR<br />NA SALA</span>
          </button>
        </div>

        <p className="text-white/40 text-xs">Sem cadastro. É só jogar.</p>
      </div>
    </main>
  )
}
