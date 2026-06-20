import { describe, it, expect } from 'vitest'
import { generateRoomCode, drawLetter, LETTERS, ROOM_CODE_LENGTH } from '@/lib/game/config'

describe('generateRoomCode', () => {
  it('returns a string of the correct length', () => {
    const code = generateRoomCode()
    expect(code).toHaveLength(ROOM_CODE_LENGTH)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, generateRoomCode))
    expect(codes.size).toBeGreaterThan(90)
  })
})

describe('drawLetter', () => {
  it('returns a letter from the valid set', () => {
    for (let i = 0; i < 50; i++) {
      expect(LETTERS).toContain(drawLetter())
    }
  })
})
