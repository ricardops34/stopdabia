import type { Category } from './types'

export const LETTERS = 'ABCDEFGHIJLMNOPQRSTUVZ'.split('')

export const ALL_CATEGORIES: Category[] = [
  { id: 'nome', label: 'Nome', group: 'classica' },
  { id: 'animal', label: 'Animal', group: 'classica' },
  { id: 'cor', label: 'Cor', group: 'classica' },
  { id: 'fruta', label: 'Fruta', group: 'classica' },
  { id: 'objeto', label: 'Objeto', group: 'classica' },
  { id: 'profissao', label: 'Profissão', group: 'classica' },
  { id: 'cidade', label: 'Cidade', group: 'escolar' },
  { id: 'pais', label: 'País', group: 'escolar' },
  { id: 'comida', label: 'Comida', group: 'escolar' },
  { id: 'verbo', label: 'Verbo', group: 'escolar' },
  { id: 'personagem', label: 'Personagem', group: 'escolar' },
  { id: 'esporte', label: 'Esporte', group: 'escolar' },
  { id: 'filme', label: 'Filme', group: 'divertida' },
  { id: 'serie', label: 'Série', group: 'divertida' },
  { id: 'marca', label: 'Marca', group: 'divertida' },
  { id: 'musica', label: 'Música', group: 'divertida' },
]

export const DEFAULT_CATEGORIES = ALL_CATEGORIES.slice(0, 6)

export const ROOM_CODE_LENGTH = 6
export const MAX_PLAYERS = 10
export const MIN_NICKNAME_LENGTH = 3
export const MAX_NICKNAME_LENGTH = 20
export const DEFAULT_TIME_PER_ROUND = 60
export const DEFAULT_MAX_ROUNDS = 5

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function drawLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}
