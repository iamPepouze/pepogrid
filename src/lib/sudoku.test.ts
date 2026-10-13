import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, PEERS, UNITS, countSolutions, generate, grade } from './sudoku'

function isValidSolution(grid: number[]): boolean {
  return UNITS.every((unit) => new Set(unit.map((i) => grid[i])).size === 9 && unit.every((i) => grid[i] >= 1 && grid[i] <= 9))
}

describe('geometry', () => {
  it('gives every cell 20 peers', () => {
    expect(PEERS.every((p) => p.length === 20)).toBe(true)
  })
})

describe.each(DIFFICULTIES)('generate(%s)', (difficulty) => {
  const expectedGrade = { easy: 1, medium: 2, hard: 3 }[difficulty]

  it('produces unique, consistent puzzles of the right grade', () => {
    for (let n = 0; n < 5; n++) {
      const { puzzle, solution } = generate(difficulty)
      expect(isValidSolution(solution)).toBe(true)
      expect(puzzle.every((v, i) => v === 0 || v === solution[i])).toBe(true)
      expect(countSolutions(puzzle, 2)).toBe(1)
      expect(grade(puzzle)).toBe(expectedGrade)
    }
  })
})
