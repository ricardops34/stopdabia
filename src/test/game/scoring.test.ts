import { describe, it, expect } from 'vitest'
import { computeCategoryScores, POINTS_UNIQUE, POINTS_DUPLICATE, POINTS_INVALID } from '@/lib/game/scoring'

describe('computeCategoryScores', () => {
  it('gives unique points when answers differ', () => {
    const input = [
      { playerId: '1', nickname: 'Ana', answer: 'Macaco', valid: true },
      { playerId: '2', nickname: 'João', answer: 'Morcego', valid: true },
    ]
    const result = computeCategoryScores(input)
    expect(result[0].points).toBe(POINTS_UNIQUE)
    expect(result[1].points).toBe(POINTS_UNIQUE)
    expect(result[0].duplicate).toBe(false)
  })

  it('gives duplicate points when answers match', () => {
    const input = [
      { playerId: '1', nickname: 'Ana', answer: 'Macaco', valid: true },
      { playerId: '2', nickname: 'João', answer: 'macaco', valid: true },
    ]
    const result = computeCategoryScores(input)
    expect(result[0].points).toBe(POINTS_DUPLICATE)
    expect(result[1].points).toBe(POINTS_DUPLICATE)
    expect(result[0].duplicate).toBe(true)
  })

  it('gives zero for invalid answers', () => {
    const input = [
      { playerId: '1', nickname: 'Pedro', answer: 'Mesa', valid: false },
    ]
    const result = computeCategoryScores(input)
    expect(result[0].points).toBe(POINTS_INVALID)
  })

  it('gives zero for empty answers', () => {
    const input = [
      { playerId: '1', nickname: 'Ana', answer: '', valid: true },
    ]
    const result = computeCategoryScores(input)
    expect(result[0].points).toBe(POINTS_INVALID)
  })
})
