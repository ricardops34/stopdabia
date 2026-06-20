'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ALL_CATEGORIES, drawLetter, DEFAULT_CATEGORIES } from '@/lib/game/config'
import type { Category } from '@/lib/game/types'
import { computeCategoryScores } from '@/lib/game/scoring'
import { playTrack, stopTrack } from '@/lib/audio/manager'
import { avisoFromOutcome, avisoFromAnswer } from '@/lib/game/aviso'
import type { AnswerOutcome } from '@/lib/game/types'
import BottomBar, { BtnPrimary, BtnSecondary } from '@/components/BottomBar'

type SoloPhase = 'config' | 'letter' | 'countdown' | 'playing' | 'interlude' | 'review' | 'result'
type ReviewStep = 'words' | 'summary'

interface AnswerResult {
  categoryId: string
  categoryLabel: string
  answer: string
  valid: boolean
  points: number
  duplicate: boolean
  outcome?: AnswerOutcome
}

const TIME_OPTIONS = [30, 60, 90] as const
const WORD_DISPLAY_SECS = 5

interface ReviewWordCardProps {
  r: AnswerResult
  idx: number
  total: number
  letter: string
  isLast: boolean
  getAviso: (r: AnswerResult, idx: number) => string
  onNext: () => void
}

function ReviewWordCard({ r, idx, total, letter, isLast, getAviso, onNext }: ReviewWordCardProps) {
  const [elapsed, setElapsed] = useState(0)
  const onNextRef = useRef(onNext)
  const mountedRef = useRef(true)
  onNextRef.current = onNext

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    setElapsed(0)
    const interval = setInterval(() => {
      if (!mountedRef.current) { clearInterval(interval); return }
      setElapsed((e) => {
        const next = e + 1
        if (next >= WORD_DISPLAY_SECS) {
          clearInterval(interval)
          if (mountedRef.current) onNextRef.current()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [r.categoryId])

  const progress = Math.min((elapsed / WORD_DISPLAY_SECS) * 100, 100)

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={34} height={34} />
          </div>
          <span className="text-sm opacity-50">{idx + 1} / {total}</span>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: '#4ECDC4' }}>
          {WORD_DISPLAY_SECS - elapsed}s
        </span>
      </div>

      {/* Barra de progresso temporal */}
      <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: '#0F3460' }}>
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, backgroundColor: isLast ? '#FF6B6B' : '#4ECDC4' }}
        />
      </div>

      {/* Card da categoria */}
      <div key={r.categoryId} className="flex-1 flex flex-col items-center justify-center gap-6 animate-slide-up">
        <h2 className="text-3xl font-bold text-center" style={{ color: '#FFD93D' }}>
          {r.categoryLabel}
        </h2>

        <div
          className="w-full rounded-2xl p-6 flex flex-col items-center gap-4"
          style={{ backgroundColor: '#0F3460' }}
        >
          <span
            className="text-3xl font-bold text-center"
            style={{ color: r.valid ? '#95E06C' : r.answer ? '#FF6B6B' : '#ffffff30' }}
          >
            {r.answer || '—'}
          </span>
          <Image src={getAviso(r, idx)} alt="" width={120} height={120} />
          <span className="text-2xl font-bold" style={{ color: r.points > 0 ? '#FFD93D' : '#ffffff40' }}>
            {r.points > 0 ? `+${r.points} pontos` : 'Zero pontos'}
          </span>
        </div>
      </div>

      {/* Toque para pular */}
      <button
        onClick={onNext}
        className="mt-6 py-3 w-full text-sm opacity-40 active:opacity-70 transition-opacity"
      >
        Toque para pular →
      </button>
    </div>
  )
}

