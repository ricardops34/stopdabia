import type { Room, Player, Round, CategoryResult } from '@/lib/game/types'

// Client → Server
export interface ClientToServerEvents {
  'room:create': (nickname: string, cb: (res: { code: string; error?: string }) => void) => void
  'room:join': (
    code: string,
    nickname: string,
    cb: (res: { ok: boolean; error?: string }) => void,
  ) => void
  'room:start': (cb: (res: { ok: boolean; error?: string }) => void) => void
  'game:stop': () => void
  'game:answers': (answers: Record<string, string>) => void
  'review:vote': (categoryId: string, playerId: string, valid: boolean) => void
  'review:next': (cb: (res: { ok: boolean }) => void) => void
  'room:leave': () => void
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
  'scoreboard:update': (players: Player[]) => void
  'room:error': (message: string) => void
}

// Server-side inter-socket data
export interface SocketData {
  roomCode: string
  playerId: string
  nickname: string
}
