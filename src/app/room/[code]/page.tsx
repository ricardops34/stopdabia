'use client'

import { useEffect, useState, useRef, use } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { connectSocket } from '@/lib/socket/client'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'
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
  const [myId, setMyId] = useState('')
  const [hintUsed, setHintUsed] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintsMap, setHintsMap] = useState<Record<string, { word: string; explanation: string }>>({})
  const hintsMapRef = useRef<Record<string, { word: string; explanation: string }>>({})

  const answersRef = useRef<Record<string, string>>({})
  const sentAnswers = useRef(false)
  const demoraTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [easterEgg, setEasterEgg] = useState<string | null>(null)

  useEffect(() => {
    const socket = connectSocket()
    const roomReceived = { current: false }
    setMyId(socket.id ?? '')

    socket.on('room:state', (r) => {
      roomReceived.current = true
      setRoom(r)
      setPlayers(r.players)
      setPhase(r.phase)
      const me = r.players.find((p) => p.id === socket.id)
      setIsHost(me?.isHost ?? false)
      setIsSpectating(me?.spectating ?? false)
      setMyId(socket.id ?? '')
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
        // Easter egg: 20% de chance — determinístico pela letra para todos verem igual
        setEasterEgg((prev) => {
          const letterCode = letter.charCodeAt(0)
          if (letterCode % 5 === 0) {
            const n = (letterCode % 13) + 1
            const padded = String(n).padStart(2, '0')
            setTimeout(() => setEasterEgg(null), 3000)
            return `/easter/easter_egg_${padded}.png`
          }
          return prev
        })
      } else if (p === 'stopping') {
        playSfx('stop')
        stopTrack()
        setResults([])
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
      if (Math.random() < 0.2) {
        const n = Math.floor(Math.random() * 10) + 1
        setEasterEgg(`/easter/${n}.png`)
        setTimeout(() => setEasterEgg(null), 3000)
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

    let syncAttempts = 0
    let syncTimer: ReturnType<typeof setTimeout> | null = null

    function tryReconnect() {
      if (roomReceived.current) return
      try {
        const raw = sessionStorage.getItem('stop_session')
        if (!raw) { setError('Sessão expirada. Volte ao início.'); return }
        const { code: sCode, nickname } = JSON.parse(raw) as { code: string; nickname: string }
        socket.emit('room:reconnect', sCode, nickname, (ok) => {
          if (!ok) setError('Sala não encontrada. Ela pode ter encerrado.')
        })
      } catch {
        setError('Não foi possível conectar à sala.')
      }
    }

    function trySync() {
      if (roomReceived.current) return
      syncAttempts++
      if (syncAttempts <= 3) {
        socket.emit('room:sync')
        syncTimer = setTimeout(trySync, 1000)
      } else {
        // sync falhou 3x → tenta reconnect via nickname
        tryReconnect()
      }
    }

    if (socket.connected) {
      trySync()
    } else {
      socket.once('connect', trySync)
    }

    return () => {
      if (syncTimer) clearTimeout(syncTimer)
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

  // hintsMapRef é atualizado diretamente nos setters — não precisa de effect separado

  useEffect(() => {
    if (phase === 'playing') {
      sentAnswers.current = false
      answersRef.current = {}
      setAnswers({})
      setHintUsed(false)
      setHintLoading(false)
      setHintsMap({})
      hintsMapRef.current = {}
    } else if (phase === 'stopping' && !sentAnswers.current) {
      sentAnswers.current = true
      const socket = connectSocket()
      socket.emit('game:answers', answersRef.current, hintsMapRef.current)
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
    if (!isHost) return
    connectSocket().emit('room:ready', code)
  }

  function handleRematchReady() {
    setRematchReady(true)
    connectSocket().emit('rematch:ready')
  }

  if (!room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#1A1A2E' }}>
        {error ? (
          <>
            <p className="font-bold text-center" style={{ color: '#FF6B6B' }}>{error}</p>
            <button onClick={() => router.push('/')} className="text-sm opacity-60 mt-2">← Voltar ao início</button>
          </>
        ) : (
          <>
            <p className="opacity-60 animate-pulse text-center">Conectando à sala {code}…</p>
            <button onClick={() => router.push('/')} className="text-xs opacity-30 mt-4">Cancelar</button>
          </>
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ overflow: 'hidden' }}>
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

      {/* Easter egg — aparece ~20% das rodadas por 3s */}
      {easterEgg && (phase === 'countdown' || phase === 'review') && (
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
          hintUsed={hintUsed}
          hintLoading={hintLoading}
          onHint={async (catId: string, catLabel: string) => {
            if (hintUsed || hintLoading) return
            setHintLoading(true)
            try {
              const res = await fetch('/api/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ letter, categoryLabel: catLabel }),
              })
              const { word, explanation } = await res.json() as { word: string; explanation: string }
              if (word) {
                updateAnswer(catId, word)
                setHintUsed(true)
                setHintsMap(prev => {
                  const next = { ...prev, [catId]: { word, explanation: explanation ?? '' } }
                  hintsMapRef.current = next
                  return next
                })
              }
            } catch { /* silently fail */ }
            setHintLoading(false)
          }}
        />
      )}

      {phase === 'playing' && isSpectating && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <div className="rounded-full flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: '#FFD93D' }}>
            <Image src={`/icons/letra_${letter.toLowerCase()}.png`} alt={letter} width={70} height={70} />
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
          myId={myId}
          stoppedBy={stoppedBy}
          phase={phase}
          isHost={isHost}
          onNext={handleNextRound}
          maxRounds={room?.settings.maxRounds ?? 5}
          currentRound={room?.rounds.length ?? 0}
          hintsMap={hintsMap}
        />
      )}

      {phase === 'finished' && (
        <FinishedView
          players={players}
          myId={myId}
          isHost={isHost}
          onHome={() => router.push('/')}
          onRematch={() => connectSocket().emit('room:rematch')}
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
    setSelectedCats((prev) => {
      const next = prev.includes(id)
        ? prev.filter((c) => c !== id)
        : prev.length < 8 ? [...prev, id] : prev
      // Sincroniza com o servidor imediatamente
      connectSocket().emit('room:settings', next)
      return next
    })
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
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>

      {/* Cabeçalho fixo */}
      <div className="shrink-0 flex items-center justify-center pt-4 pb-2 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="STOP - ADEDONHA" width={120} style={{ height: 'auto', display: 'block' }} />
      </div>

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">

          {/* ── Compartilhar ── */}
          <div
            className="w-full rounded-2xl p-4 flex flex-col items-center gap-3"
            style={{ backgroundColor: '#0F3460', border: '2px solid #FFD93D' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Convide seus amigos</p>

            <button
              onClick={copyCode}
              className="flex items-center gap-2 active:scale-95 transition-transform"
              title="Clique para copiar"
            >
              <span className="text-4xl font-black tracking-[0.2em]" style={{ color: '#FFD93D' }}>{code}</span>
              <span className="text-lg opacity-60">{copied === 'code' ? '✅' : '📋'}</span>
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
          <div className="w-full rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0F3460' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">Na sala</p>
              <span className="text-xs opacity-40">{players.length}/10</span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {players.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: p.avatar ? 'transparent' : (p.isHost ? '#FFD93D' : p.spectating ? '#ffffff22' : '#4ECDC4'),
                      color: '#1A1A2E',
                      border: p.avatar ? `2px solid ${p.isHost ? '#FFD93D' : p.spectating ? '#ffffff33' : '#4ECDC4'}` : 'none',
                    }}
                  >
                    {p.avatar
                      ? <img src={p.avatar} alt={p.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : p.nickname[0].toUpperCase()
                    }
                  </div>
                  <span className="font-medium flex-1 text-sm" style={{ opacity: p.spectating ? 0.6 : 1 }}>{p.nickname}</span>
                  {p.isHost && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFD93D22', color: '#FFD93D' }}>Criador</span>}
                  {p.spectating && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ffffff11', color: '#ffffff60' }}>assistindo</span>}
                </li>
              ))}
            </ul>

            {players.length === 1 && (
              <p className="text-xs opacity-40 text-center animate-pulse pt-1">Aguardando amigos entrarem…</p>
            )}
          </div>

          {/* ── Categorias (editável para host, leitura para outros) ── */}
          <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F3460' }}>
            <button
              onClick={() => isHost && setShowCats((v) => !v)}
              className={`w-full px-4 py-3 flex items-center justify-between ${isHost ? 'active:opacity-70' : ''}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">
                Categorias ({selectedCats.length})
              </p>
              {isHost && <span className="opacity-40 text-sm">{showCats ? '▲' : '▼'}</span>}
            </button>

            {/* Chips de categorias selecionadas — sempre visíveis para todos */}
            {(!isHost || !showCats) && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {ALL_CATEGORIES.filter(c => selectedCats.includes(c.id)).map((cat) => {
                  const color = cat.group === 'classica' ? '#FF6B6B' : cat.group === 'escolar' ? '#4ECDC4' : '#9B59B6'
                  return (
                    <span
                      key={cat.id}
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
                    >
                      {cat.label}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Seletor editável (somente host) */}
            {isHost && showCats && (
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

          {/* ── Ranking da sala ── */}
          {players.some(p => p.totalScore > 0) && (
            <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F3460' }}>
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Pontuações</p>
                <Image src="/icons/btn_resumo.png" alt="" width={20} height={20} style={{ opacity: 0.5 }} />
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                {[...players].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-sm font-black w-4 text-center" style={{ color: i === 0 ? '#FFD93D' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium truncate">{p.nickname}</span>
                    <span className="text-sm font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isHost && (
            <p className="text-xs opacity-40 text-center animate-pulse">Aguardando o criador iniciar a partida…</p>
          )}

          {error && <p className="text-sm font-medium text-center" style={{ color: '#FF6B6B' }}>{error}</p>}
        </div>
      </div>

      {/* ── Barra Flutuante ── */}
      <BottomBar
        center={
          <>
            <BtnSecondary onClick={() => window.location.href = '/'} iconSrc="/icons/btn_sair.png" label="SAIR" size={64} />
            {isHost && (
              <BtnPrimary
                onClick={onStart}
                disabled={players.length < 2}
                iconSrc="/icons/btn_jogar.png"
                label="INICIAR"
                pulse
                size={64}
              />
            )}
          </>
        }
      />
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
      <Image
          key={letter}
          src={`/letras_sorteio/${letter}.png`}
          alt={letter}
          width={280}
          height={280}
          className="animate-letter-enter"
          priority
          style={{ objectFit: 'contain' }}
        />
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
  letter, timer, categories, answers, onChange, onStop, showDemora, hintUsed, hintLoading, onHint,
}: {
  letter: string
  timer: number
  categories: Category[]
  answers: Record<string, string>
  onChange: (id: string, value: string) => void
  onStop: () => void
  showDemora: boolean
  hintUsed: boolean
  hintLoading: boolean
  onHint: (catId: string, catLabel: string) => void
}) {
  const [catIdx, setCatIdx] = useState(0)
  const urgent = timer <= 10
  const cat = categories[catIdx]
  const total = categories.length
  const isFirst = catIdx === 0
  const isLast = catIdx === total - 1

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
      {/* Header: letra + timer */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 52, height: 52, backgroundColor: '#FFD93D' }}>
          <Image src={`/icons/letra_${letter.toLowerCase()}.png`} alt={letter} width={40} height={40} priority />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-bold tabular-nums" style={{ color: urgent ? '#FF6B6B' : '#FFD93D' }}>{timer}s</span>
          <div className="w-28 h-2 rounded-full" style={{ backgroundColor: '#0F3460' }}>
            <div className="h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(0, Math.min(100, (timer / 90) * 100))}%`, backgroundColor: urgent ? '#FF6B6B' : '#4ECDC4' }} />
          </div>
        </div>
      </div>

      {/* Conteúdo central */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Pontos de progresso — clicáveis */}
        <div className="flex gap-2 items-center">
          {categories.map((c, i) => {
            const filled = !!answers[c.id]?.trim()
            return (
              <button key={c.id} onClick={() => setCatIdx(i)}>
                <div style={{
                  width: i === catIdx ? 10 : 8,
                  height: i === catIdx ? 10 : 8,
                  borderRadius: '50%',
                  backgroundColor: i === catIdx ? '#FFD93D' : filled ? '#4ECDC4' : '#0F3460',
                  transition: 'all 0.2s',
                }} />
              </button>
            )
          })}
        </div>

        {/* Nome da categoria */}
        <div className="text-center">
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">{catIdx + 1} / {total}</p>
          <h2 className="text-4xl font-black" style={{ color: '#FFD93D' }}>{cat?.label}</h2>
        </div>

        {/* Input grande */}
        {cat && (
          <input
            key={cat.id}
            type="text"
            value={answers[cat.id] ?? ''}
            onChange={(e) => onChange(cat.id, e.target.value)}
            maxLength={80}
            placeholder={`Com ${letter}…`}
            autoFocus
            className="w-full text-center text-2xl font-bold text-white placeholder-white/25 outline-none rounded-2xl px-4 py-5 transition-all"
            style={{ backgroundColor: '#0F3460', border: `2px solid ${answers[cat.id]?.trim() ? '#4ECDC4' : '#16213E'}` }}
            onFocus={(e) => (e.target.style.borderColor = '#4ECDC4')}
            onBlur={(e) => (e.target.style.borderColor = answers[cat.id]?.trim() ? '#4ECDC4' : '#16213E')}
          />
        )}

        {showDemora && (
          <Image src="/aviso/demora.png" alt="Está demorando!" width={200} height={100} className="animate-fade-in" />
        )}
      </div>

      <BottomBar
        left={<BtnSecondary onClick={() => setCatIdx((i) => i - 1)} iconSrc="/icons/btn_anterior.png" label="ANTERIOR" disabled={isFirst} />}
        center={
          <>
            <BtnSecondary
              onClick={() => cat && onHint(cat.id, cat.label)}
              iconSrc={hintUsed || hintLoading ? '/icons/btn_dica_usada.png' : '/icons/btn_dica.png'}
              label={hintUsed ? 'USADA' : 'DICA'}
              color={hintUsed ? 'rgba(255,255,255,0.05)' : 'rgba(255,217,61,0.15)'}
              disabled={hintUsed || hintLoading}
            />
            <BtnPrimary onClick={onStop} label="STOP!" pulse />
          </>
        }
        right={<BtnSecondary onClick={() => setCatIdx((i) => i + 1)} iconSrc="/icons/btn_proxima.png" label="PRÓXIMA" disabled={isLast} />}
      />
    </div>
  )
}

// ─── Review ──────────────────────────────────────────────────────────────────

interface ReviewCategoryCardProps {
  cat: CategoryResult
  idx: number
  total: number
  letter: string
  myId: string
  getAviso: (a: PlayerAnswer, letter: string, idx: number) => string
  onPrev: (() => void) | null
  onNext: () => void
  hintInfo?: { word: string; explanation: string }
}

function ReviewCategoryCard({ cat, idx, total, letter, myId, getAviso, onPrev, onNext, hintInfo }: ReviewCategoryCardProps) {
  const sortedAnswers = [...cat.answers].sort((a, b) => {
    if (a.playerId === myId) return -1
    if (b.playerId === myId) return 1
    return 0
  })

  const isLast = idx === total - 1

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
      {/* Topo */}
      <div className="shrink-0 px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 40, height: 40, backgroundColor: '#FFD93D' }}>
            <Image src={`/icons/letra_${letter.toLowerCase()}.png`} alt={letter} width={30} height={30} />
          </div>
          <h2 className="text-xl font-bold flex-1" style={{ color: '#FFD93D' }}>{cat.categoryLabel}</h2>
          <span className="text-sm opacity-40 tabular-nums">{idx + 1}/{total}</span>
        </div>

        {/* Barra de progresso estática */}
        <div className="w-full h-1.5 rounded-full flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: i <= idx ? (isLast ? '#FF6B6B' : '#4ECDC4') : '#0F3460' }}
            />
          ))}
        </div>
      </div>

      {/* Respostas com scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {sortedAnswers.map((a, ai) => {
          const isMe = a.playerId === myId
          return (
            <div
              key={a.playerId}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ backgroundColor: '#0F3460', border: isMe ? '2px solid #FFD93D' : '2px solid transparent' }}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold mb-0.5" style={{ color: isMe ? '#FFD93D' : 'rgba(255,255,255,0.5)' }}>
                  {isMe ? 'Você' : a.nickname}
                </span>
                <span className="text-xl font-bold truncate" style={{ color: a.valid ? '#95E06C' : a.answer ? '#FF6B6B' : '#ffffff30' }}>
                  {a.answer || '—'}
                </span>
                {a.usedHint && (
                  <div className="flex items-center gap-1 mt-1">
                    <Image src="/icons/btn_dica.png" alt="" width={16} height={16} style={{ objectFit: 'contain', opacity: 0.8 }} />
                    {a.hintExplanation && <span className="text-xs" style={{ color: 'rgba(255,217,61,0.7)' }}>{a.hintExplanation}</span>}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <Image src={getAviso(a, letter, idx + ai)} alt="" width={100} height={100} style={{ objectFit: 'contain' }} />
                <span className="font-bold text-base" style={{ color: a.points > 0 ? '#FFD93D' : '#ffffff40' }}>
                  {a.points > 0 ? `+${a.points}` : '0'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <BottomBar
        left={onPrev ? <BtnSecondary onClick={onPrev} iconSrc="/icons/btn_anterior.png" label="ANTERIOR" /> : undefined}
        right={
          <BtnPrimary
            onClick={onNext}
            iconSrc={isLast ? '/icons/btn_resumo.png' : '/icons/btn_proxima.png'}
            label={isLast ? 'RESUMO' : 'PRÓXIMA'}
            color={isLast ? '#FF6B6B' : '#4ECDC4'}
            pulse={isLast}
          />
        }
      />
    </div>
  )
}

function getAviso(answer: PlayerAnswer, letter: string, idx = 0): string {
  if (answer.outcome) return avisoFromOutcome(answer.outcome)
  return avisoFromAnswer(answer.answer ?? '', letter, idx)
}

function ReviewView({
  letter, results, players, myId, stoppedBy, phase, isHost, onNext, maxRounds, currentRound, hintsMap,
}: {
  letter: string
  results: CategoryResult[]
  players: Player[]
  myId: string
  stoppedBy: string | null
  phase: Room['phase']
  isHost: boolean
  onNext: () => void
  maxRounds: number
  currentRound: number
  hintsMap: Record<string, { word: string; explanation: string }>
}) {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState<'words' | 'summary'>('words')
  const [mounted, setMounted] = useState(false)
  const isLastRound = currentRound >= maxRounds

  useEffect(() => { setIdx(0); setStep('words') }, [results])
  useEffect(() => { setMounted(true) }, [])

  if (phase === 'stopping' || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <Image src="/cachorra/1.png" alt="STOP!" width={240} height={240} className="animate-letter-enter" priority />
        <p className="text-xl font-bold" style={{ color: '#FF6B6B' }}>
          {stoppedBy ? `${stoppedBy} deu STOP!` : 'STOP! Tempo esgotado!'}
        </p>
        <p className="text-sm opacity-50 animate-pulse">Corrigindo respostas…</p>
      </div>
    )
  }

  if (step === 'words') {
    const cat = results[idx]
    if (!cat) { setStep('summary'); return null }
    const isLast = idx === results.length - 1
    const advance = () => isLast ? setStep('summary') : setIdx((i) => i + 1)
    const goBack = idx > 0 ? () => setIdx((i) => i - 1) : null

    return (
      <ReviewCategoryCard
        key={cat.categoryId}
        cat={cat}
        idx={idx}
        total={results.length}
        letter={letter}
        myId={myId}
        getAviso={getAviso}
        onPrev={goBack}
        onNext={advance}
        hintInfo={hintsMap[cat.categoryId]}
      />
    )
  }

  // ── Resumo: jogador atual primeiro ──
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === myId) return -1
    if (b.id === myId) return 1
    return 0
  })

  if (!mounted) return null
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#1A1A2E' }}>
      {/* Cabeçalho */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', backgroundColor: '#1A1A2E' }}>
        <Image src={`/icons/letra_${letter.toLowerCase()}.png`} alt={letter} width={40} height={40} style={{ objectFit: 'contain' }} />
        <h2 className="text-lg font-bold flex-1">Resumo da Rodada</h2>
      </div>

      {/* Conteúdo com scroll — altura explícita sem flex */}
      <div style={{ position: 'absolute', top: 72, left: 0, right: 0, bottom: 76, overflowY: 'scroll', padding: '8px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Cards por jogador — "você" sempre primeiro */}
        {sortedPlayers.map((player) => {
          const isMe = player.id === myId
          const roundPts = results.reduce((s, cat) => {
            const a = cat.answers.find((a) => a.playerId === player.id)
            return s + (a?.points ?? 0)
          }, 0)

          return (
            <div
              key={player.id}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#0F3460',
                border: isMe ? '2px solid #FFD93D' : '2px solid transparent',
              }}
            >
              {/* Header do jogador */}
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: '#16213E' }}>
                <div
                  className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: player.avatar ? 'transparent' : (isMe ? '#FFD93D' : '#4ECDC4'),
                    color: '#1A1A2E',
                    border: player.avatar ? `2px solid ${isMe ? '#FFD93D' : '#4ECDC4'}` : 'none',
                  }}
                >
                  {player.avatar
                    ? <img src={player.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : player.nickname[0].toUpperCase()
                  }
                </div>
                <span className="font-bold flex-1 text-sm">
                  {isMe ? 'Você' : player.nickname}
                  {isMe && <span className="ml-2 text-xs opacity-50">({player.nickname})</span>}
                </span>
                <span className="font-bold text-sm" style={{ color: roundPts > 0 ? '#FFD93D' : '#ffffff40' }}>
                  {roundPts > 0 ? `+${roundPts}` : '0'} pts
                </span>
              </div>

              {/* Respostas com scroll interno */}
              <div style={{ maxHeight: 200, overflowY: 'auto', overflowX: 'hidden' }} className="divide-y" >
                {results.map((cat, ci) => {
                  const a = cat.answers.find((ans) => ans.playerId === player.id)
                  const empty = { answer: '', valid: false, points: 0, duplicate: false, playerId: '', nickname: '' }
                  return (
                    <div key={cat.categoryId} className="flex flex-col">
                      <div className="px-3 py-2 flex items-center gap-2">
                        <Image
                          src={getAviso(a ?? empty, letter, ci)}
                          alt=""
                          width={48}
                          height={48}
                          style={{ objectFit: 'contain', flexShrink: 0 }}
                        />
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-xs opacity-50">{cat.categoryLabel}</span>
                          <span
                            className="text-sm font-bold truncate"
                            style={{ color: a?.valid ? '#95E06C' : a?.answer ? '#FF6B6B' : '#ffffff25' }}
                          >
                            {a?.answer || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {a?.usedHint && (
                            <Image src="/icons/btn_dica.png" alt="Dica" width={20} height={20} style={{ objectFit: 'contain', opacity: 0.8 }} />
                          )}
                          <span className="text-sm font-bold" style={{ color: (a?.points ?? 0) > 0 ? '#FFD93D' : '#ffffff40' }}>
                            {(a?.points ?? 0) > 0 ? `+${a!.points}` : '0'}
                          </span>
                        </div>
                      </div>
                      {a?.usedHint && a.hintExplanation && (
                        <div className="mx-3 mb-2 px-3 py-2 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.2)' }}>
                          <p className="text-xs" style={{ color: 'rgba(255,217,61,0.8)' }}>{a.hintExplanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Placar geral */}
        <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#0F3460' }}>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Placar Geral</p>
          {[...players].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-40 w-5">{i + 1}.</span>
                <span className="font-medium text-sm" style={{ color: p.id === myId ? '#FFD93D' : 'white' }}>
                  {p.id === myId ? 'Você' : p.nickname}
                </span>
              </div>
              <span className="font-bold text-sm" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante */}
      {isHost ? (
        <BottomBar
          center={
            <BtnPrimary
              onClick={onNext}
              label={isLastRound ? 'RESULTADO' : 'PRÓXIMA'}
              iconSrc={isLastRound ? '/icons/btn_resumo.png' : '/icons/btn_proxima.png'}
              color={isLastRound ? '#FF6B6B' : '#4ECDC4'}
              pulse
            />
          }
        />
      ) : (
        <BottomBar
          center={
            <span className="text-sm font-bold opacity-50 px-4">Aguardando criador…</span>
          }
        />
      )}
    </div>,
    document.body
  )
}

// ─── Finished ────────────────────────────────────────────────────────────────

function getPositionAviso(index: number, total: number): string | null {
  if (index === 0) return '/aviso/vencedor.png'
  if (index === 1 && total > 2) return '/aviso/quase.png'
  if (index === total - 1 && total > 1) return '/aviso/perdeu.png'
  return null
}

function FinishedView({ players, isHost, onHome, onRematch }: { players: Player[]; isHost: boolean; onHome: () => void; onRematch: () => void }) {
  const winner = players[0]

  // Detecta empates no topo
  const tiedAtTop = players.filter(p => p.totalScore === winner?.totalScore)
  const hasTie = tiedAtTop.length > 1

  // Critério de desempate: quem tiver mais respostas únicas (15 pts) ao longo das rodadas
  // Aproximação: mais rodadas acima de 0 pts
  const tiebreakNote = hasTie
    ? `Empate! Critério de desempate: número de acertos únicos (respostas exclusivas valem 15 pts).`
    : null

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6 gap-4 max-w-md mx-auto w-full" style={{ paddingBottom: 96 }}>
      <Image src="/aviso/vencedor.png" alt="Vencedor!" width={180} height={180} className="animate-letter-enter" />
      <h2 className="text-3xl font-bold text-center" style={{ color: '#FFD93D' }}>
        {hasTie
          ? `${tiedAtTop.map(p => p.nickname).join(' e ')} empataram!`
          : `${winner?.nickname} venceu!`}
      </h2>

      {tiebreakNote && (
        <p className="text-xs text-center px-4 py-2 rounded-xl" style={{ color: 'rgba(255,217,61,0.7)', backgroundColor: 'rgba(255,217,61,0.08)', border: '1px solid rgba(255,217,61,0.2)' }}>
          {tiebreakNote}
        </p>
      )}

      {/* Ranking */}
      <div className="w-full flex flex-col gap-2">
        {players.map((p, i) => {
          const aviso = getPositionAviso(i, players.length)
          const medalColor = i === 0 ? '#FFD93D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'white'
          const isTied = p.totalScore === winner?.totalScore && i > 0
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-up"
              style={{ backgroundColor: i === 0 ? '#1a1a0a' : '#0F3460', animationDelay: `${i * 80}ms`, border: i === 0 ? '2px solid #FFD93D44' : 'none' }}
            >
              <span className="text-xl font-black w-6 text-center" style={{ color: medalColor }}>
                {isTied ? '=' : i + 1}
              </span>
              <Image src={p.avatar || '/avatar/avatar_01.png'} alt={p.nickname} width={40} height={40} className="rounded-full" />
              <span className="font-semibold flex-1">{p.nickname}</span>
              {aviso && <Image src={aviso} alt="" width={36} height={36} />}
              <span className="font-bold" style={{ color: '#FFD93D' }}>{p.totalScore}</span>
            </div>
          )
        })}
      </div>

      <BottomBar
        left={<BtnSecondary onClick={onHome} iconSrc="/icons/btn_inicio.png" label="INÍCIO" size={60} />}
        center={isHost
          ? <BtnPrimary onClick={onRematch} iconSrc="/icons/btn_reiniciar.png" label="JOGAR DE NOVO" color="#4ECDC4" pulse />
          : <span className="text-sm font-bold opacity-50 px-4">Aguardando criador…</span>
        }
      />
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
        <BottomBar
          center={
            <BtnPrimary onClick={onReady} label="VAMOS LÁ!" iconSrc="/icons/btn_jogar.png" pulse />
          }
        />
      ) : (
        <BottomBar
          center={
            <span className="text-sm font-bold opacity-50 px-4">Aguardando outros…</span>
          }
        />
      )}
    </div>
  )
}
