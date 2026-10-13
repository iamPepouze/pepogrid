/**
 * Sudoku engine: board geometry, solution counting, puzzle generation and
 * difficulty grading.
 *
 * A grid is a flat array of 81 numbers in row-major order, 0 meaning empty.
 * Candidate sets are bitmasks where bit `d` (1..9) means digit `d` is allowed.
 */

export type Grid = number[]
export type Difficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard']

export const rowOf = (i: number) => Math.floor(i / 9)
export const colOf = (i: number) => i % 9
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3)

/** The 27 units: rows 0-8, columns 9-17, boxes 18-26. */
export const UNITS: readonly number[][] = (() => {
  const units: number[][] = Array.from({ length: 27 }, () => [])
  for (let i = 0; i < 81; i++) {
    units[rowOf(i)].push(i)
    units[9 + colOf(i)].push(i)
    units[18 + boxOf(i)].push(i)
  }
  return units
})()

/** For each cell, the 20 other cells sharing its row, column or box. */
export const PEERS: readonly number[][] = Array.from({ length: 81 }, (_, i) => {
  const peers = new Set<number>()
  for (const unit of [UNITS[rowOf(i)], UNITS[9 + colOf(i)], UNITS[18 + boxOf(i)]]) {
    for (const p of unit) if (p !== i) peers.add(p)
  }
  return [...peers]
})

const ALL_DIGITS = 0b1111111110

export const bit = (d: number) => 1 << d

function popcount(mask: number): number {
  let count = 0
  while (mask) {
    mask &= mask - 1
    count++
  }
  return count
}

function digitsOf(mask: number): number[] {
  const digits: number[] = []
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) digits.push(d)
  return digits
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function candidatesAt(grid: readonly number[], i: number): number {
  let used = 0
  for (const p of PEERS[i]) used |= bit(grid[p])
  return ALL_DIGITS & ~used
}

/** Counts solutions of `grid`, stopping once `limit` is reached. */
export function countSolutions(grid: readonly number[], limit = 2): number {
  const g = grid.slice()
  let count = 0

  // Returns true when the search should stop.
  const search = (): boolean => {
    let best = -1
    let bestMask = 0
    let bestCount = 10
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue
      const mask = candidatesAt(g, i)
      const n = popcount(mask)
      if (n === 0) return false
      if (n < bestCount) {
        best = i
        bestMask = mask
        bestCount = n
        if (n === 1) break
      }
    }
    if (best === -1) {
      count++
      return count >= limit
    }
    for (const d of digitsOf(bestMask)) {
      g[best] = d
      if (search()) return true
    }
    g[best] = 0
    return false
  }

  search()
  return count
}

function randomSolution(): Grid {
  const g: Grid = new Array(81).fill(0)
  // Always fill the most constrained cell next to keep backtracking shallow.
  const fill = (): boolean => {
    let best = -1
    let bestMask = 0
    let bestCount = 10
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue
      const mask = candidatesAt(g, i)
      const n = popcount(mask)
      if (n < bestCount) {
        best = i
        bestMask = mask
        bestCount = n
      }
    }
    if (best === -1) return true
    for (const d of shuffle(digitsOf(bestMask))) {
      g[best] = d
      if (fill()) return true
    }
    g[best] = 0
    return false
  }
  fill()
  return g
}

/* ------------------------------------------------------------------ */
/* Logical solver used for grading                                     */
/* ------------------------------------------------------------------ */

/** Pointing pairs/triples and box/line reduction. */
function lockedCandidates(cand: number[]): boolean {
  let changed = false
  const eliminate = (cells: readonly number[], d: number, keep: (i: number) => boolean) => {
    for (const i of cells) {
      if (!keep(i) && cand[i] & bit(d)) {
        cand[i] &= ~bit(d)
        changed = true
      }
    }
  }

  for (let b = 0; b < 9; b++) {
    const box = UNITS[18 + b]
    for (let d = 1; d <= 9; d++) {
      const cells = box.filter((i) => cand[i] & bit(d))
      if (cells.length < 2) continue
      const r = rowOf(cells[0])
      if (cells.every((i) => rowOf(i) === r)) eliminate(UNITS[r], d, (i) => boxOf(i) === b)
      const c = colOf(cells[0])
      if (cells.every((i) => colOf(i) === c)) eliminate(UNITS[9 + c], d, (i) => boxOf(i) === b)
    }
  }

  for (let u = 0; u < 18; u++) {
    const line = UNITS[u]
    for (let d = 1; d <= 9; d++) {
      const cells = line.filter((i) => cand[i] & bit(d))
      if (cells.length < 2) continue
      const b = boxOf(cells[0])
      if (cells.every((i) => boxOf(i) === b)) eliminate(UNITS[18 + b], d, (i) => line.includes(i))
    }
  }
  return changed
}

