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

type SoloPhase = 'trail' | 'config' | 'letter' | 'countdown' | 'playing' | 'interlude' | 'review' | 'result'
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

// ─── Trilha ───────────────────────────────────────────────────────────────────

type LetterProgress = { score: number; maxScore: number }
type SoloProgress = Record<string, LetterProgress>

const TRAIL_SECTIONS = [
  {
    id: 'classica',
    title: 'CLÁSSICO',
    subtitle: 'Nome · Animal · Cor · Fruta · Objeto · Profissão',
    color: '#FF6B6B',
    dark: '#C0392B',
    categoryIds: ['nome', 'animal', 'cor', 'fruta', 'objeto', 'profissao'],
    letters: ['A','B','C','D','E','F','G','H','I','J'],
  },
  {
    id: 'escolar',
    title: 'ESCOLAR',
    subtitle: 'Cidade · País · Comida · Verbo · Personagem · Esporte',
    color: '#4ECDC4',
    dark: '#16A085',
    categoryIds: ['cidade', 'pais', 'comida', 'verbo', 'personagem', 'esporte'],
    letters: ['K','L','M','N','O','P','Q','R','S'],
  },
  {
    id: 'divertida',
    title: 'DIVERTIDO',
    subtitle: 'Filme · Série · Marca · Música',
    color: '#9B59B6',
    dark: '#6C3483',
    categoryIds: ['filme', 'serie', 'marca', 'musica', 'nome', 'animal'],
    letters: ['T','U','V','W','X','Y','Z'],
  },
] as const

// zigzag: left → center-left → center-right → right → (repete)
const ZIGZAG_JUSTIFY = ['flex-start', 'center', 'flex-end', 'center'] as const

function loadProgress(): SoloProgress {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('stop_solo_progress') ?? '{}') } catch { return {} }
}

function saveProgress(letter: string, score: number, maxScore: number) {
  const p = loadProgress()
  p[letter] = { score, maxScore }
  localStorage.setItem('stop_solo_progress', JSON.stringify(p))
}

interface TrailScreenProps {
  onSelectLetter: (letter: string, cats: string[], time: number) => void
  onBack: () => void
}

