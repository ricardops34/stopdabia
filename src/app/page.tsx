'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'
import { playTrack } from '@/lib/audio/manager'
import { connectSocket } from '@/lib/socket/client'
import { signInWithGoogle, signOut } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

type View = 'home' | 'play' | 'friends'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)

const BG_LETTERS = [
  { l: 'a', top: '8%', left: '3%', size: 44, rot: -18, op: 0.5 },
  { l: 'b', top: '17%', left: '20%', size: 30, rot: 12, op: 0.4 },
  { l: 'c', top: '7%', left: '68%', size: 40, rot: -8, op: 0.48 },
  { l: 'd', top: '23%', left: '84%', size: 28, rot: 18, op: 0.38 },
  { l: 'e', top: '42%', left: '2%', size: 34, rot: -15, op: 0.42 },
  { l: 'f', top: '58%', left: '88%', size: 42, rot: 8, op: 0.46 },
  { l: 'g', top: '70%', left: '5%', size: 32, rot: 22, op: 0.34 },
  { l: 'h', top: '78%', left: '80%', size: 38, rot: -12, op: 0.42 },
  { l: 'k', top: '86%', left: '10%', size: 42, rot: -8, op: 0.45 },
  { l: 'p', top: '66%', left: '90%', size: 34, rot: 10, op: 0.35 },
] as const

function BackgroundLetters() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
      {BG_LETTERS.map(({ l, top, left, size, rot, op }) => (
        <div key={l} style={{ position: 'absolute', top, left, opacity: op, transform: `rotate(${rot}deg)` }}>
          <Image src={`/icons/letra_${l}.png`} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
        </div>
      ))}
    </div>
  )
}