export default function SoloPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<SoloPhase>('config')
  const [selectedTime, setSelectedTime] = useState<30 | 60 | 90>(60)
  const [selectedCats, setSelectedCats] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [letter, setLetter] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timer, setTimer] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showDemora, setShowDemora] = useState(false)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [validating, setValidating] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewStep, setReviewStep] = useState<ReviewStep>('words')
  const [cachorra, setCachorra] = useState(1)
  useEffect(() => { setCachorra(Math.floor(Math.random() * 4) + 1) }, [])

  const answersRef = useRef<Record<string, string>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const demoraRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const letterRef = useRef('')

  function clearAllTimers() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (demoraRef.current) clearTimeout(demoraRef.current)
  }

  // ─── Início do jogo ──────────────────────────────────────────────────────

  function startGame() {
    const l = drawLetter()
    letterRef.current = l
    setLetter(l)
    answersRef.current = {}
    setAnswers({})
    setResults([])
    setShowDemora(false)
    setPhase('letter')

    // 5s revelação da letra → countdown
    timerRef.current = setTimeout(() => startCountdown(l), 5000)
  }

  function startCountdown(l: string) {
    setPhase('countdown')
    let count = 3

    const tick = () => {
      setCountdown(count)
      if (count === 0) {
        timerRef.current = setTimeout(() => startPlaying(l), 2000)
        return
      }
      count--
      timerRef.current = setTimeout(tick, 3000)
    }
    tick()
  }

  function startPlaying(l: string) {
    setCountdown(null)
    setTimer(selectedTime)
    setPhase('playing')
    playTrack('game', 0.35)

    // timer decrescente
    let remaining = selectedTime
    const tick = () => {
      remaining--
      setTimer(remaining)
      if (remaining <= 0) {
        endRound()
        return
      }
      timerRef.current = setTimeout(tick, 1000)
    }
    timerRef.current = setTimeout(tick, 1000)

    // demora.png após 10s sem resposta
    demoraRef.current = setTimeout(() => {
      const hasAny = Object.values(answersRef.current).some((a) => a.trim())
      if (!hasAny) setShowDemora(true)
    }, 10000)
  }

  const endRound = useCallback(() => {
    clearAllTimers()
    setShowDemora(false)
    setPhase('interlude') // mostra cachorra.png por 2s antes da correção
    setValidating(true)

    const currentAnswers = { ...answersRef.current }
    const l = letterRef.current
    const cats = selectedCats

    async function validate() {
      const allResults: AnswerResult[] = []

      for (const cat of cats) {
        const answer = (currentAnswers[cat.id] ?? '').trim()

        try {
          const res = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              letter: l,
              category: cat.label,
              answers: [{ playerId: 'solo', nickname: 'Você', answer }],
            }),
          })
          const data = await res.json() as { results: { playerId: string; valid: boolean; outcome: AnswerOutcome }[] }
          const r0 = data.results[0]
          const outcome: AnswerOutcome = r0?.outcome ?? 'palavra_nao_existe'
          const valid = r0?.valid ?? false
          const scored = computeCategoryScores([{ playerId: 'solo', nickname: 'Você', answer, valid, outcome }])
          allResults.push({
            categoryId: cat.id,
            categoryLabel: cat.label,
            answer,
            valid: scored[0].valid ?? false,
            points: scored[0].points,
            duplicate: false,
            outcome,
          })
        } catch {
          const startsOk = answer.length > 1 && answer.toLowerCase().startsWith(l.toLowerCase())
          const outcome: AnswerOutcome = !answer ? 'vazio' : !startsOk ? 'letra_errada' : 'matando_aula'
          const valid = startsOk
          const scored = computeCategoryScores([{ playerId: 'solo', nickname: 'Você', answer, valid, outcome }])
          allResults.push({
            categoryId: cat.id,
            categoryLabel: cat.label,
            answer,
            valid: scored[0].valid ?? false,
            points: scored[0].points,
            duplicate: false,
            outcome,
          })
        }
      }

      setResults(allResults)
      setValidating(false)
      setReviewIdx(0)
      setReviewStep('words')
      setPhase('review')
      playTrack('review', 0.3)

      // Persiste no Redis via API
      const total = allResults.reduce((s, r) => s + r.points, 0)
      const correct = allResults.filter((r) => r.valid).length
      fetch('/api/ranking/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'solo',
          nickname: 'Jogador', // será substituído quando tivermos perfis
          score: total,
          letter: l,
          categories: cats.length,
          answeredCorrect: correct,
        }),
      }).catch(() => { /* Redis offline — silencioso */ })
    }

    validate()
  }, [selectedCats])

  function handleStop() {
    endRound()
  }

  function updateAnswer(catId: string, value: string) {
    answersRef.current[catId] = value
    setAnswers({ ...answersRef.current })
    if (value.trim()) setShowDemora(false)
  }

  function toggleCat(cat: Category) {
    setSelectedCats((prev) =>
      prev.find((c) => c.id === cat.id)
        ? prev.filter((c) => c.id !== cat.id)
        : prev.length < 8 ? [...prev, cat] : prev,
    )
  }

  function totalPoints() {
    return results.reduce((s, r) => s + r.points, 0)
  }

  function getAviso(r: AnswerResult, idx = 0): string {
    if (r.outcome) return avisoFromOutcome(r.outcome)
    return avisoFromAnswer(r.answer ?? '', letter, idx)
  }

  useEffect(() => () => clearAllTimers(), [])

  // ─── Renders ──────────────────────────────────────────────────────────────

  if (phase === 'config') {
    return (
      <main className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-center px-4 pt-4 pb-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="STOP ADEDONHA" width={160} style={{ height: 'auto', display: 'block' }} />
        </div>

        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
          {/* Tempo */}
          <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F3460' }}>
            <p className="text-sm font-semibold opacity-60">Tempo por rodada</p>
            <div className="flex gap-3">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className="flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
                  style={{
                    backgroundColor: selectedTime === t ? '#FF6B6B' : '#16213E',
                    color: 'white',
                    border: selectedTime === t ? '2px solid #FFD93D' : '2px solid transparent',
                  }}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div className="w-full rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F3460' }}>
            <p className="text-sm font-semibold opacity-60">Categorias (máx. 8, mín. 1)</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const sel = !!selectedCats.find((c) => c.id === cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCat(cat)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: sel ? '#FF6B6B' : '#16213E',
                      color: sel ? 'white' : '#ffffff60',
                      border: sel ? '2px solid #FF6B6B' : '2px solid transparent',
                    }}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <BottomBar
          center={
            <>
              <BtnSecondary onClick={() => router.push('/')} label="VOLTAR" />
              <BtnPrimary
                onClick={startGame}
                disabled={selectedCats.length === 0}
                label="JOGAR!"
                icon="▶"
                pulse
              />
            </>
          }
        />
      </main>
    )
  }

  if (phase === 'letter') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-6" style={{ backgroundColor: '#1A1A2E' }}>
        <p className="text-lg font-bold opacity-60 uppercase tracking-widest">A letra é</p>
        <div
          className="rounded-full flex items-center justify-center animate-letter-enter"
          style={{ width: 280, height: 280, backgroundColor: '#FFD93D', boxShadow: '0 0 60px rgba(255,217,61,0.5)' }}
        >
          <Image src={`/letras/${letter}.png`} alt={letter} width={220} height={220} priority />
        </div>
      </div>
    )
  }

  if (phase === 'countdown' && countdown !== null) {
    const imgMap: Record<number, string> = { 3: '/contagem/03.png', 2: '/contagem/02.png', 1: '/contagem/01.png', 0: '/contagem/vai.png' }
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen" style={{ backgroundColor: '#1A1A2E' }}>
        <Image key={countdown} src={imgMap[countdown] ?? '/contagem/vai.png'} alt={String(countdown)} width={300} height={300} className="animate-letter-enter" priority />
      </div>
    )
  }

  if (phase === 'playing') {
    const urgent = timer <= 10
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: '#1A1A2E' }}>
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 56, height: 56, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={44} height={44} priority />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl font-bold tabular-nums" style={{ color: urgent ? '#FF6B6B' : '#FFD93D' }}>{timer}s</span>
            <div className="w-32 h-2 rounded-full" style={{ backgroundColor: '#0F3460' }}>
              <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, (timer / selectedTime) * 100)}%`, backgroundColor: urgent ? '#FF6B6B' : '#4ECDC4' }} />
            </div>
          </div>
        </div>

        {showDemora && (
          <div className="flex items-center justify-center py-2 animate-fade-in">
            <Image src="/aviso/demora.png" alt="Está demorando!" width={260} height={130} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
          {selectedCats.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60">{cat.label}</label>
              <input
                type="text"
                value={answers[cat.id] ?? ''}
                onChange={(e) => updateAnswer(cat.id, e.target.value)}
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

        <BottomBar
          center={
            <BtnPrimary onClick={handleStop} label="STOP!" pulse />
          }
        />
      </div>
    )
  }

  if (phase === 'interlude') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: '#1A1A2E' }}>
        <Image src="/cachorra.png" alt="STOP!" width={280} height={280} className="animate-letter-enter" priority />
        <p className="text-2xl font-bold animate-pulse" style={{ color: '#FF6B6B' }}>STOP!</p>
        <p className="text-sm opacity-50 animate-pulse">Preparando correção…</p>
      </div>
    )
  }

  if (phase === 'review') {
    // Aguardando validação da IA
    if (validating || results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="rounded-full flex items-center justify-center" style={{ width: 90, height: 90, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={70} height={70} />
          </div>
          <p className="text-lg font-bold opacity-70">STOP!</p>
          <p className="text-sm opacity-50 animate-pulse">Validando com IA…</p>
        </div>
      )
    }

    // Palavra por palavra — auto-avança em 5s
    if (reviewStep === 'words') {
      const r = results[reviewIdx]
      if (!r) { setReviewStep('summary'); return null }
      const isLast = reviewIdx === results.length - 1

      return (
        <ReviewWordCard
          r={r}
          idx={reviewIdx}
          total={results.length}
          letter={letter}
          isLast={isLast}
          getAviso={getAviso}
          onNext={() => isLast ? setReviewStep('summary') : setReviewIdx((i) => Math.min(i + 1, results.length - 1))}
        />
      )
    }

    // Resumo final
    const total = results.reduce((s, r) => s + r.points, 0)
    const maxPossible = results.length * 15

    return (
      <div className="flex flex-col min-h-screen px-4 py-6 gap-3 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 44, height: 44, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={34} height={34} />
          </div>
          <h2 className="text-xl font-bold">Resumo</h2>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {results.map((r, ri) => (
            <div
              key={r.categoryId}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: '#0F3460' }}
            >
              <span className="text-xs opacity-50 w-20 shrink-0">{r.categoryLabel}</span>
              <span
                className="flex-1 text-sm font-medium truncate"
                style={{ color: r.valid ? '#95E06C' : r.answer ? '#FF6B6B' : '#ffffff30' }}
              >
                {r.answer || '—'}
              </span>
              <Image src={getAviso(r, ri)} alt="" width={36} height={36} />
              <span className="text-sm font-bold w-10 text-right" style={{ color: r.points > 0 ? '#FFD93D' : '#ffffff40' }}>
                {r.points > 0 ? `+${r.points}` : '0'}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: '#16213E' }}>
          <span className="font-bold opacity-70">Total</span>
          <span className="text-2xl font-bold" style={{ color: '#FFD93D' }}>{total} / {maxPossible}</span>
        </div>

        </div>

        <BottomBar
          center={
            <BtnPrimary onClick={() => setPhase('result')} label="RESULTADO" icon="🏆" color="#4ECDC4" pulse />
          }
        />
      </div>
    )
  }

  if (phase === 'result') {
    const total = totalPoints()
    const maxPossible = selectedCats.length * 15

    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-8 gap-6 max-w-md mx-auto w-full">
        <Image src="/aviso/vencedor.png" alt="Resultado!" width={180} height={180} className="animate-letter-enter" />
        <h2 className="text-3xl font-bold" style={{ color: '#FFD93D' }}>{total} pontos!</h2>
        <p className="opacity-60 text-sm">de {maxPossible} possíveis com a letra <strong>{letter}</strong></p>

        {/* Barra de progresso */}
        <div className="w-full h-4 rounded-full" style={{ backgroundColor: '#0F3460' }}>
          <div
            className="h-4 rounded-full transition-all"
            style={{ width: `${Math.round((total / maxPossible) * 100)}%`, backgroundColor: '#95E06C' }}
          />
        </div>

        <Image src={`/cachorra/${cachorra}.png`} alt="cachorra" width={140} height={140} />

        <BottomBar
          center={
            <>
              <BtnSecondary onClick={() => router.push('/')} label="INÍCIO" icon="🏠" />
              <BtnPrimary onClick={() => { setPhase('config') }} label="DE NOVO" icon="🔄" pulse />
            </>
          }
        />
      </div>
    )
  }

  return null
}
