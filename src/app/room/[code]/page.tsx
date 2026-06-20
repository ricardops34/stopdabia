'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket, disconnectSocket } from '@/lib/socket/client'
import type { Room, Player, CategoryResult, Category } from '@/lib/game/types'
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
  const [myId, setMyId] = useState('')
  const [isHost, setIsHost] = useState(false)
  const answersRef = useRef<Record<string, string>>({})
  const sentAnswers = useRef(false)

  useEffect(() => {
    const socket = connectSocket()
    setMyId(socket.id ?? '')

    socket.on('room:state', (r) => {
      setRoom(r)
      setPlayers(r.players)
      setPhase(r.phase)
      const me = r.players.find((p) => p.id === socket.id)
      setIsHost(me?.isHost ?? false)
    })
    socket.on('room:players', (ps) => {
      setPlayers(ps)
      const me = ps.find((p) => p.id === socket.id)
      setIsHost(me?.isHost ?? false)
    })
    socket.on('game:phase', (p) => {
      setPhase(p)
      if (p === 'playing') {
        sentAnswers.current = false
        answersRef.current = {}
        setAnswers({})
        setStoppedBy(null)
      }
    })
    socket.on('game:countdown', (s) => setCountdown(s))
    socket.on('game:letter', (l) => {
      setLetter(l)
      setCountdown(null)
    })
    socket.on('game:timer', (r) => setTimer(r))
    socket.on('game:stopped', (by) => setStoppedBy(by))
    socket.on('review:results', (r) => setResults(r))
    socket.on('scoreboard:update', (ps) => setPlayers(ps))
    socket.on('room:error', (msg) => setError(msg))

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
    const socket = connectSocket()
    socket.emit('game:stop')
  }

  function updateAnswer(catId: string, value: string) {
    answersRef.current[catId] = value
    setAnswers({ ...answersRef.current })
  }

  function handleNextRound() {
    if (!room) return
    if (room.rounds.length >= room.settings.maxRounds) {
      setPhase('finished')
      return
    }
    const socket = connectSocket()
    if (isHost) {
      socket.emit('room:start', () => {})
    }
  }

  if (!room && phase === 'lobby') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="opacity-60">Conectando à sala {code}…</p>
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
      {phase === 'countdown' && countdown !== null && (
        <CountdownView count={countdown} />
      )}
      {phase === 'playing' && room && (
        <PlayingView
          letter={letter}
          timer={timer}
          categories={room.settings.categories}
          answers={answers}
          onChange={updateAnswer}
          onStop={handleStop}
        />
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
      {phase === 'scoreboard' && (
        <ScoreboardView players={players} onNext={handleNextRound} isHost={isHost} />
      )}
      {phase === 'finished' && (
        <FinishedView players={players} onHome={() => router.push('/')} />
      )}
    </main>
  )
}

// ─── Lobby ──────────────────────────────────────────────────────────────────

function LobbyView({
  room,
  players,
  code,
  isHost,
  onStart,
  error,
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

  function toggleCat(id: string) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 8 ? [...prev, id] : prev,
    )
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${code}` : ''

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-6 max-w-md mx-auto w-full">
      <Image src="/inicio.png" alt="STOP - ADEDONHA" width={180} height={90} priority />

      <div
        className="w-full rounded-2xl p-4 flex flex-col gap-2"
        style={{ backgroundColor: '#0F3460' }}
      >
        <p className="text-sm opacity-60">Código da sala</p>
        <p className="text-4xl font-bold tracking-widest" style={{ color: '#FFD93D' }}>
          {code}
        </p>
        <button
          onClick={copyLink}
          className="mt-1 text-sm py-2 px-4 rounded-xl self-start active:scale-95 transition-transform"
          style={{ backgroundColor: '#16213E', color: '#4ECDC4' }}
        >
          Copiar link
        </button>
      </div>

      <div className="w-full rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0F3460' }}>
        <p className="text-sm opacity-60">Jogadores ({players.length}/10)</p>
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.isHost ? '#FFD93D' : '#4ECDC4' }}
              />
              <span className="font-medium">{p.nickname}</span>
              {p.isHost && <span className="text-xs opacity-60">(host)</span>}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F3460' }}>
          <p className="text-sm opacity-60">Categorias (máx. 8)</p>
          <div className="flex flex-wrap gap-2">
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
        </div>
      )}

      {error && (
        <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>
          {error}
        </p>
      )}

      {isHost && (
        <button
          onClick={onStart}
          disabled={players.length < 1}
          className="w-full py-4 text-xl font-bold rounded-2xl text-white shadow-lg active:scale-95 transition-all disabled:opacity-40"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          Iniciar Partida
        </button>
      )}
      {!isHost && (
        <p className="opacity-50 text-center text-sm">Aguardando o host iniciar…</p>
      )}
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
    <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
      <Image
        key={count}
        src={src}
        alt={String(count)}
        width={200}
        height={200}
        className="animate-letter-enter"
        priority
      />
    </div>
  )
}

// ─── Playing ─────────────────────────────────────────────────────────────────

function PlayingView({
  letter,
  timer,
  categories,
  answers,
  onChange,
  onStop,
}: {
  letter: string
  timer: number
  categories: Category[]
  answers: Record<string, string>
  onChange: (id: string, value: string) => void
  onStop: () => void
}) {
  const letterSrc = `/letras/${letter}.png`
  const pct = Math.max(0, Math.min(100, (timer / 90) * 100))
  const urgent = timer <= 10

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: '#1A1A2E' }}>
        <Image src={letterSrc} alt={letter} width={56} height={56} className="animate-letter-enter" />
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: urgent ? '#FF6B6B' : '#FFD93D' }}
          >
            {timer}s
          </span>
          <div className="w-32 h-2 rounded-full" style={{ backgroundColor: '#0F3460' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: urgent ? '#FF6B6B' : '#4ECDC4',
              }}
            />
          </div>
        </div>
      </div>

      {/* Answers */}
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
              placeholder={`${cat.label} com ${letter}...`}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
              style={{ backgroundColor: '#0F3460', border: '2px solid #16213E' }}
              onFocus={(e) => (e.target.style.borderColor = '#4ECDC4')}
              onBlur={(e) => (e.target.style.borderColor = '#16213E')}
            />
          </div>
        ))}
      </div>

      {/* STOP button */}
      <div className="px-4 py-4 sticky bottom-0" style={{ backgroundColor: '#1A1A2E' }}>
        <button
          onClick={onStop}
          className="w-full py-5 text-2xl font-bold rounded-2xl text-white animate-pulse-stop"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          STOP!
        </button>
      </div>
    </div>
  )
}

// ─── Review ──────────────────────────────────────────────────────────────────

function ReviewView({
  letter,
  results,
  players,
  stoppedBy,
  phase,
  isHost,
  onNext,
  maxRounds,
  currentRound,
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
  const isLastRound = currentRound >= maxRounds

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 gap-6 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3">
        <Image src={`/letras/${letter}.png`} alt={letter} width={48} height={48} />
        <div>
          <h2 className="text-xl font-bold">Revisão da Rodada</h2>
          {stoppedBy && (
            <p className="text-sm opacity-60">{stoppedBy} deu STOP!</p>
          )}
          {phase === 'stopping' && !results.length && (
            <p className="text-sm opacity-60">Validando respostas…</p>
          )}
        </div>
      </div>

      {results.map((cat) => (
        <div key={cat.categoryId} className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F3460' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">{cat.categoryLabel}</h3>
          {cat.answers.map((a) => (
            <div key={a.playerId} className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{a.nickname}</span>
                <span className="text-base truncate" style={{ color: a.valid ? '#95E06C' : a.answer ? '#FF6B6B' : '#ffffff40' }}>
                  {a.answer || '(sem resposta)'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.valid ? (
                  <Image src="/aviso/acerto.png" alt="acerto" width={28} height={28} />
                ) : a.answer ? (
                  <Image src="/aviso/erro.png" alt="erro" width={28} height={28} />
                ) : null}
                <span className="font-bold text-sm w-8 text-right" style={{ color: a.points > 0 ? '#FFD93D' : '#ffffff40' }}>
                  {a.points > 0 ? `+${a.points}` : '0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Mini scoreboard */}
      {results.length > 0 && (
        <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0F3460' }}>
          <h3 className="font-bold text-sm uppercase tracking-wider opacity-70">Placar Atual</h3>
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-60 w-4">{i + 1}.</span>
                <span className="font-medium">{p.nickname}</span>
              </div>
              <span className="font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
            </div>
          ))}
        </div>
      )}

      {isHost && results.length > 0 && (
        <button
          onClick={onNext}
          className="w-full py-4 text-xl font-bold rounded-2xl text-white active:scale-95 transition-all"
          style={{ backgroundColor: isLastRound ? '#FF6B6B' : '#4ECDC4', color: isLastRound ? 'white' : '#1A1A2E' }}
        >
          {isLastRound ? 'Ver Resultado Final' : 'Próxima Rodada'}
        </button>
      )}
      {!isHost && results.length > 0 && (
        <p className="text-center opacity-50 text-sm">Aguardando o host…</p>
      )}
    </div>
  )
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function ScoreboardView({
  players,
  onNext,
  isHost,
}: {
  players: Player[]
  onNext: () => void
  isHost: boolean
}) {
  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold">Placar</h2>
      <div className="w-full flex flex-col gap-3">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 rounded-2xl animate-slide-up"
            style={{ backgroundColor: '#0F3460', animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-bold w-8 text-center"
                style={{ color: i === 0 ? '#FFD93D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'white' }}
              >
                {i + 1}
              </span>
              <span className="font-semibold text-lg">{p.nickname}</span>
            </div>
            <span className="font-bold text-xl" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
          </div>
        ))}
      </div>
      {isHost && (
        <button
          onClick={onNext}
          className="w-full py-4 text-xl font-bold rounded-2xl text-white active:scale-95 transition-all mt-4"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          Próxima Rodada
        </button>
      )}
    </div>
  )
}

// ─── Finished ────────────────────────────────────────────────────────────────

function FinishedView({
  players,
  onHome,
}: {
  players: Player[]
  onHome: () => void
}) {
  const winner = players[0]
  const cachorra = useState(() => Math.floor(Math.random() * 4) + 1)[0]

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 gap-6 max-w-md mx-auto w-full">
      <Image src="/aviso/vencedor.png" alt="Vencedor" width={160} height={160} className="animate-letter-enter" />
      <h2 className="text-3xl font-bold text-center" style={{ color: '#FFD93D' }}>
        {winner?.nickname} venceu!
      </h2>

      <div className="w-full flex flex-col gap-3">
        {players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ backgroundColor: '#0F3460' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold w-8 text-center" style={{ color: i === 0 ? '#FFD93D' : 'white' }}>
                {i + 1}
              </span>
              <span className="font-semibold">{p.nickname}</span>
            </div>
            <span className="font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full gap-3 mt-4">
        <Image src={`/cachorra/${cachorra}.png`} alt="cachorra comemorando" width={160} height={160} className="self-center" />
        <button
          onClick={onHome}
          className="w-full py-4 text-xl font-bold rounded-2xl text-white active:scale-95 transition-all"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  )
}