function AvatarPicker({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 180 : -180, behavior: 'smooth' })
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="pl-1 text-sm font-bold text-white/70">Escolha seu avatar</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
          style={{
            width: 36,
            height: 36,
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'white',
          }}
        >
          {'<'}
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-3 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {AVATARS.map((avatarSrc) => (
            <button
              key={avatarSrc}
              onClick={() => onSelect(avatarSrc)}
              className="snap-center shrink-0 rounded-full transition-transform active:scale-90"
              style={{
                width: 72,
                height: 72,
                border: selected === avatarSrc ? '3px solid #FFD93D' : '3px solid rgba(255,255,255,0.18)',
                backgroundColor: 'rgba(0,0,0,0.18)',
                padding: 3,
              }}
            >
              <Image src={avatarSrc} alt="avatar" width={62} height={62} className="rounded-full object-cover" />
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
          style={{
            width: 36,
            height: 36,
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'white',
          }}
        >
          {'>'}
        </button>
      </div>
    </div>
  )
}

function LoginBadge({
  user,
  avatarPath,
  onLogin,
  onLogout,
  onRanking,
}: {
  user: User | null
  avatarPath: string
  onLogin: () => void
  onLogout: () => void
  onRanking: () => void
}) {
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <button
        onClick={onLogin}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-transform active:scale-95"
        style={{ backgroundColor: 'rgba(10,22,40,0.92)', color: '#F8E7BF', border: '2px solid #D69B2B' }}
      >
        <Image src="/avatar/avatar_01.png" alt="" width={20} height={20} className="rounded-full object-cover" />
        LOGIN
      </button>
    )
  }

  const nickname = user.user_metadata?.nickname ?? user.email?.split('@')[0] ?? 'Jogador'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-transform active:scale-95"
        style={{ backgroundColor: 'rgba(10,22,40,0.92)', color: '#F8E7BF', border: '2px solid #D69B2B' }}
      >
        <Image src={avatarPath} alt="" width={20} height={20} className="rounded-full object-cover" />
        {nickname}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 flex min-w-[150px] flex-col overflow-hidden rounded-2xl shadow-xl"
          style={{ backgroundColor: '#0F3460', border: '2px solid rgba(214,155,43,0.35)' }}
        >
          <button
            onClick={() => {
              setOpen(false)
              onRanking()
            }}
            className="px-4 py-3 text-left text-sm font-bold"
            style={{ color: 'rgba(255,255,255,0.88)' }}
          >
            Ranking
          </button>
          <button
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="border-t px-4 py-3 text-left text-sm font-bold"
            style={{ color: '#FF6B6B', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

function FormScreen({
  title,
  dogSrc,
  children,
  onBack,
  actionIconSrc,
  actionLabel,
  actionColor,
  onAction,
  actionDisabled,
  actionLoading,
}: {
  title: string
  dogSrc: string
  children: React.ReactNode
  onBack: () => void
  actionIconSrc: string
  actionLabel: string
  actionColor: string
  onAction: () => void
  actionDisabled: boolean
  actionLoading: boolean
}) {
  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
      <BackgroundLetters />
      <div className="pointer-events-none absolute left-4 top-0 opacity-90">
        <Image src="/trail/fio_bg.png" alt="" width={52} height={180} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-5 overflow-y-auto px-6 pb-32 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Image src={dogSrc} alt="" width={120} height={120} className="object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]" />
          <h2 className="text-3xl font-extrabold text-[#F8E7BF]">{title}</h2>
        </div>
        {children}
      </div>

      <BottomBar
        left={<BtnSecondary onClick={onBack} label="VOLTAR" iconSrc="/icons/btn_voltar.png" size={60} />}
        center={
          <BtnPrimary
            onClick={onAction}
            icon={actionLoading ? '...' : undefined}
            iconSrc={actionLoading ? undefined : actionIconSrc}
            label={actionLoading ? 'AGUARDE' : actionLabel}
            color={actionColor}
            disabled={actionDisabled}
            pulse
            size={74}
          />
        }
      />
    </main>
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setCachorra(Math.floor(Math.random() * 4) + 1)
    playTrack('home', 0.3)

    const saved = localStorage.getItem('stop_player')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { nickname?: string; avatar?: string }
        if (parsed.nickname) setNickname(parsed.nickname)
        if (parsed.avatar && AVATARS.includes(parsed.avatar)) setAvatar(parsed.avatar)
      } catch {}
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function savePlayer(nextNickname: string, nextAvatar: string) {
    localStorage.setItem('stop_player', JSON.stringify({ nickname: nextNickname, avatar: nextAvatar }))
  }

  function saveSession(nextCode: string, nextNickname: string) {
    sessionStorage.setItem('stop_session', JSON.stringify({ code: nextCode, nickname: nextNickname }))
  }

  function handlePlay() {
    setError('')
    if (nickname.trim().length < 3) {
      setError('Apelido precisa ter pelo menos 3 letras')
      return
    }

    setLoading(true)
    const socket = connectSocket()
    const doCreate = () => {
      socket.emit('room:create', nickname.trim(), avatar, (res: { error?: string; code: string }) => {
        setLoading(false)
        if (res.error) {
          setError(res.error)
          return
        }
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
    if (nickname.trim().length < 3) {
      setError('Apelido precisa ter pelo menos 3 letras')
      return
    }
    if (code.trim().length < 6) {
      setError('Codigo invalido')
      return
    }

    setLoading(true)
    const socket = connectSocket()
    const doJoin = () => {
      socket.emit('room:join', code.trim().toUpperCase(), nickname.trim(), avatar, (res: { ok?: boolean; error?: string }) => {
        setLoading(false)
        if (!res.ok) {
          setError(res.error ?? 'Erro ao entrar')
          return
        }
        savePlayer(nickname.trim(), avatar)
        saveSession(code.trim().toUpperCase(), nickname.trim())
        router.push(`/room/${code.trim().toUpperCase()}`)
      })
    }

    if (socket.connected) doJoin()
    else socket.once('connect', doJoin)
  }

  function back() {
    setView('home')
    setError('')
    setNickname('')
  }

  if (view === 'play') {
    return (
      <FormScreen
        title="Criar Sala"
        dogSrc="/imagens/cachorra-home-2.png"
        onBack={back}
        actionIconSrc="/icons/btn_jogar.png"
        actionLabel={loading ? 'CRIANDO' : 'CRIAR SALA'}
        actionColor="#FF9500"
        onAction={handlePlay}
        actionDisabled={loading || nickname.trim().length < 3}
        actionLoading={loading}
      >
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        <input
          type="text"
          placeholder="Seu apelido..."
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handlePlay()}
          maxLength={20}
          autoFocus
          className="w-full rounded-2xl px-5 py-4 text-center text-xl font-bold text-white outline-none placeholder:text-white/40"
          style={{ backgroundColor: '#0F3460', border: '2px solid rgba(255,255,255,0.2)' }}
        />
        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}
      </FormScreen>
    )
  }

  if (view === 'friends') {
    return (
      <FormScreen
        title="Entrar na Sala"
        dogSrc="/imagens/cachorra-home-4.png"
        onBack={back}
        actionIconSrc="/icons/btn_avançar.png"
        actionLabel={loading ? 'ENTRANDO' : 'ENTRAR'}
        actionColor="#9B59B6"
        onAction={handleJoinFriends}
        actionDisabled={loading || nickname.trim().length < 3 || code.trim().length < 6}
        actionLoading={loading}
      >
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        <input
          type="text"
          placeholder="Seu apelido..."
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={20}
          autoFocus
          className="w-full rounded-2xl px-5 py-4 text-center text-xl font-bold text-white outline-none placeholder:text-white/40"
          style={{ backgroundColor: '#0F3460', border: '2px solid rgba(255,255,255,0.2)' }}
        />
        <div className="flex w-full flex-col gap-2">
          <span className="text-sm font-bold text-white/65">Codigo da sala</span>
          <input
            type="text"
            placeholder="CODIGO"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === 'Enter' && handleJoinFriends()}
            maxLength={6}
            className="w-full rounded-2xl px-5 py-4 text-center text-3xl font-extrabold uppercase tracking-[0.35em] text-white outline-none placeholder:text-white/25"
            style={{ backgroundColor: '#0F3460', border: '3px solid #4ECDC4' }}
          />
        </div>
        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}
      </FormScreen>
    )
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden" style={{ backgroundColor: '#0a1628' }}>
      <BackgroundLetters />
      <div className="pointer-events-none absolute left-4 top-0 opacity-90">
        <Image src="/trail/fio_bg.png" alt="" width={52} height={180} />
      </div>

      <div className="absolute right-4 top-4 z-20">
        <LoginBadge
          user={user}
          avatarPath={avatar}
          onLogin={signInWithGoogle}
          onLogout={signOut}
          onRanking={() => router.push('/ranking')}
        />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center px-5 pb-28 pt-8">
        <Image
          src="/imagens/logo-home.png"
          alt="STOP ADEDONHA"
          width={340}
          height={248}
          className="w-[min(340px,88vw)] h-auto object-contain"
          priority
        />

        <Image
          src={cachorra === 2 ? '/imagens/cachorra-home-2.png' : '/imagens/cachorra-home-1.png'}
          alt="Mascote STOP"
          width={210}
          height={210}
          className="mt-1 w-[min(210px,52vw)] h-auto object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          priority
        />

        <div
          className="mt-4 w-full rounded-[28px] px-6 py-5 text-center"
          style={{
            backgroundColor: 'rgba(8,19,36,0.92)',
            border: '2px solid rgba(255,217,61,0.18)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.24)',
          }}
        >
          <p className="text-[2rem] font-extrabold leading-tight" style={{ color: '#F8E7BF' }}>
            O jogo de <span style={{ color: '#F3B11F' }}>STOP</span> mais divertido!
          </p>
          <p className="mt-2 text-lg font-semibold" style={{ color: '#6CC8D6' }}>
            Sem cadastro. E so jogar
          </p>
        </div>
      </section>

      <BottomBar
        center={
          <>
            <BtnSecondary onClick={() => router.push('/solo')} iconSrc="/icons/btn_jogar.png" label="INDIVIDUAL" size={60} />
            <BtnPrimary onClick={() => setView('play')} iconSrc="/icons/grupo.png" label="CRIAR SALA" color="#FF6B6B" size={74} pulse />
            <BtnSecondary onClick={() => setView('friends')} iconSrc="/icons/btn_avançar.png" label="ENTRAR" size={60} />
          </>
        }
      />
    </main>
  )
}
