/**
 * Sudoku engine: solution counting, solving, and the building blocks used by
 * the bank scripts to generate puzzles (scripts/bank). The app itself plays
 * pre-rated puzzles from the bank (see bank.ts).
 */
import { candidatesAt, digitsOf, popcount, type Grid } from './grid'

export { DIFFICULTIES, type Difficulty } from './difficulty'
export { BOXES, COLS, PEERS, ROWS, UNITS, bit, boxOf, colOf, rowOf, unitsOf, type Grid } from './grid'

export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/**
 * Backtracking search over `grid`, always branching on the most constrained
 * cell. Calls `onSolution` for each solution; stops when it returns true.
 */
function search(grid: number[], onSolution: (g: number[]) => boolean, order = (m: number) => digitsOf(m)): boolean {
  let best = -1
  let bestMask = 0
  let bestCount = 10
  for (let i = 0; i < 81; i++) {
    if (grid[i]) continue
    const mask = candidatesAt(grid, i)
    const n = popcount(mask)
    if (n === 0) return false
    if (n < bestCount) {
      best = i
      bestMask = mask
      bestCount = n
      if (n === 1) break
    }
  }
  if (best === -1) return onSolution(grid)
  for (const d of order(bestMask)) {
    grid[best] = d
    if (search(grid, onSolution, order)) {
      grid[best] = 0
      return true
    }
  }
  grid[best] = 0
  return false
}

/** Counts solutions of `grid`, stopping once `limit` is reached. */
export function countSolutions(grid: readonly number[], limit = 2): number {
  let count = 0
  search(grid.slice(), () => ++count >= limit)
  return count
}

/** The first solution of `grid`, or null if it has none. */
export function solve(grid: readonly number[]): Grid | null {
  let solution: Grid | null = null
  search(grid.slice(), (g) => {
    solution = g.slice()
    return true
  })
  return solution
}

export function randomSolution(): Grid {
  let solution: Grid = []
  search(
    new Array(81).fill(0),
    (g) => {
      solution = g.slice()
      return true
    },
    (m) => shuffle(digitsOf(m)),
  )
  return solution
}

/**
 * Removes clues from `solution` in random order, keeping each removal only if
 * `keep(puzzle)` still holds, until `minGivens` remain or no clue can go.
 */
export function dig(solution: Grid, keep: (puzzle: Grid) => boolean, minGivens = 17): Grid {
  const puzzle = solution.slice()
  let givens = 81
  for (const i of shuffle([...Array(81).keys()])) {
    if (givens <= minGivens) break
    const value = puzzle[i]
    puzzle[i] = 0
    if (keep(puzzle)) givens--
    else puzzle[i] = value
  }
  return puzzle
}
