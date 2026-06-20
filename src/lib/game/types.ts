export type GamePhase =
  | 'lobby'
  | 'countdown'
  | 'playing'
  | 'stopping'
  | 'review'
  | 'scoreboard'
  | 'finished'
  | 'rematch'

export interface Player {
  id: string
  nickname: string
  avatar: string
  isHost: boolean
  totalScore: number
  roundScores: number[]
  spectating?: boolean
  rematchReady?: boolean
}

export interface Category {
  id: string
  label: string
  group: 'classica' | 'escolar' | 'divertida'
}

export interface RoomSettings {
  timePerRound: 30 | 60 | 90
  maxRounds: number
  categories: Category[]
}

export type AnswerOutcome = 'acerto' | 'matando_aula' | 'letra_errada' | 'palavra_nao_existe' | 'vazio'

export interface PlayerAnswer {
  playerId: string
  nickname: string
  answer: string
  valid: boolean | null
  points: number
  duplicate: boolean
  outcome?: AnswerOutcome
}

export interface CategoryResult {
  categoryId: string
  categoryLabel: string
  answers: PlayerAnswer[]
}

export interface Round {
  number: number
  letter: string
  answers: Record<string, Record<string, string>>
  results: CategoryResult[]
  stoppedBy: string | null
}

export interface Room {
  code: string
  phase: GamePhase
  players: Player[]
  settings: RoomSettings
  rounds: Round[]
  currentRound: Round | null
  hostId: string
  createdAt: number
}

export interface ValidationRequest {
  letter: string
  category: string
  answers: { playerId: string; nickname: string; answer: string }[]
}

export interface ValidationResult {
  category: string
  results: { playerId: string; valid: boolean; points: number }[]
}
