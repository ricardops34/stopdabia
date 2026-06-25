'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'
import { connectSocket } from '@/lib/socket/client'
import { signInWithGoogle, signOut } from '@/lib/supabase/auth'
import { createClient, supabaseConfigured } from '@/lib/supabase/client'

type View = 'home' | 'play' | 'friends'

const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatar/avatar_${String(i + 1).padStart(2, '0')}.png`)

const BG_LETTERS = [
  // Topo (bem coladas na borda superior)
  { l: 'a', top: '1%',  left: '-1%', size: 38, rot: -18, op: 0.80 },
  { l: 'b', top: '3%',  left: '13%', size: 28, rot:  12, op: 0.72 },
  { l: 'c', top: '0%',  left: '30%', size: 34, rot:  -8, op: 0.76 },
  { l: 'd', top: '3%',  left: '50%', size: 26, rot:  16, op: 0.70 },
  { l: 'e', top: '1%',  left: '66%', size: 36, rot: -10, op: 0.78 },
  { l: 'f', top: '4%',  left: '82%', size: 26, rot:  20, op: 0.72 },
  // Lado direito (bem coladas na borda direita, fora da área de conteúdo)
  { l: 'g', top: '15%', left: '91%', size: 30, rot:   8, op: 0.75 },
  { l: 'h', top: '28%', left: '90%', size: 34, rot: -15, op: 0.78 },
  { l: 'i', top: '42%', left: '92%', size: 22, rot:  22, op: 0.68 },
  { l: 'j', top: '56%', left: '90%', size: 32, rot: -10, op: 0.74 },
  // Lado esquerdo (bem coladas na borda esquerda, fora da área de conteúdo)
  { l: 'l', top: '15%', left: '-2%', size: 26, rot:  18, op: 0.72 },
  { l: 'm', top: '28%', left: '-1%', size: 32, rot:  -8, op: 0.76 },
  { l: 'n', top: '42%', left: '-2%', size: 24, rot:  14, op: 0.68 },
  { l: 'o', top: '56%', left: '-1%', size: 30, rot: -20, op: 0.74 },
  // Embaixo — acima da barra (top 74–80%)
  { l: 'p', top: '74%', left: '-1%', size: 28, rot:  16, op: 0.74 },
  { l: 'q', top: '77%', left: '14%', size: 24, rot: -14, op: 0.70 },
  { l: 'r', top: '75%', left: '34%', size: 28, rot:   8, op: 0.72 },
  { l: 's', top: '77%', left: '54%', size: 24, rot: -18, op: 0.68 },
  { l: 't', top: '75%', left: '73%', size: 28, rot:  12, op: 0.74 },
  { l: 'u', top: '74%', left: '90%', size: 26, rot: -10, op: 0.70 },
  // Extras nos cantos
  { l: 'v', top: '69%', left: '91%', size: 24, rot:  -6, op: 0.68 },
  { l: 'z', top: '69%', left: '-1%', size: 26, rot:  20, op: 0.70 },
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
          className="flex flex-1 items-center gap-3 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingTop: 8, paddingBottom: 8 } as React.CSSProperties}
        >
          {AVATARS.map((avatarSrc) => {
            const isSel = selected === avatarSrc
            const sz = isSel ? 100 : 64
            return (
            <button
              key={avatarSrc}
              onClick={() => onSelect(avatarSrc)}
              className="snap-center shrink-0 rounded-full"
              style={{
                width: sz,
                height: sz,
                border: isSel ? '3px solid #FFD93D' : '3px solid rgba(255,255,255,0.18)',
                backgroundColor: isSel ? 'rgba(255,217,61,0.1)' : 'rgba(0,0,0,0.18)',
                padding: isSel ? 5 : 3,
                boxShadow: isSel ? '0 0 14px rgba(255,217,61,0.4)' : 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <Image src={avatarSrc} alt="avatar" width={isSel ? 86 : 54} height={isSel ? 86 : 54} className="rounded-full object-cover" />
            </button>
          )})}
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
        className="transition-transform active:scale-95"
      >
        <Image src="/icons/btn_login.png" alt="LOGIN" width={110} height={40} style={{ objectFit: 'contain' }} />
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

function OpenRoomsList({ onSelect, onJoin }: { onSelect: (code: string) => void; onJoin: (code: string) => void }) {
  const [rooms, setRooms] = useState<{ code: string; players: number; max: number; host: string }[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/rooms')
        const data = await res.json() as { rooms: typeof rooms }
        setRooms(data.rooms)
      } catch { /* silencioso */ }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full flex flex-col gap-2">
      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Salas abertas</span>
      {rooms.length === 0 ? (
        <p className="text-center text-sm py-3 rounded-xl" style={{ color: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
          Nenhuma sala aberta no momento
        </p>
      ) : rooms.map((r) => (
        <button
          key={r.code}
          onClick={() => { onSelect(r.code); onJoin(r.code) }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#0F3460', border: '2px solid rgba(78,205,196,0.3)' }}
        >
          <div className="flex flex-col items-start">
            <span className="text-lg font-extrabold tracking-widest" style={{ color: '#4ECDC4' }}>{r.code}</span>
            <span className="text-xs opacity-50">Criador: {r.host}</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#FFD93D' }}>{r.players}/10 jogadores</span>
        </button>
      ))}
    </div>
  )
}

function FormScreen({
  title,
  dogSrc,
  showLogo,
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
  showLogo?: boolean
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
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden" style={{ backgroundColor: '#0a1628', backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px' }}>
      <BackgroundLetters />
      <div className="pointer-events-none absolute left-4 top-0 opacity-90">
        <Image src="/trail/fio_bg.png" alt="" width={52} height={180} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-5 overflow-y-auto px-6 pb-32 pt-8">
        <div className="flex flex-col items-center gap-3">
          {showLogo
            ? <Image src="/logo.png" alt="STOP ADEDONHA" width={160} height={160} className="animate-pulse-logo object-contain" />
            : <Image src={dogSrc} alt="" width={120} height={120} className="object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]" />
          }
          <h2 className="text-3xl font-extrabold text-[#F8E7BF]">{title}</h2>
        </div>
        {children}
      </div>

      <BottomBar
        center={
          <>
            <BtnSecondary onClick={onBack} iconSrc="/icons/btn_voltar.png" label="VOLTAR" size={64} />
            <BtnPrimary
              onClick={onAction}
              icon={actionLoading ? '...' : undefined}
              iconSrc={actionLoading ? undefined : actionIconSrc}
              label={actionLoading ? 'AGUARDE' : actionLabel}
              color={actionColor}
              disabled={actionDisabled}
              pulse
              size={64}
            />
          </>
        }
      />
    </main>
  )
}

const TAGLINE_WORDS = ['O', 'jogo', 'de', 'STOP', 'mais', 'divertido!']
const TOTAL_LETTERS = TAGLINE_WORDS.join('').length
const CYCLE = 2.8

function TaglineBanner() {
  let idx = 0
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 8px', padding: '0 8px' }}>
      {TAGLINE_WORDS.map((word, wi) => {
        const isStop = word === 'STOP'
        const size = isStop ? 34 : 24
        return (
          <div
            key={wi}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isStop ? 3 : 2,
              filter: isStop ? 'drop-shadow(0 0 6px rgba(255,107,107,0.7))' : undefined,
            }}
          >
            {word.split('').map((ch, ci) => {
              const delay = `${((idx++ / TOTAL_LETTERS) * CYCLE).toFixed(2)}s`
              const l = ch.toLowerCase()
              if (/[a-z]/.test(l)) {
                return (
                  <Image
                    key={ci}
                    src={`/icons/letra_${l}.png`}
                    alt={ch}
                    width={size}
                    height={size}
                    className="animate-letter-wave"
                    style={{ objectFit: 'contain', display: 'block', animationDelay: delay }}
                  />
                )
              }
              return (
                <span
                  key={ci}
                  className="animate-letter-wave"
                  style={{ display: 'inline-block', color: '#FFD93D', fontWeight: 900, fontSize: 18, lineHeight: 1, animationDelay: delay }}
                >
                  {ch}
                </span>
              )
            })}
          </div>
        )
      })}
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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setCachorra(Math.floor(Math.random() * 5) + 1)

    const saved = localStorage.getItem('stop_player')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { nickname?: string; avatar?: string }
        if (parsed.nickname) setNickname(parsed.nickname)
        if (parsed.avatar && AVATARS.includes(parsed.avatar)) setAvatar(parsed.avatar)
      } catch {}
    }

    if (!supabaseConfigured) return

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

  function handleJoinFriends(roomCode?: string) {
    const finalCode = (roomCode ?? code).trim().toUpperCase()
    setError('')
    if (nickname.trim().length < 3) {
      if (roomCode) setCode(roomCode)
      setError('Preencha seu apelido antes de entrar')
      return
    }
    if (finalCode.length < 6) {
      setError('Codigo invalido')
      return
    }

    setLoading(true)
    const socket = connectSocket()
    const doJoin = () => {
      socket.emit('room:join', finalCode, nickname.trim(), avatar, (res: { ok?: boolean; error?: string }) => {
        setLoading(false)
        if (!res.ok) {
          setError(res.error ?? 'Erro ao entrar')
          return
        }
        savePlayer(nickname.trim(), avatar)
        saveSession(finalCode, nickname.trim())
        router.push(`/room/${finalCode}`)
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
        showLogo
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
        showLogo
        onBack={back}
        actionIconSrc="/icons/btn_entrar_sala.png"
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
          <span className="text-sm font-bold text-white/65">Código da sala</span>
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
        <OpenRoomsList onSelect={(c) => setCode(c)} onJoin={(c) => handleJoinFriends(c)} />
        {error && <p className="text-center text-sm font-bold text-yellow-200">{error}</p>}
      </FormScreen>
    )
  }

  return (
    <main style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100dvh', overflow: 'hidden', backgroundColor: '#0a1628', backgroundImage: 'url(/ui/barra_fundo.png)', backgroundRepeat: 'repeat', backgroundSize: '200px' }}>
      <BackgroundLetters />

      <div style={{ pointerEvents: 'none', position: 'absolute', left: 16, top: 0, opacity: 0.9, zIndex: 5 }}>
        <Image src="/trail/fio_bg.png" alt="" width={52} height={180} />
      </div>

      <button
        onClick={() => router.push('/sobre')}
        className="transition-transform active:scale-90"
        style={{ position: 'absolute', left: 14, top: 14, zIndex: 20 }}
        aria-label="Sobre o jogo"
      >
        <Image src="/icons/btn_coracao.png" alt="Sobre" width={44} height={44} style={{ objectFit: 'contain' }} />
      </button>

      <div style={{ position: 'absolute', right: 16, top: 14, zIndex: 20 }}>
        <LoginBadge
          user={user}
          avatarPath={avatar}
          onLogin={signInWithGoogle}
          onLogout={signOut}
          onRanking={() => router.push('/ranking')}
        />
      </div>

      <section
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 10, padding: '68px 12px 96px', flex: 1, minHeight: '100dvh', boxSizing: 'border-box' }}
      >
        <Image
          src="/imagens/logo-home.png"
          alt="STOP ADEDONHA"
          width={390}
          height={280}
          className="animate-pulse-logo"
          style={{ maxHeight: 'min(22vh, 165px)', width: '100%', objectFit: 'contain', flexShrink: 0 }}
          priority
        />

        <Image
          src={`/cachorra/${cachorra}.png`}
          alt="Mascote STOP"
          width={300}
          height={300}
          className="animate-float-dog"
          style={{ maxHeight: 'min(28vh, 200px)', width: 'auto', objectFit: 'contain', flexShrink: 1, filter: 'drop-shadow(0 24px 52px rgba(0,0,0,0.60))' }}
          priority
        />

        <div style={{ width: '100%', borderRadius: 24, padding: '10px 14px', textAlign: 'center', backgroundColor: 'rgba(8,19,36,0.93)', border: '2px solid rgba(255,217,61,0.22)', boxShadow: '0 10px 28px rgba(0,0,0,0.32)' }}>
          <TaglineBanner />
        </div>
      </section>

      <BottomBar
        spread
        center={
          <>
            <button onClick={() => router.push('/solo')} className="transition-transform active:scale-90">
              <Image src="/icons/btn_individual.png" alt="Individual" width={64} height={64} style={{ objectFit: 'contain' }} />
            </button>
            <button onClick={() => setView('play')} className="transition-transform active:scale-90">
              <Image src="/icons/btn_criar_sala.png" alt="Criar Sala" width={64} height={64} style={{ objectFit: 'contain' }} />
            </button>
            <button onClick={() => setView('friends')} className="transition-transform active:scale-90">
              <Image src="/icons/btn_entrar.png" alt="Entrar" width={64} height={64} style={{ objectFit: 'contain' }} />
            </button>
            <button onClick={() => router.push('/ranking')} className="transition-transform active:scale-90">
              <Image src="/icons/btn_ranking.png" alt="Ranking" width={64} height={64} style={{ objectFit: 'contain' }} />
            </button>
          </>
        }
      />
    </main>
  )
}
