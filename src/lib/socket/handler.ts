import type { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from './events'
import type { Room, Player, Round } from '@/lib/game/types'
import { getRoom, setRoom, deleteRoom } from './store'
import {
  generateRoomCode,
  drawLetter,
  DEFAULT_CATEGORIES,
  DEFAULT_MAX_ROUNDS,
  DEFAULT_TIME_PER_ROUND,
  MAX_PLAYERS,
  MIN_NICKNAME_LENGTH,
  MAX_NICKNAME_LENGTH,
} from '@/lib/game/config'
import { computeCategoryScores, computeRoundTotal } from '@/lib/game/scoring'
import { saveGameResult } from '@/lib/redis/ranking'

type IO = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

const OFFENSIVE_WORDS = ['puta', 'merda', 'caralho', 'porra', 'fodase', 'foda', 'cu']
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function isOffensive(text: string): boolean {
  const lower = text.toLowerCase()
  return OFFENSIVE_WORDS.some((w) => lower.includes(w))
}

function broadcastRoom(io: IO, room: Room) {
  io.to(room.code).emit('room:state', room)
  io.to(room.code).emit('room:players', room.players)
}

function scheduleTimer(io: IO, room: Room, seconds: number, onEnd: () => void) {
  clearTimer(room.code)
  let remaining = seconds
  const tick = () => {
    io.to(room.code).emit('game:timer', remaining)
    if (remaining <= 0) {
      onEnd()
      return
    }
    remaining--
    timers.set(room.code, setTimeout(tick, 1000))
  }
  tick()
}

function clearTimer(code: string) {
  const t = timers.get(code)
  if (t) {
    clearTimeout(t)
    timers.delete(code)
  }
}

async function validateWithAI(
  letter: string,
  categoryLabel: string,
  answers: { playerId: string; nickname: string; answer: string }[],
): Promise<{ playerId: string; valid: boolean; outcome: import('@/lib/game/types').AnswerOutcome }[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter, category: categoryLabel, answers }),
    })
    if (!res.ok) throw new Error('AI request failed')
    const data = await res.json() as { results: { playerId: string; valid: boolean; outcome: import('@/lib/game/types').AnswerOutcome }[] }
    return data.results
  } catch {
    return answers.map((a) => {
      const trimmed = a.answer.trim()
      const startsOk = trimmed.toLowerCase().startsWith(letter.toLowerCase())
      const outcome: import('@/lib/game/types').AnswerOutcome = !trimmed
        ? 'vazio'
        : !startsOk
          ? 'letra_errada'
          : trimmed.length > 1
            ? 'matando_aula'
            : 'palavra_nao_existe'
      return { playerId: a.playerId, valid: startsOk && trimmed.length > 1, outcome }
    })
  }
}

