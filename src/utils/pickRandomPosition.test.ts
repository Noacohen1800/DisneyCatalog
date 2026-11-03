import { describe, expect, it } from 'vitest'
import { pickRandomPosition } from './pickRandomPosition'

describe('pickRandomPosition (Random page)', () => {
  it('always returns a whole number between 1 and the total', () => {
    for (let i = 0; i < 1000; i++) {
      const position = pickRandomPosition(9800)
      expect(Number.isInteger(position)).toBe(true)
      expect(position).toBeGreaterThanOrEqual(1)
      expect(position).toBeLessThanOrEqual(9800)
    }
  })

  it('never returns the current position, so "Show another" always changes the character', () => {
    for (let i = 0; i < 1000; i++) {
      expect(pickRandomPosition(3, 2)).not.toBe(2)
    }
  })

  it('stays in range at the extremes of the random number, with and without a current position', () => {
    const lowest = () => 0
    const highest = () => 0.9999999

    expect(pickRandomPosition(10, undefined, lowest)).toBe(1)
    expect(pickRandomPosition(10, undefined, highest)).toBe(10)
    // Current is 1, so the lowest possible answer moves up to 2
    expect(pickRandomPosition(10, 1, lowest)).toBe(2)
    // Current is 10, so the highest possible answer moves down to 9
    expect(pickRandomPosition(10, 10, highest)).toBe(9)
  })

  it('returns 1 when there is only one character, since there is nothing else to show', () => {
    expect(pickRandomPosition(1, 1)).toBe(1)
  })

  it('throws for a total that has no valid positions', () => {
    expect(() => pickRandomPosition(0)).toThrow()
    expect(() => pickRandomPosition(-5)).toThrow()
    expect(() => pickRandomPosition(2.5)).toThrow()
  })
})
