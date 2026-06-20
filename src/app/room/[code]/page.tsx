'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket } from '@/lib/socket/client'
import { playTrack, playSfx, stopTrack } from '@/lib/audio/manager'
import { avisoFromOutcome, avisoFromAnswer } from '@/lib/game/aviso'
import type { Room, Player, CategoryResult, Category, PlayerAnswer } from '@/lib/game/types'
import { ALL_CATEGORIES } from '@/lib/game/config'

interface PageProps {
  params: Promise<{ code: string }>
}

export default function RoomPage({ params }: PageProps) {
  const { code } = use(params)
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [phase, setPhase] = useState<Room['phase']>('lobby')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [letter, setLetter] = useState('')
  const [timer, setTimer] = useState(0)
  const [stoppedBy, setStoppedBy] = useState<string | null>(null)
  const [results, setResults] = useState<CategoryResult[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [isSpectating, setIsSpectating] = useState(false)
  const [showDemora, setShowDemora] = useState(false)
  const [rematchCountdown, setRematchCountdown] = useState(20)
  const [rematchReady, setRematchReady] = useState(false)

  const answersRef = useRef<Record<string, string>>({})
  const sentAnswers = useRef(false)
  const demoraTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  useEffect(() => {
    const socket = connectSocket()

    socket.on('room:state', (r) => {
      setRoom(r)
      setPlayers(r.players)
      setPhase(r.phase)
      const me = r.players.find((p) => p.id === socket.id)
      setIsHost(me?.isHost ?? false)
      setIsSpectating(me?.spectating ?? false)
    })

    socket.on('room:players', (ps) => {
      setPlayers(ps)
      const me = ps.find((p) => p.id === socket.id)
      setIsHost(me?.isHost ?? false)
      setIsSpectating(me?.spectating ?? false)
    })
    socket.on('game:phase', (p) => {
      setPhase(p)
      if (p === 'rematch') {
        setRematchCountdown(20)
        setRematchReady(false)
        stopTrack()
      }
      if (p === 'playing') {
        sentAnswers.current = false
        answersRef.current = {}
        setAnswers({})
        setStoppedBy(null)
        setShowDemora(false)
        playTrack('game', 0.35)
        demoraTimer.current = setTimeout(() => {
          const hasAnswer = Object.values(answersRef.current).some((a) => a.trim() !== '')
          if (!hasAnswer) setShowDemora(true)
        }, 10000)
      } else if (p === 'review') {
        playTrack('review', 0.3)
      } else if (p === 'stopping') {
        playSfx('stop')
        stopTrack()
      } else if (p === 'finished') {
        stopTrack()
      } else {
        setShowDemora(false)
        if (demoraTimer.current) clearTimeout(demoraTimer.current)
      }
      if (p !== 'playing') {
        setShowDemora(false)
        if (demoraTimer.current) clearTimeout(demoraTimer.current)
      }
    })
    socket.on('game:countdown', (s) => setCountdown(s))
    socket.on('game:letter', (l) => {
      setLetter(l)
      setCountdown(null)
      // ~20% de chance de exibir um easter egg antes da letra
      if (Math.random() < 0.2) {
        const n = Math.floor(Math.random() * 10) + 1 // até 10 imagens easter/1.png..10.png
        setEasterEgg(`/easter/${n}.png`)
        setTimeout(() => setEasterEgg(null), 3000) // some após 3s
      } else {
        setEasterEgg(null)
      }
    })
    socket.on('game:timer', (r) => setTimer(r))
    socket.on('game:stopped', (by) => setStoppedBy(by))
    socket.on('review:results', (r) => setResults(r))
    socket.on('scoreboard:update', (ps) => setPlayers(ps))
    socket.on('room:error', (msg) => setError(msg))
    socket.on('rematch:countdown', (s) => setRematchCountdown(s))

    // Pede o estado atual ao servidor — resolve race condition entre criação e navegação
    const requestSync = () => socket.emit('room:sync')
    if (socket.connected) {
      requestSync()
    } else {
      socket.once('connect', requestSync)
    }

    return () => {
      socket.off('room:state')
      socket.off('room:players')
      socket.off('game:phase')
      socket.off('game:countdown')
      socket.off('game:letter')
      socket.off('game:timer')
      socket.off('game:stopped')
      socket.off('review:results')
      socket.off('scoreboard:update')
      socket.off('room:error')
      socket.off('rematch:countdown')
      if (demoraTimer.current) clearTimeout(demoraTimer.current)
    }
  }, [])

  useEffect(() => {
    if (phase === 'stopping' && !sentAnswers.current) {
      sentAnswers.current = true
      const socket = connectSocket()
      socket.emit('game:answers', answersRef.current)
    }
  }, [phase])

  function handleStart() {
    const socket = connectSocket()
    socket.emit('room:start', (res) => {
      if (!res.ok) setError(res.error ?? 'Erro ao iniciar')
    })
  }

  function handleStop() {
    connectSocket().emit('game:stop')
  }

  function updateAnswer(catId: string, value: string) {
    answersRef.current[catId] = value
    setAnswers({ ...answersRef.current })
    // Esconde demora.png assim que o jogador começa a digitar
    if (value.trim()) setShowDemora(false)
  }

  function handleNextRound() {
    if (!room) return
    if (isHost) connectSocket().emit('room:start', () => {})
  }

  function handleRematchReady() {
    setRematchReady(true)
    connectSocket().emit('rematch:ready')
  }

  if (!room && phase === 'lobby') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#1A1A2E' }}>
        <p className="opacity-60 animate-pulse">Conectando à sala {code}…</p>
      </main>
    )
  }

  if (error && !room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#1A1A2E' }}>
        <Image src="/erro sistema.png" alt="Erro" width={240} height={240} />
        <p className="font-bold text-center" style={{ color: '#FF6B6B' }}>{error}</p>
        <button onClick={() => router.push('/')} className="text-sm opacity-60">← Voltar ao início</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {phase === 'lobby' && (
        <LobbyView
          room={room}
          players={players}
          code={code}
          isHost={isHost}
          onStart={handleStart}
          error={error}
        />
      )}

      {/* Easter egg — aparece ~20% das rodadas por 3s antes da letra */}
      {easterEgg && phase === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-letter-enter" style={{ backgroundColor: '#1A1A2E' }}>
          <Image src={easterEgg} alt="" width={320} height={320} style={{ objectFit: 'contain' }} onError={() => setEasterEgg(null)} />
        </div>
      )}

      {/* Revelação da letra: countdown ativo mas sem número ainda */}
      {phase === 'countdown' && letter && countdown === null && !easterEgg && (
        <LetterRevealView letter={letter} />
      )}

      {/* Contagem regressiva: 3, 2, 1, VAI */}
      {phase === 'countdown' && countdown !== null && (
        <CountdownView count={countdown} />
      )}

      {phase === 'playing' && room && !isSpectating && (
        <PlayingView
          letter={letter}
          timer={timer}
          categories={room.settings.categories}
          answers={answers}
          onChange={updateAnswer}
          onStop={handleStop}
          showDemora={showDemora}
        />
      )}

      {phase === 'playing' && isSpectating && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <div className="rounded-full flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={70} height={70} />
          </div>
          <p className="text-xl font-bold" style={{ color: '#FFD93D' }}>Rodada em andamento</p>
          <p className="text-sm opacity-50 text-center">Você entrará na próxima rodada.<br />Acompanhe a conferência!</p>
          <div className="rounded-2xl p-4 w-full max-w-xs" style={{ backgroundColor: '#0F3460' }}>
            <p className="text-xs opacity-50 mb-2 uppercase tracking-wider">Jogadores</p>
            {players.filter((p) => !p.spectating).map((p) => (
              <div key={p.id} className="flex justify-between py-1">
                <span className="text-sm">{p.nickname}</span>
                <span className="text-sm font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(phase === 'stopping' || phase === 'review') && (
        <ReviewView
          letter={letter}
          results={results}
          players={players}
          stoppedBy={stoppedBy}
          phase={phase}
          isHost={isHost}
          onNext={handleNextRound}
          maxRounds={room?.settings.maxRounds ?? 5}
          currentRound={room?.rounds.length ?? 0}
        />
      )}

      {phase === 'finished' && (
        <FinishedView
          players={players}
          onHome={() => router.push('/')}
        />
      )}

      {phase === 'rematch' && (
        <RematchView
          players={players}
          countdown={rematchCountdown}
          ready={rematchReady}
          onReady={handleRematchReady}
        />
      )}
    </main>
  )
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

function LobbyView({
  room, players, code, isHost, onStart, error,
}: {
  room: Room | null
  players: Player[]
  code: string
  isHost: boolean
  onStart: () => void
  error: string
}) {
  const [selectedCats, setSelectedCats] = useState<string[]>(
    room?.settings.categories.map((c) => c.id) ?? ALL_CATEGORIES.slice(0, 6).map((c) => c.id),
  )
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [showCats, setShowCats] = useState(false)

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 8 ? [...prev, id] : prev,
    )
  }

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied('code')
    setTimeout(() => setCopied(null), 2000)
  }

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied('link')
    setTimeout(() => setCopied(null), 2000)
  }

  function shareLink() {
    const url = `${window.location.origin}/room/${code}`
    if (typeof navigator.share === 'function') {
      navigator.share({ title: 'STOP - ADEDONHA', text: `Entre na sala com o código ${code}`, url })
    } else {
      copyLink()
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 gap-4 max-w-md mx-auto w-full min-h-screen">

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="STOP - ADEDONHA" width={140} style={{ height: 'auto', display: 'block' }} />

      {/* ── Compartilhar ── */}
      <div
        className="w-full rounded-2xl p-4 flex flex-col items-center gap-3"
        style={{ backgroundColor: '#0F3460', border: '2px solid #FFD93D' }}
      >
        <p className="text-xs font-bold uppercase tracking-widest opacity-50">Convide seus amigos</p>

        {/* Código — clica para copiar */}
        <button
          onClick={copyCode}
          className="flex items-center gap-2 active:scale-95 transition-transform"
          title="Clique para copiar"
        >
          <span className="text-5xl font-black tracking-[0.25em]" style={{ color: '#FFD93D' }}>{code}</span>
          <span className="text-xl opacity-60">{copied === 'code' ? '✅' : '📋'}</span>
        </button>

        {copied === 'code' && (
          <p className="text-xs font-bold -mt-1 animate-fade-in" style={{ color: '#95E06C' }}>Código copiado!</p>
        )}

        <div className="flex gap-2 w-full">
          <button
            onClick={copyLink}
            className="flex-1 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
            style={{ backgroundColor: '#16213E', color: copied === 'link' ? '#95E06C' : '#4ECDC4' }}
          >
            {copied === 'link' ? '✅ Copiado!' : '🔗 Copiar link'}
          </button>
          <button
            onClick={shareLink}
            className="flex-1 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
            style={{ backgroundColor: '#16213E', color: '#FF9500' }}
          >
            📤 Compartilhar
          </button>
        </div>
      </div>

      {/* ── Jogadores ── */}
      <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F3460' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">Na sala</p>
          <span className="text-xs opacity-40">{players.length}/10</span>
        </div>

        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-1">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: p.isHost ? '#FFD93D' : p.spectating ? '#ffffff22' : '#4ECDC4', color: '#1A1A2E' }}
              >
                {p.nickname[0].toUpperCase()}
              </span>
              <span className="font-medium flex-1" style={{ opacity: p.spectating ? 0.6 : 1 }}>{p.nickname}</span>
              {p.isHost && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFD93D22', color: '#FFD93D' }}>host</span>
              )}
              {p.spectating && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ffffff11', color: '#ffffff60' }}>assistindo</span>
              )}
            </li>
          ))}
        </ul>

        {players.length === 1 && (
          <p className="text-xs opacity-40 text-center animate-pulse">Aguardando amigos entrarem…</p>
        )}
      </div>

      {/* ── Categorias (host, colapsável) ── */}
      {isHost && (
        <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F3460' }}>
          <button
            onClick={() => setShowCats((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between active:opacity-70"
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">Categorias ({selectedCats.length}/8)</p>
            <span className="opacity-40 text-sm">{showCats ? '▲' : '▼'}</span>
          </button>

          {showCats && (
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const sel = selectedCats.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCat(cat.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: sel ? '#FF6B6B' : '#16213E',
                      color: sel ? 'white' : '#ffffff80',
                      border: sel ? '2px solid #FF6B6B' : '2px solid transparent',
                    }}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <div className="flex-1" />

      {/* ── Botão iniciar ── */}
      {isHost ? (
        <div className="w-full flex flex-col gap-2 pb-2">
          <button
            onClick={onStart}
            disabled={players.length < 2}
            className="w-full py-5 text-2xl font-bold rounded-2xl text-white shadow-xl active:scale-95 transition-all disabled:opacity-40"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            ▶ Iniciar Partida
          </button>
          {players.length < 2 && (
            <p className="text-center text-xs opacity-40">Precisa de pelo menos 2 jogadores para iniciar</p>
          )}
        </div>
      ) : (
        <div className="w-full py-4 rounded-2xl text-center" style={{ backgroundColor: '#0F3460' }}>
          <p className="opacity-60 text-sm animate-pulse">Aguardando o host iniciar a partida…</p>
        </div>
      )}
    </div>
  )
}

// ─── Letter Reveal ───────────────────────────────────────────────────────────

function LetterRevealView({ letter }: { letter: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-screen gap-6"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      <p className="text-lg font-bold opacity-60 uppercase tracking-widest">A letra é</p>
      <div
        className="rounded-full flex items-center justify-center animate-letter-enter"
        style={{
          width: 280,
          height: 280,
          backgroundColor: '#FFD93D',
          boxShadow: '0 0 60px rgba(255,217,61,0.5)',
        }}
      >
        <Image
          key={letter}
          src={`/letras/${letter}.png`}
          alt={letter}
          width={220}
          height={220}
          priority
        />
      </div>
    </div>
  )
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function CountdownView({ count }: { count: number }) {
  const imgMap: Record<number, string> = {
    3: '/contagem/03.png',
    2: '/contagem/02.png',
    1: '/contagem/01.png',
    0: '/contagem/vai.png',
  }
  const src = imgMap[count] ?? '/contagem/vai.png'

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#1A1A2E' }}>
      <Image
        key={count}
        src={src}
        alt={String(count)}
        width={300}
        height={300}
        className="animate-letter-enter"
        priority
      />
    </div>
  )
}

// ─── Playing ─────────────────────────────────────────────────────────────────

function PlayingView({
  letter, timer, categories, answers, onChange, onStop, showDemora,
}: {
  letter: string
  timer: number
  categories: Category[]
  answers: Record<string, string>
  onChange: (id: string, value: string) => void
  onStop: () => void
  showDemora: boolean
}) {
  const urgent = timer <= 10

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header com letra e timer */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{ backgroundColor: '#1A1A2E' }}
      >
        {/* Letra no canto */}
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{ width: 56, height: 56, backgroundColor: '#FFD93D' }}
        >
          <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={44} height={44} priority />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: urgent ? '#FF6B6B' : '#FFD93D' }}
          >
            {timer}s
          </span>
          <div className="w-32 h-2 rounded-full" style={{ backgroundColor: '#0F3460' }}>
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, Math.min(100, (timer / 90) * 100))}%`,
                backgroundColor: urgent ? '#FF6B6B' : '#4ECDC4',
              }}
            />
          </div>
        </div>
      </div>

      {/* Banner "demora.png" quando jogador não respondeu nada em 10s */}
      {showDemora && (
        <div className="flex items-center justify-center py-2 animate-fade-in">
          <Image src="/aviso/demora.png" alt="Está demorando!" width={260} height={130} />
        </div>
      )}

      {/* Campos de resposta */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-60">
              {cat.label}
            </label>
            <input
              type="text"
              value={answers[cat.id] ?? ''}
              onChange={(e) => onChange(cat.id, e.target.value)}
              maxLength={80}
              placeholder={`${cat.label} com ${letter}…`}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
              style={{ backgroundColor: '#0F3460', border: '2px solid #16213E' }}
              onFocus={(e) => (e.target.style.borderColor = '#4ECDC4')}
              onBlur={(e) => (e.target.style.borderColor = '#16213E')}
            />
          </div>
        ))}
      </div>

      {/* Botão STOP flutuante */}
      <button
        onClick={onStop}
        className="fixed right-6 z-40 animate-pulse-stop font-extrabold text-white shadow-2xl active:scale-90 transition-transform"
        style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#FF6B6B', fontSize: 13, border: '3px solid #FFD93D', bottom: 88 }}
      >
        STOP!
      </button>
    </div>
  )
}

// ─── Review ──────────────────────────────────────────────────────────────────

const REVIEW_SECS = 5

interface ReviewCategoryCardProps {
  cat: CategoryResult
  idx: number
  total: number
  letter: string
  isLast: boolean
  getAviso: (a: PlayerAnswer, letter: string, idx: number) => string
  onNext: () => void
}

function ReviewCategoryCard({ cat, idx, total, letter, isLast, getAviso, onNext }: ReviewCategoryCardProps) {
  const [elapsed, setElapsed] = useState(0)
  const onNextRef = useRef(onNext)
  onNextRef.current = onNext

  useEffect(() => {
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        if (next >= REVIEW_SECS) {
          clearInterval(interval)
          onNextRef.current()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cat.categoryId])

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={34} height={34} />
          </div>
          <span className="text-sm opacity-50">{idx + 1} / {total}</span>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: '#4ECDC4' }}>
          {REVIEW_SECS - elapsed}s
        </span>
      </div>

      <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: '#0F3460' }}>
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min((elapsed / REVIEW_SECS) * 100, 100)}%`, backgroundColor: isLast ? '#FF6B6B' : '#4ECDC4' }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 animate-slide-up">
        <h2 className="text-3xl font-bold text-center" style={{ color: '#FFD93D' }}>
          {cat.categoryLabel}
        </h2>

        <div className="flex flex-col gap-3">
          {cat.answers.map((a, ai) => (
            <div
              key={a.playerId}
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{ backgroundColor: '#0F3460' }}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs opacity-60 font-medium">{a.nickname}</span>
                <span className="text-xl font-bold truncate" style={{ color: a.valid ? '#95E06C' : a.answer ? '#FF6B6B' : '#ffffff30' }}>
                  {a.answer || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Image src={getAviso(a, letter, idx + ai)} alt="" width={72} height={72} />
                <span className="font-bold text-lg w-10 text-right" style={{ color: a.points > 0 ? '#FFD93D' : '#ffffff40' }}>
                  {a.points > 0 ? `+${a.points}` : '0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onNext} className="mt-6 py-3 w-full text-sm opacity-40 active:opacity-70 transition-opacity">
        Toque para pular →
      </button>
    </div>
  )
}

function getAviso(answer: PlayerAnswer, letter: string, idx = 0): string {
  if (answer.outcome) return avisoFromOutcome(answer.outcome)
  return avisoFromAnswer(answer.answer ?? '', letter, idx)
}

function ReviewView({
  letter, results, players, stoppedBy, phase, isHost, onNext, maxRounds, currentRound,
}: {
  letter: string
  results: CategoryResult[]
  players: Player[]
  stoppedBy: string | null
  phase: Room['phase']
  isHost: boolean
  onNext: () => void
  maxRounds: number
  currentRound: number
}) {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState<'words' | 'summary'>('words')
  const isLastRound = currentRound >= maxRounds

  // Reseta quando chegam novos resultados
  useEffect(() => { setIdx(0); setStep('words') }, [results])

  // Aguardando validação — mostra cachorra.png
  if (phase === 'stopping' || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <Image src="/cachorra.png" alt="STOP!" width={240} height={240} className="animate-letter-enter" priority />
        <p className="text-xl font-bold" style={{ color: '#FF6B6B' }}>
          {stoppedBy ? `${stoppedBy} deu STOP!` : 'STOP! Tempo esgotado!'}
        </p>
        <p className="text-sm opacity-50 animate-pulse">Corrigindo respostas…</p>
      </div>
    )
  }

  // ── Palavra por palavra — auto-avança em 5s ──
  if (step === 'words') {
    const cat = results[idx]
    if (!cat) { setStep('summary'); return null }
    const isLast = idx === results.length - 1
    const advance = () => isLast ? setStep('summary') : setIdx((i) => Math.min(i + 1, results.length - 1))

    return (
      <ReviewCategoryCard
        key={cat.categoryId}
        cat={cat}
        idx={idx}
        total={results.length}
        letter={letter}
        isLast={isLast}
        getAviso={getAviso}
        onNext={advance}
      />
    )
  }

  // ── Resumo final ──
  return (
    <div className="flex flex-col min-h-screen px-4 py-6 gap-4 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, backgroundColor: '#FFD93D' }}>
          <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={34} height={34} />
        </div>
        <h2 className="text-xl font-bold">Resumo da Rodada</h2>
      </div>

      {/* Tabela de respostas por jogador */}
      {players.map((player) => (
        <div key={player.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F3460' }}>
          <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: '#16213E' }}>
            <span className="font-bold">{player.nickname}</span>
            <span className="font-bold text-sm" style={{ color: '#FFD93D' }}>
              {results.reduce((s, cat) => {
                const a = cat.answers.find((a) => a.playerId === player.id)
                return s + (a?.points ?? 0)
              }, 0)} pts nessa rodada
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: '#1A1A2E' }}>
            {results.map((cat, ci) => {
              const a = cat.answers.find((ans) => ans.playerId === player.id)
              return (
                <div key={cat.categoryId} className="px-4 py-2 flex items-center justify-between gap-2">
                  <span className="text-xs opacity-50 w-20 shrink-0">{cat.categoryLabel}</span>
                  <span
                    className="flex-1 text-sm font-medium truncate"
                    style={{ color: a?.valid ? '#95E06C' : a?.answer ? '#FF6B6B' : '#ffffff30' }}
                  >
                    {a?.answer || '—'}
                  </span>
                  <Image src={getAviso(a ?? { answer: '', valid: false, points: 0, duplicate: false, playerId: '', nickname: '' }, letter, ci)} alt="" width={32} height={32} />
                  <span className="text-sm font-bold w-8 text-right" style={{ color: (a?.points ?? 0) > 0 ? '#FFD93D' : '#ffffff40' }}>
                    {(a?.points ?? 0) > 0 ? `+${a!.points}` : '0'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Placar geral */}
      <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0F3460' }}>
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Placar Geral</p>
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-50 w-4">{i + 1}.</span>
              <span className="font-medium">{p.nickname}</span>
            </div>
            <span className="font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
          </div>
        ))}
      </div>

      {isHost ? (
        <button
          onClick={onNext}
          className="w-full py-4 text-xl font-bold rounded-2xl text-white active:scale-95 transition-all"
          style={{ backgroundColor: isLastRound ? '#FF6B6B' : '#4ECDC4', color: isLastRound ? 'white' : '#1A1A2E' }}
        >
          {isLastRound ? 'Ver Resultado Final' : 'Próxima Rodada'}
        </button>
      ) : (
        <p className="text-center opacity-50 text-sm pb-4">Aguardando o host…</p>
      )}
    </div>
  )
}

// ─── Finished ────────────────────────────────────────────────────────────────

function getPositionAviso(index: number, total: number): string | null {
  if (index === 0) return '/aviso/vencedor.png'
  if (index === 1 && total > 2) return '/aviso/quase.png'
  if (index === total - 1 && total > 1) return '/aviso/perdeu.png'
  return null
}

function FinishedView({ players, onHome }: { players: Player[]; onHome: () => void }) {
  const winner = players[0]

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 gap-4 max-w-md mx-auto w-full">
      <Image src="/aviso/vencedor.png" alt="Vencedor!" width={180} height={180} className="animate-letter-enter" />
      <h2 className="text-3xl font-bold text-center" style={{ color: '#FFD93D' }}>
        {winner?.nickname} venceu!
      </h2>

      {/* Ranking */}
      <div className="w-full flex flex-col gap-2">
        {players.map((p, i) => {
          const aviso = getPositionAviso(i, players.length)
          const medalColor = i === 0 ? '#FFD93D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'white'
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-up"
              style={{ backgroundColor: i === 0 ? '#1a1a0a' : '#0F3460', animationDelay: `${i * 80}ms`, border: i === 0 ? '2px solid #FFD93D44' : 'none' }}
            >
              <span className="text-xl font-black w-6 text-center" style={{ color: medalColor }}>{i + 1}</span>
              <Image src={p.avatar || '/avatar/avatar_01.png'} alt={p.nickname} width={40} height={40} className="rounded-full" />
              <span className="font-semibold flex-1">{p.nickname}</span>
              {aviso && <Image src={aviso} alt="" width={36} height={36} />}
              <span className="font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
            </div>
          )
        })}
      </div>

      <div className="flex-1" />

      <p className="text-sm opacity-50 animate-pulse">Preparando próxima partida…</p>

      <button
        onClick={onHome}
        className="w-full py-3 text-base font-bold rounded-2xl active:scale-95 transition-all"
        style={{ backgroundColor: '#16213E', color: '#ffffff60' }}
      >
        Sair
      </button>
    </div>
  )
}