export function attachSocketServer(httpServer: HttpServer): IO {
  const io: IO = new Server(httpServer, {
    path: '/api/socket',
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    socket.on('room:create', (nickname, avatar, cb) => {
      if (!nickname || nickname.length < MIN_NICKNAME_LENGTH || nickname.length > MAX_NICKNAME_LENGTH) {
        return cb({ code: '', error: 'Nickname inválido' })
      }
      if (isOffensive(nickname)) return cb({ code: '', error: 'Nickname inadequado' })

      const code = generateRoomCode()
      const player: Player = { id: socket.id, nickname, avatar: avatar || '/avatar/avatar_01.png', isHost: true, totalScore: 0, roundScores: [] }
      const room: Room = {
        code,
        phase: 'lobby',
        players: [player],
        settings: {
          timePerRound: DEFAULT_TIME_PER_ROUND as 30 | 60 | 90,
          maxRounds: DEFAULT_MAX_ROUNDS,
          categories: DEFAULT_CATEGORIES,
        },
        rounds: [],
        currentRound: null,
        hostId: socket.id,
        createdAt: Date.now(),
      }
      setRoom(room)
      socket.data.roomCode = code
      socket.data.playerId = socket.id
      socket.data.nickname = nickname
      socket.join(code)
      broadcastRoom(io, room)
      cb({ code })
    })

    socket.on('room:join', (code, nickname, avatar, cb) => {
      const room = getRoom(code.toUpperCase())
      if (!room) return cb({ ok: false, error: 'Sala não encontrada' })
      if (room.players.length >= MAX_PLAYERS) return cb({ ok: false, error: 'Sala cheia' })
      if (!nickname || nickname.length < MIN_NICKNAME_LENGTH || nickname.length > MAX_NICKNAME_LENGTH) {
        return cb({ ok: false, error: 'Nickname inválido' })
      }
      if (isOffensive(nickname)) return cb({ ok: false, error: 'Nickname inadequado' })
      if (room.players.some((p) => p.nickname.toLowerCase() === nickname.toLowerCase())) {
        return cb({ ok: false, error: 'Nickname já em uso' })
      }

      // Entra como espectador se partida em andamento — participará na próxima rodada
      const spectating = room.phase !== 'lobby'
      const player: Player = {
        id: socket.id,
        nickname,
        avatar: avatar || '/avatar/avatar_01.png',
        isHost: false,
        totalScore: 0,
        roundScores: [],
        spectating,
      }
      room.players.push(player)
      setRoom(room)
      socket.data.roomCode = room.code
      socket.data.playerId = socket.id
      socket.data.nickname = nickname
      socket.join(room.code)
      broadcastRoom(io, room)

      // Manda o estado atual do jogo para o recém-chegado
      if (spectating) {
        socket.emit('game:phase', room.phase)
        if (room.currentRound) {
          socket.emit('game:letter', room.currentRound.letter)
          if (room.currentRound.results.length > 0) {
            socket.emit('review:results', room.currentRound.results)
          }
        }
        socket.emit('scoreboard:update', room.players)
      }

      cb({ ok: true, spectating })
    })

    socket.on('room:start', (cb) => {
      const room = getRoom(socket.data.roomCode)
      if (!room) return cb({ ok: false, error: 'Sala não encontrada' })
      if (room.hostId !== socket.id) return cb({ ok: false, error: 'Apenas o host pode iniciar' })
      if (!['lobby', 'review', 'finished'].includes(room.phase)) return cb({ ok: false, error: 'Não é possível iniciar agora' })
      if (room.players.length < 1) return cb({ ok: false, error: 'Aguardando jogadores' })

      startLetterReveal(io, room)
      cb({ ok: true })
    })

    socket.on('game:answers', (answers) => {
      const room = getRoom(socket.data.roomCode)
      if (!room || room.phase !== 'playing' || !room.currentRound) return
      if (!room.currentRound.answers[socket.id]) {
        room.currentRound.answers[socket.id] = {}
      }
      for (const [catId, value] of Object.entries(answers)) {
        const sanitized = String(value).slice(0, 80).replace(/[<>]/g, '')
        room.currentRound.answers[socket.id][catId] = sanitized
      }
      setRoom(room)
    })

    socket.on('game:stop', () => {
      const room = getRoom(socket.data.roomCode)
      if (!room || room.phase !== 'playing' || !room.currentRound) return
      room.currentRound.stoppedBy = socket.data.nickname
      room.phase = 'stopping'
      setRoom(room)
      clearTimer(room.code)
      io.to(room.code).emit('game:stopped', socket.data.nickname)
      io.to(room.code).emit('game:phase', 'stopping')
      setTimeout(() => endRound(io, room.code), 2000)
    })

    socket.on('rematch:ready', () => {
      const room = getRoom(socket.data.roomCode)
      if (!room || room.phase !== 'rematch') return

      const player = room.players.find((p) => p.id === socket.id)
      if (player) player.rematchReady = true
      setRoom(room)
      broadcastRoom(io, room)

      const active = room.players.filter((p) => !p.spectating)
      const allReady = active.length >= 2 && active.every((p) => p.rematchReady)
      if (allReady) {
        clearTimer(room.code)
        resetAndStart(io, room)
      }
    })

    // Página da sala pede estado atual ao montar (resolve race condition de navegação)
    socket.on('room:sync', () => {
      const room = getRoom(socket.data.roomCode)
      if (!room) return
      socket.emit('room:state', room)
      socket.emit('room:players', room.players)
      socket.emit('game:phase', room.phase)
      if (room.currentRound) {
        socket.emit('game:letter', room.currentRound.letter)
        if (room.currentRound.results.length > 0) {
          socket.emit('review:results', room.currentRound.results)
        }
      }
    })

    socket.on('room:leave', () => handleDisconnect(io, socket))
    socket.on('disconnect', () => handleDisconnect(io, socket))
  })

  return io
}