function TrailScreen({ onSelectLetter, onBack }: TrailScreenProps) {
  const [progress, setProgress] = useState<SoloProgress>({})
  const [picking, setPicking] = useState<{ letter: string; cats: string[] } | null>(null)
  const [time, setTime] = useState<30 | 60 | 90>(60)

  useEffect(() => { setProgress(loadProgress()) }, [])

  let globalIdx = 0

  return (
    <main className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-center px-4 pt-4 pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="STOP ADEDONHA" width={140} style={{ height: 'auto', display: 'block' }} />
      </div>

      {/* Trilha scrollável */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
        {TRAIL_SECTIONS.map((section) => (
          <div key={section.id}>
            {/* Banner da seção */}
            <div
              className="mx-4 my-4 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: section.color }}
            >
              <div className="flex-1">
                <p className="text-xs font-black opacity-80 tracking-widest">{section.title}</p>
                <p className="text-sm font-bold text-white">{section.subtitle}</p>
              </div>
              <span style={{ fontSize: 28 }}>📋</span>
            </div>

            {/* Nós da trilha */}
            <div className="flex flex-col gap-3 px-6 py-2">
              {section.letters.map((l) => {
                const ji = globalIdx % 4
                globalIdx++
                const done = !!progress[l]
                const justify = ZIGZAG_JUSTIFY[ji]

                return (
                  <div key={l} className="flex" style={{ justifyContent: justify }}>
                    <button
                      onClick={() => setPicking({ letter: l, cats: [...section.categoryIds] })}
                      className="relative flex flex-col items-center justify-center active:scale-90 transition-transform"
                      style={{
                        width: 72, height: 72,
                        borderRadius: 36,
                        backgroundColor: done ? section.color : '#0F3460',
                        border: `3px solid ${done ? section.dark : 'rgba(255,255,255,0.12)'}`,
                        boxShadow: done ? `0 4px 16px ${section.color}55` : undefined,
                      }}
                    >
                      <Image
                        src={`/letras/letra_${l.toLowerCase()}.png`}
                        alt={l}
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                      />
                      {done && (
                        <div
                          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
                          style={{ width: 22, height: 22, backgroundColor: '#FFD93D', fontSize: 11, fontWeight: 900 }}
                        >
                          {progress[l].score}
                        </div>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Cachorra no fim da trilha */}
        <div className="flex justify-center py-6">
          <Image src="/cachorra/3.png" alt="" width={120} height={120} style={{ objectFit: 'contain' }} />
        </div>
      </div>

      {/* Modal de seleção de tempo */}
      {picking && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setPicking(null)}
        >
          <div
            className="w-full rounded-t-3xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: '#0F3460' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-3 mb-1">
              <Image src={`/letras/letra_${picking.letter.toLowerCase()}.png`} alt={picking.letter} width={48} height={48} />
              <p className="text-xl font-black text-white">Letra {picking.letter}</p>
            </div>
            <p className="text-sm opacity-60 text-center">Escolha o tempo por rodada</p>
            <div className="flex gap-3">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className="flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95"
                  style={{
                    backgroundColor: time === t ? '#FF6B6B' : '#16213E',
                    color: 'white',
                    border: time === t ? '2px solid #FFD93D' : '2px solid transparent',
                  }}
                >
                  {t}s
                </button>
              ))}
            </div>
            <button
              onClick={() => { onSelectLetter(picking.letter, picking.cats, time); setPicking(null) }}
              className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 transition-transform animate-pulse-stop"
              style={{ backgroundColor: '#FF6B6B', border: '2px solid #FFD93D' }}
            >
              ▶ JOGAR!
            </button>
          </div>
        </div>
      )}

      <BottomBar left={<BtnSecondary onClick={onBack} icon="🏠" label="INÍCIO" />} />
    </main>
  )
}

interface ReviewWordCardProps {
  r: AnswerResult
  idx: number
  total: number
  letter: string
  getAviso: (r: AnswerResult, idx: number) => string
  onPrev: (() => void) | null
  onNext: () => void
}

function ReviewWordCard({ r, idx, total, letter, getAviso, onPrev, onNext }: ReviewWordCardProps) {
  const isLast = idx === total - 1
  const avisoSrc = getAviso(r, idx)

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
      {/* Cabeçalho */}
      <div className="shrink-0 px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 40, height: 40, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={30} height={30} />
          </div>
          <h2 className="text-xl font-bold flex-1" style={{ color: '#FFD93D' }}>{r.categoryLabel}</h2>
          <span className="text-sm opacity-40 tabular-nums">{idx + 1}/{total}</span>
        </div>
        {/* Indicador de progresso por segmentos */}
        <div className="w-full flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: i <= idx ? (isLast ? '#FF6B6B' : '#4ECDC4') : '#0F3460' }}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 gap-4 animate-slide-up">
        {/* Resposta do jogador */}
        <div className="w-full rounded-2xl px-6 py-4 text-center" style={{ backgroundColor: '#0F3460' }}>
          <p className="text-xs font-bold opacity-50 mb-1 uppercase tracking-wider">Sua resposta</p>
          <span
            className="text-3xl font-extrabold"
            style={{ color: r.valid ? '#95E06C' : r.answer ? '#FF6B6B' : '#ffffff25' }}
          >
            {r.answer || '—'}
          </span>
        </div>

        {/* Aviso em destaque */}
        <Image
          src={avisoSrc}
          alt=""
          width={220}
          height={220}
          className="drop-shadow-2xl"
          style={{ objectFit: 'contain' }}
        />

        {/* Pontuação */}
        <div
          className="px-8 py-2 rounded-full"
          style={{ backgroundColor: r.points > 0 ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.05)' }}
        >
          <span className="text-2xl font-black" style={{ color: r.points > 0 ? '#FFD93D' : '#ffffff40' }}>
            {r.points > 0 ? `+${r.points} pontos` : 'Zero pontos'}
          </span>
        </div>
      </div>

      <BottomBar
        left={onPrev ? <BtnSecondary onClick={onPrev} icon="←" label="ANTERIOR" /> : undefined}
        right={
          <BtnPrimary
            onClick={onNext}
            icon={isLast ? '📋' : '→'}
            label={isLast ? 'RESUMO' : 'PRÓXIMA'}
            color={isLast ? '#FF6B6B' : '#4ECDC4'}
            pulse={isLast}
          />
        }
      />
    </div>
  )
}

export default function SoloPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<SoloPhase>('trail')
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
  const [hintUsed, setHintUsed] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [catIdx, setCatIdx] = useState(0)

  const answersRef = useRef<Record<string, string>>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const demoraRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const letterRef = useRef('')

  function clearAllTimers() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (demoraRef.current) clearTimeout(demoraRef.current)
  }

  // ─── Início do jogo ──────────────────────────────────────────────────────

  function startGameWithLetter(l: string, catIds: string[], time: number) {
    const cats = ALL_CATEGORIES.filter((c) => catIds.includes(c.id))
    setSelectedCats(cats)
    setSelectedTime(time as 30 | 60 | 90)
    letterRef.current = l
    setLetter(l)
    answersRef.current = {}
    setAnswers({})
    setResults([])
    setShowDemora(false)
    setHintUsed(false)
    setHintLoading(false)
    setCatIdx(0)
    setPhase('letter')
    timerRef.current = setTimeout(() => startCountdown(l), 5000)
  }

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

      const totalScore = allResults.reduce((s, r) => s + r.points, 0)
      const maxScore = allResults.length * 15
      saveProgress(letterRef.current, totalScore, maxScore)

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

  async function useHint(idx: number) {
    if (hintUsed || hintLoading) return
    const target = selectedCats[idx]
    if (!target) return
    setHintLoading(true)
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letter, categoryLabel: target.label }),
      })
      const { word } = await res.json() as { word: string }
      if (word) { updateAnswer(target.id, word); setHintUsed(true) }
    } catch { /* silently fail */ }
    setHintLoading(false)
  }

  function getAviso(r: AnswerResult, idx = 0): string {
    if (r.outcome) return avisoFromOutcome(r.outcome)
    return avisoFromAnswer(r.answer ?? '', letter, idx)
  }

  useEffect(() => () => clearAllTimers(), [])

  // ─── Renders ──────────────────────────────────────────────────────────────

  if (phase === 'trail') {
    return (
      <TrailScreen
        onSelectLetter={startGameWithLetter}
        onBack={() => router.push('/')}
      />
    )
  }

  if (phase === 'config') {
    return (
      <main className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-center px-4 pt-4 pb-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="STOP ADEDONHA" width={160} style={{ height: 'auto', display: 'block' }} />
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
    const cat = selectedCats[catIdx]
    const total = selectedCats.length
    const isFirst = catIdx === 0
    const isLast = catIdx === total - 1

    return (
      <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#1A1A2E' }}>
        {/* Header: letra + timer */}
        <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
          <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 52, height: 52, backgroundColor: '#FFD93D' }}>
            <Image src={`/letras/letra_${letter.toLowerCase()}.png`} alt={letter} width={40} height={40} priority />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl font-bold tabular-nums" style={{ color: urgent ? '#FF6B6B' : '#FFD93D' }}>{timer}s</span>
            <div className="w-28 h-2 rounded-full" style={{ backgroundColor: '#0F3460' }}>
              <div className="h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, (timer / selectedTime) * 100)}%`, backgroundColor: urgent ? '#FF6B6B' : '#4ECDC4' }} />
            </div>
          </div>
        </div>

        {/* Conteúdo central da categoria */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Pontos de progresso */}
          <div className="flex gap-2 items-center">
            {selectedCats.map((c, i) => {
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

          {/* Nome da categoria + contador */}
          <div className="text-center">
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">{catIdx + 1} / {total}</p>
            <h2 className="text-4xl font-black" style={{ color: '#FFD93D' }}>{cat?.label}</h2>
          </div>

          {/* Campo de resposta grande */}
          {cat && (
            <input
              key={cat.id}
              type="text"
              value={answers[cat.id] ?? ''}
              onChange={(e) => updateAnswer(cat.id, e.target.value)}
              maxLength={80}
              placeholder={`Com ${letter}…`}
              autoFocus
              className="w-full text-center text-2xl font-bold text-white placeholder-white/25 outline-none rounded-2xl px-4 py-5 transition-all"
              style={{ backgroundColor: '#0F3460', border: `2px solid ${answers[cat.id]?.trim() ? '#4ECDC4' : '#16213E'}` }}
              onFocus={(e) => (e.target.style.borderColor = '#4ECDC4')}
              onBlur={(e) => (e.target.style.borderColor = answers[cat.id]?.trim() ? '#4ECDC4' : '#16213E')}
            />
          )}

          {/* demora */}
          {showDemora && (
            <Image src="/aviso/demora.png" alt="Está demorando!" width={200} height={100} className="animate-fade-in" />
          )}
        </div>

        <BottomBar
          left={<BtnSecondary onClick={() => setCatIdx((i) => i - 1)} icon="←" label="ANTERIOR" disabled={isFirst} />}
          center={
            <>
              <BtnSecondary
                onClick={() => useHint(catIdx)}
                icon={hintLoading ? '⏳' : hintUsed ? '✅' : '💡'}
                label={hintUsed ? 'USADA' : 'DICA'}
                color={hintUsed ? 'rgba(255,255,255,0.05)' : 'rgba(255,217,61,0.15)'}
                disabled={hintUsed || hintLoading}
              />
              <BtnPrimary onClick={handleStop} label="STOP!" pulse />
            </>
          }
          right={<BtnSecondary onClick={() => setCatIdx((i) => i + 1)} icon="→" label="PRÓXIMA" disabled={isLast} />}
        />
      </div>
    )
  }

  if (phase === 'interlude') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: '#1A1A2E' }}>
        <Image src="/cachorra/1.png" alt="STOP!" width={280} height={280} className="animate-letter-enter" priority />
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
          getAviso={getAviso}
          onPrev={reviewIdx > 0 ? () => setReviewIdx((i) => i - 1) : null}
          onNext={() => isLast ? setReviewStep('summary') : setReviewIdx((i) => i + 1)}
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
              {/* Aviso em destaque */}
              <Image src={getAviso(r, ri)} alt="" width={56} height={56} style={{ objectFit: 'contain', flexShrink: 0 }} />

              {/* Categoria + resposta */}
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-xs opacity-50 mb-0.5">{r.categoryLabel}</span>
                <span
                  className="text-base font-bold truncate"
                  style={{ color: r.valid ? '#95E06C' : r.answer ? '#FF6B6B' : '#ffffff30' }}
                >
                  {r.answer || '—'}
                </span>
              </div>

              {/* Pontos */}
              <span
                className="text-base font-black shrink-0"
                style={{ color: r.points > 0 ? '#FFD93D' : '#ffffff30', minWidth: 32, textAlign: 'right' }}
              >
                {r.points > 0 ? `+${r.points}` : '0'}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: '#16213E' }}>
          <span className="font-bold opacity-70">Total</span>
          <span className="text-2xl font-bold" style={{ color: '#FFD93D' }}>{total} / {maxPossible}</span>
        </div>

        <BottomBar
          right={
            <BtnPrimary onClick={() => setPhase('result')} label="RESULTADO" icon="🏆" color="#4ECDC4" pulse />
          }
        />
      </div>
    )
  }

  if (phase === 'result') {
    const total = totalPoints()
    const maxPossible = selectedCats.length * 15
    const pct = maxPossible > 0 ? total / maxPossible : 0
    const resultPose = pct >= 0.7 ? 2 : pct >= 0.4 ? 3 : 4

    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-8 gap-6 max-w-md mx-auto w-full">
        <Image src={`/cachorra/${resultPose}.png`} alt="Resultado!" width={200} height={200} className="animate-letter-enter" />
        <h2 className="text-3xl font-bold" style={{ color: '#FFD93D' }}>{total} pontos!</h2>
        <p className="opacity-60 text-sm">de {maxPossible} possíveis com a letra <strong>{letter}</strong></p>

        {/* Barra de progresso */}
        <div className="w-full h-4 rounded-full" style={{ backgroundColor: '#0F3460' }}>
          <div
            className="h-4 rounded-full transition-all"
            style={{ width: `${Math.round((total / maxPossible) * 100)}%`, backgroundColor: '#95E06C' }}
          />
        </div>

        <BottomBar
          center={
            <>
              <BtnSecondary onClick={() => setPhase('trail')} label="TRILHA" icon="🗺️" />
              <BtnPrimary onClick={() => setPhase('trail')} label="DE NOVO" icon="🔄" pulse />
            </>
          }
        />
      </div>
    )
  }

  return null
}