function RematchView({ players, countdown, ready, onReady }: {
  players: Player[]
  countdown: number
  ready: boolean
  onReady: () => void
}) {
  const readyCount = players.filter((p) => p.rematchReady).length
  const total = players.filter((p) => !p.spectating).length

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-center" style={{ color: '#FFD93D' }}>Jogar de novo?</h2>

      {/* Contador */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black"
        style={{ backgroundColor: '#0F3460', border: `4px solid ${countdown <= 5 ? '#FF6B6B' : '#4ECDC4'}`, color: countdown <= 5 ? '#FF6B6B' : '#FFD93D' }}
      >
        {countdown}
      </div>

      <p className="text-sm opacity-60 text-center">
        Jogo começa em {countdown}s ou quando todos aceitarem<br />
        ({readyCount}/{total} prontos)
      </p>

      {/* Lista de jogadores */}
      <div className="w-full flex flex-col gap-2">
        {players.filter((p) => !p.spectating).map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-2xl" style={{ backgroundColor: '#0F3460' }}>
            <Image src={p.avatar || '/avatar/avatar_01.png'} alt={p.nickname} width={36} height={36} className="rounded-full" />
            <span className="flex-1 font-medium">{p.nickname}</span>
            <span className="text-lg">{p.rematchReady ? '✅' : '⏳'}</span>
          </div>
        ))}
      </div>

      {!ready ? (
        <button
          onClick={onReady}
          className="w-full py-5 text-2xl font-bold rounded-2xl text-white active:scale-95 transition-all shadow-xl animate-pulse-stop"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          ✅ Topo! Vamos jogar!
        </button>
      ) : (
        <div className="w-full py-4 rounded-2xl text-center" style={{ backgroundColor: '#0F3460' }}>
          <p className="font-bold animate-pulse" style={{ color: '#95E06C' }}>Aguardando os outros…</p>
        </div>
      )}
    </div>
  )
}
