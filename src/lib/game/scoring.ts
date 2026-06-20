import type { CategoryResult, PlayerAnswer } from './types'

export const POINTS_UNIQUE = 15
export const POINTS_DUPLICATE = 10
export const POINTS_INVALID = 0

export function computeCategoryScores(
  answers: Omit<PlayerAnswer, 'points' | 'duplicate'>[],
): PlayerAnswer[] {
  const validAnswers = answers.filter((a) => a.valid && a.answer.trim() !== '')
  const normalized = validAnswers.map((a) => a.answer.trim().toLowerCase())

  return answers.map((a) => {
    if (!a.valid || a.answer.trim() === '') {
      return { ...a, points: POINTS_INVALID, duplicate: false }
    }
    const norm = a.answer.trim().toLowerCase()
    const count = normalized.filter((n) => n === norm).length
    const isDuplicate = count > 1
    return {
      ...a,
      points: isDuplicate ? POINTS_DUPLICATE : POINTS_UNIQUE,
      duplicate: isDuplicate,
    }
  })
}

export function computeRoundTotal(results: CategoryResult[], playerId: string): number {
  return results.reduce((sum, cat) => {
    const answer = cat.answers.find((a) => a.playerId === playerId)
    return sum + (answer?.points ?? 0)
  }, 0)
}