function nakedPairs(cand: number[]): boolean {
  let changed = false
  for (const unit of UNITS) {
    for (let a = 0; a < 9; a++) {
      const mask = cand[unit[a]]
      if (popcount(mask) !== 2) continue
      for (let b = a + 1; b < 9; b++) {
        if (cand[unit[b]] !== mask) continue
        for (const i of unit) {
          if (i !== unit[a] && i !== unit[b] && cand[i] & mask) {
            cand[i] &= ~mask
            changed = true
          }
        }
      }
    }
  }
  return changed
}

function hiddenPairs(cand: number[]): boolean {
  let changed = false
  for (const unit of UNITS) {
    const places = Array.from({ length: 10 }, (_, d) => unit.filter((i) => cand[i] & bit(d)))
    for (let d1 = 1; d1 <= 9; d1++) {
      if (places[d1].length !== 2) continue
      for (let d2 = d1 + 1; d2 <= 9; d2++) {
        const [p, q] = places[d2]
        if (places[d2].length !== 2 || p !== places[d1][0] || q !== places[d1][1]) continue
        const mask = bit(d1) | bit(d2)
        for (const i of [p, q]) {
          if (cand[i] & ~mask) {
            cand[i] &= mask
            changed = true
          }
        }
      }
    }
  }
  return changed
}

/**
 * Tries to solve with human techniques only.
 * Level 1: naked and hidden singles.
 * Level 2: adds locked candidates, naked pairs and hidden pairs.
 */
function solvesLogically(puzzle: readonly number[], level: 1 | 2): boolean {
  const values = puzzle.slice()
  const cand = values.map((v, i) => (v ? 0 : candidatesAt(values, i)))
  let remaining = values.filter((v) => !v).length

  const place = (i: number, d: number) => {
    values[i] = d
    cand[i] = 0
    remaining--
    for (const p of PEERS[i]) cand[p] &= ~bit(d)
  }

  const nakedSingle = (): boolean => {
    for (let i = 0; i < 81; i++) {
      if (!values[i] && popcount(cand[i]) === 1) {
        place(i, digitsOf(cand[i])[0])
        return true
      }
    }
    return false
  }

  const hiddenSingle = (): boolean => {
    for (const unit of UNITS) {
      for (let d = 1; d <= 9; d++) {
        let pos = -1
        let n = 0
        for (const i of unit) {
          if (cand[i] & bit(d)) {
            n++
            pos = i
          }
        }
        if (n === 1) {
          place(pos, d)
          return true
        }
      }
    }
    return false
  }

  while (remaining > 0) {
    if (nakedSingle() || hiddenSingle()) continue
    if (level >= 2 && (lockedCandidates(cand) || nakedPairs(cand) || hiddenPairs(cand))) continue
    return false
  }
  return true
}

/** 1 = singles only, 2 = needs intermediate techniques, 3 = needs more than that. */
export function grade(puzzle: readonly number[]): 1 | 2 | 3 {
  if (solvesLogically(puzzle, 1)) return 1
  if (solvesLogically(puzzle, 2)) return 2
  return 3
}

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

interface Profile {
  /** Hardest grade allowed while removing clues. */
  maxGrade: 1 | 2 | 3
  /** Range for the number of clues to stop removing at. */
  givens: [number, number]
  /** Grade the finished puzzle must have. */
  target: 1 | 2 | 3
}

const PROFILES: Record<Difficulty, Profile> = {
  easy: { maxGrade: 1, givens: [36, 40], target: 1 },
  medium: { maxGrade: 2, givens: [27, 31], target: 2 },
  hard: { maxGrade: 3, givens: [0, 0], target: 3 },
}

const MAX_ATTEMPTS = 60

function dig(solution: Grid, maxGrade: 1 | 2 | 3, minGivens: number): Grid {
  const puzzle = solution.slice()
  let givens = 81
  for (const i of shuffle([...Array(81).keys()])) {
    if (givens <= minGivens) break
    const value = puzzle[i]
    puzzle[i] = 0
    // A logical solve only makes forced deductions, so it also proves uniqueness.
    const ok = maxGrade === 3 ? countSolutions(puzzle, 2) === 1 : grade(puzzle) <= maxGrade
    if (ok) givens--
    else puzzle[i] = value
  }
  return puzzle
}

export interface Puzzle {
  puzzle: Grid
  solution: Grid
}

/** Generates a puzzle with a unique solution matching the requested difficulty. */
export function generate(difficulty: Difficulty): Puzzle {
  const profile = PROFILES[difficulty]
  let fallback: Puzzle | null = null
  let fallbackDistance = Infinity

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const solution = randomSolution()
    const puzzle = dig(solution, profile.maxGrade, randomInt(...profile.givens))
    const g = grade(puzzle)
    if (g === profile.target) return { puzzle, solution }
    const distance = Math.abs(g - profile.target)
    if (distance < fallbackDistance) {
      fallback = { puzzle, solution }
      fallbackDistance = distance
    }
  }
  return fallback!
}
