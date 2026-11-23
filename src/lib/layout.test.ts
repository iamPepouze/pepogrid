import { describe, expect, it } from 'vitest'
import { boardSize } from './layout'

describe('boardSize', () => {
  it('fills the height left when it fits', () => {
    expect(boardSize(296, 568, 280, 1)).toBe(288)
  })

  it('stops at the column width', () => {
    expect(boardSize(296, 900, 280, 1)).toBe(296)
  })

  it('shrinks to 200px at normal text on a short screen', () => {
    expect(boardSize(296, 400, 280, 1)).toBe(200)
  })

  it('keeps the full column width at 200% text, however little height is left', () => {
    expect(boardSize(296, 568, 700, 2)).toBe(296)
    expect(boardSize(376, 800, 700, 2)).toBe(376)
  })

  it('grows its minimum in proportion to the text size', () => {
    expect(boardSize(376, 100, 700, 1.5)).toBe(300)
  })

  it('does not depend on the other items at large text, so it settles the same on every load', () => {
    expect(boardSize(296, 568, 372, 2)).toBe(boardSize(296, 568, 900, 2))
  })

  it('never exceeds a column narrower than the minimum', () => {
    expect(boardSize(180, 568, 700, 1)).toBe(180)
  })

  it('ignores a text size below the default', () => {
    expect(boardSize(296, 100, 700, 0.5)).toBe(200)
  })
})