// ─── Game flow ────────────────────────────────────────────────────────────────

function startRematch(io: IO, room: Room) {
  room.phase = 'rematch'
  for (const p of room.players) p.rematchReady = false
  setRoom(room)
  io.to(room.code).emit('game:phase', 'rematch')
  io.to(room.code).emit('scoreboard:update', room.players)

  // Contador de 20s — inicia se ≥2 jogadores prontos
  let remaining = 20
  const tick = () => {
    io.to(room.code).emit('rematch:countdown', remaining)
    if (remaining <= 0) {
      const fresh = getRoom(room.code)
      if (!fresh || fresh.phase !== 'rematch') return
      const active = fresh.players.filter((p) => !p.spectating)
      if (active.filter((p) => p.rematchReady).length >= 1) {
        resetAndStart(io, fresh)
      } else {
        // Ninguém aceitou — fica na tela
        io.to(fresh.code).emit('rematch:countdown', 0)
      }
      return
    }
    remaining--
    timers.set(room.code, setTimeout(tick, 1000))
  }
  timers.set(room.code, setTimeout(tick, 1000))
}

function resetAndStart(io: IO, room: Room) {
  clearTimer(room.code)
  // Reseta pontuações para nova partida
  for (const p of room.players) {
    p.totalScore = 0
    p.roundScores = []
    p.rematchReady = false
    p.spectating = false
  }
  room.rounds = []
  room.currentRound = null
  setRoom(room)
  startLetterReveal(io, room)
}

function activateSpectators(room: Room) {
  // Converte espectadores em jogadores ativos no início de cada rodada
  for (const p of room.players) {
    if (p.spectating) p.spectating = false
  }
}

function startLetterReveal(io: IO, room: Room) {
  activateSpectators(room)

  // Sorteio da letra ANTES do countdown
  const letter = drawLetter()

  room.phase = 'countdown'
  setRoom(room)

  // Emite a letra e a fase ao mesmo tempo — cliente mostra a letra por 5s
  io.to(room.code).emit('game:phase', 'countdown')
  io.to(room.code).emit('game:letter', letter)

  // Após 5s de revelação da letra, começa a contagem regressiva
  setTimeout(() => {
    startCountdown(io, room.code, letter)
  }, 5000)
}

function startCountdown(io: IO, code: string, letter: string) {
  let count = 3

  const tick = () => {
    io.to(code).emit('game:countdown', count)

    if (count === 0) {
      // "VAI!" fica 2s visível, depois começa a rodada
      setTimeout(() => startRound(io, code, letter), 2000)
      return
    }
    count--
    setTimeout(tick, 3000) // 3 segundos por número
  }

  tick()
}

function startRound(io: IO, code: string, letter: string) {
  const room = getRoom(code)
  if (!room) return

  const round: Round = {
    number: room.rounds.length + 1,
    letter,
    answers: {},
    results: [],
    stoppedBy: null,
  }
  room.currentRound = round
  room.phase = 'playing'
  setRoom(room)

  io.to(code).emit('game:phase', 'playing')

  scheduleTimer(io, room, room.settings.timePerRound, () => {
    const fresh = getRoom(code)
    if (!fresh || fresh.phase !== 'playing') return
    fresh.phase = 'stopping'
    setRoom(fresh)
    io.to(code).emit('game:phase', 'stopping')
    setTimeout(() => endRound(io, code), 2000)
  })
}

