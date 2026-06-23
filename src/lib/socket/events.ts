import type { Room, Player, Round, CategoryResult, ReviewChallenge } from '@/lib/game/types'

// Client → Server
export interface ClientToServerEvents {
  'room:create': (nickname: string, avatar: string, cb: (res: { code: string; error?: string }) => void) => void
  'room:join': (
    code: string,
    nickname: string,
    avatar: string,
    cb: (res: { ok: boolean; error?: string; spectating?: boolean }) => void,
  ) => void
  'room:start': (cb: (res: { ok: boolean; error?: string }) => void) => void
  'room:sync': () => void
  'room:reconnect': (code: string, nickname: string, cb: (ok: boolean) => void) => void
  'room:ready': (code: string) => void
  'room:settings': (categories: string[]) => void
  'room:rematch': () => void
  'room:leave': () => void
  'game:stop': () => void
  'game:answers': (answers: Record<string, string>, hints?: Record<string, { word: string; explanation: string }>) => void
  'rematch:ready': () => void
  'review:challenge': (payload: { categoryId: string; playerId: string; initialVote: 'like' | 'dislike' }) => void
  'review:vote': (payload: { vote: 'like' | 'dislike' }) => void
}

// Server → Client
export interface ServerToClientEvents {
  'room:state': (room: Room) => void
  'room:players': (players: Player[]) => void
  'game:countdown': (seconds: number) => void
  'game:letter': (letter: string) => void
  'game:phase': (phase: Room['phase']) => void
  'game:timer': (remaining: number) => void
  'game:stopped': (byNickname: string) => void
  'review:results': (results: CategoryResult[]) => void
  'review:challenge:open': (challenge: ReviewChallenge) => void
  'review:challenge:votes': (votes: { likes: number; dislikes: number; total: number }) => void
  'review:challenge:close': (result: { categoryId: string; playerId: string; finalValid: boolean; likes: number; dislikes: number }) => void
  'scoreboard:update': (players: Player[]) => void
  'rematch:countdown': (seconds: number) => void
  'room:error': (message: string) => void
}

// Server-side inter-socket data
export interface SocketData {
  roomCode: string
  playerId: string
  nickname: string
}
