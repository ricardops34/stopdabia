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
): Promise<{ playerId: string; valid: boolean }[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter, category: categoryLabel, answers }),
    })
    if (!res.ok) throw new Error('AI request failed')
    const data = await res.json() as { results: { playerId: string; valid: boolean }[] }
    return data.results
  } catch {
    return answers.map((a) => ({
      playerId: a.playerId,
      valid: a.answer.trim().toLowerCase().startsWith(letter.toLowerCase()) && a.answer.trim().length > 1,
    }))
  }
}

export function attachSocketServer(httpServer: HttpServer): IO {
  const io: IO = new Server(httpServer, {
    path: '/api/socket',
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    socket.on('room:create', (nickname, cb) => {
      if (!nickname || nickname.length < MIN_NICKNAME_LENGTH || nickname.length > MAX_NICKNAME_LENGTH) {
        return cb({ code: '', error: 'Nickname inválido' })
      }
      if (isOffensive(nickname)) return cb({ code: '', error: 'Nickname inadequado' })

      const code = generateRoomCode()
      const player: Player = { id: socket.id, nickname, isHost: true, totalScore: 0, roundScores: [] }
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

    socket.on('room:join', (code, nickname, cb) => {
      const room = getRoom(code.toUpperCase())
      if (!room) return cb({ ok: false, error: 'Sala não encontrada' })
      if (room.phase !== 'lobby') return cb({ ok: false, error: 'Partida em andamento' })
      if (room.players.length >= MAX_PLAYERS) return cb({ ok: false, error: 'Sala cheia' })
      if (!nickname || nickname.length < MIN_NICKNAME_LENGTH || nickname.length > MAX_NICKNAME_LENGTH) {
        return cb({ ok: false, error: 'Nickname inválido' })
      }
      if (isOffensive(nickname)) return cb({ ok: false, error: 'Nickname inadequado' })
      if (room.players.some((p) => p.nickname.toLowerCase() === nickname.toLowerCase())) {
        return cb({ ok: false, error: 'Nickname já em uso' })
      }

      const player: Player = { id: socket.id, nickname, isHost: false, totalScore: 0, roundScores: [] }
      room.players.push(player)
      setRoom(room)
      socket.data.roomCode = room.code
      socket.data.playerId = socket.id
      socket.data.nickname = nickname
      socket.join(room.code)
      broadcastRoom(io, room)
      cb({ ok: true })
    })

    socket.on('room:start', (cb) => {
      const room = getRoom(socket.data.roomCode)
      if (!room) return cb({ ok: false, error: 'Sala não encontrada' })
      if (room.hostId !== socket.id) return cb({ ok: false, error: 'Apenas o host pode iniciar' })
      if (room.phase !== 'lobby' && room.phase !== 'review') return cb({ ok: false, error: 'Não é possível iniciar agora' })
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

    socket.on('room:leave', () => handleDisconnect(io, socket))
    socket.on('disconnect', () => handleDisconnect(io, socket))
  })

  return io
}

// ─── Game flow ────────────────────────────────────────────────────────────────

function startLetterReveal(io: IO, room: Room) {
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
    const validMap = new Map(validations.map((v) => [v.playerId, v.valid]))

    const answerList = catAnswers.map((a) => ({
      ...a,
      valid: validMap.get(a.playerId) ?? false,
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

  io.to(code).emit('review:results', results)
  io.to(code).emit('room:state', room)
  io.to(code).emit('scoreboard:update', room.players)
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