async function endRound(io: IO, code: string) {
  const room = getRoom(code)
  if (!room || !room.currentRound) return

  clearTimer(code)
  room.phase = 'review'
  setRoom(room)
  io.to(code).emit('game:phase', 'review')

  const { letter, answers } = room.currentRound
  const results = []

  for (const cat of room.settings.categories) {
    const catAnswers = room.players.map((p) => ({
      playerId: p.id,
      nickname: p.nickname,
      answer: (answers[p.id]?.[cat.id] || '').trim(),
    }))

    const validations = await validateWithAI(letter, cat.label, catAnswers)
    const validMap = new Map(validations.map((v) => [v.playerId, { valid: v.valid, outcome: v.outcome }]))

    const answerList = catAnswers.map((a) => ({
      ...a,
      valid: validMap.get(a.playerId)?.valid ?? false,
      outcome: validMap.get(a.playerId)?.outcome ?? 'vazio' as import('@/lib/game/types').AnswerOutcome,
      points: 0,
      duplicate: false,
    }))

    const scored = computeCategoryScores(answerList)
    results.push({ categoryId: cat.id, categoryLabel: cat.label, answers: scored })
  }

  room.currentRound.results = results
  room.rounds.push(room.currentRound)

  for (const player of room.players) {
    const roundTotal = computeRoundTotal(results, player.id)
    player.roundScores.push(roundTotal)
    player.totalScore += roundTotal
  }

  room.players.sort((a, b) => b.totalScore - a.totalScore)
  setRoom(room)

  const isLastRound = room.rounds.length >= room.settings.maxRounds

  io.to(code).emit('review:results', results)
  io.to(code).emit('room:state', room)
  io.to(code).emit('scoreboard:update', room.players)

  // Após última rodada: mostra ranking por 8s, depois vai para rematch
  if (isLastRound) {
    setTimeout(() => {
      const fresh = getRoom(code)
      if (!fresh) return
      fresh.phase = 'finished'
      setRoom(fresh)
      io.to(code).emit('game:phase', 'finished')

      // Após 8s no ranking, inicia votação de rematch
      setTimeout(() => {
        const r = getRoom(code)
        if (r && r.phase === 'finished') startRematch(io, r)
      }, 8000)
    }, 1000)
  }

  // Persiste no Redis (fire-and-forget, não bloqueia o jogo se Redis estiver fora)
  const roundNum = room.rounds.length
  for (const player of room.players) {
    const roundScore = player.roundScores[player.roundScores.length - 1] ?? 0
    const correct = results.reduce((s, cat) => {
      const a = cat.answers.find((a) => a.playerId === player.id)
      return s + (a?.valid ? 1 : 0)
    }, 0)
    saveGameResult('multi', {
      id: `${code}_r${roundNum}_${player.id}`,
      nickname: player.nickname,
      score: roundScore,
      letter: room.currentRound?.letter ?? '',
      categories: room.settings.categories.length,
      answeredCorrect: correct,
      createdAt: Date.now(),
    }).catch(() => { /* Redis offline — silencioso */ })
  }
}

function handleDisconnect(io: IO, socket: { id: string; data: SocketData; leave: (room: string) => void }) {
  const { roomCode, playerId } = socket.data
  if (!roomCode) return

  const room = getRoom(roomCode)
  if (!room) return

  room.players = room.players.filter((p) => p.id !== playerId)

  if (room.players.length === 0) {
    clearTimer(roomCode)
    deleteRoom(roomCode)
    return
  }

  if (room.hostId === playerId && room.players.length > 0) {
    room.players[0].isHost = true
    room.hostId = room.players[0].id
  }

  setRoom(room)
  socket.leave(roomCode)
  broadcastRoom(io, room)
}
