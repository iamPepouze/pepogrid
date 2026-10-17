/**
 * Board geometry shared by the generator and the rater.
 *
 * A grid is a flat array of 81 numbers in row-major order, 0 meaning empty.
 * Candidate sets are bitmasks where bit `d` (1..9) means digit `d` is allowed.
 */

export type Grid = number[]

export const rowOf = (i: number) => Math.floor(i / 9)
export const colOf = (i: number) => i % 9
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3)

/** Cells of each row, column and box, in reading order. */
export const ROWS: readonly number[][] = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c))
export const COLS: readonly number[][] = Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, r) => r * 9 + c))
export const BOXES: readonly number[][] = Array.from({ length: 9 }, (_, b) =>
  Array.from({ length: 9 }, (_, i) => 9 * (Math.floor(b / 3) * 3 + Math.floor(i / 3)) + (b % 3) * 3 + (i % 3)),
)

/** The 27 units: rows 0-8, columns 9-17, boxes 18-26. */
export const UNITS: readonly number[][] = [...ROWS, ...COLS, ...BOXES]

/** The row, column and box that cell `i` belongs to. */
export const unitsOf = (i: number): readonly number[][] => [ROWS[rowOf(i)], COLS[colOf(i)], BOXES[boxOf(i)]]

/** For each cell, the 20 other cells sharing its row, column or box, in ascending order. */
export const PEERS: readonly number[][] = Array.from({ length: 81 }, (_, i) =>
  [...new Set(unitsOf(i).flat())].filter((p) => p !== i).sort((a, b) => a - b),
)

/** SEES[i][j] is true when cells i and j see each other. */
const SEES: readonly boolean[][] = Array.from({ length: 81 }, (_, i) => {
  const row = new Array<boolean>(81).fill(false)
  for (const p of PEERS[i]) row[p] = true
  return row
})

export const sees = (a: number, b: number) => SEES[a][b]

export const ALL_DIGITS = 0b1111111110

// eslint-disable-next-line no-restricted-syntax -- the one place a digit's bitmask is spelled out.
export const bit = (d: number) => 1 << d

export function popcount(mask: number): number {
  let count = 0
  while (mask) {
    mask &= mask - 1
    count++
  }
  return count
}

export function digitsOf(mask: number): number[] {
  const digits: number[] = []
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) digits.push(d)
  return digits
}

/** Lowest digit in a candidate mask. */
export const firstDigit = (mask: number) => 31 - Math.clz32(mask & -mask)

/** Candidates for an empty cell given the placed digits. */
export function candidatesAt(grid: readonly number[], i: number): number {
  let used = 0
  for (const p of PEERS[i]) used |= bit(grid[p])
  return ALL_DIGITS & ~used
}

/** All k-element subsets of 0..n-1, in ascending bitmask order (as Sudoku Explainer enumerates them). */
export function combinations(k: number, n: number): number[][] {
  const out: number[][] = []
  for (let mask = 0; mask < 1 << n; mask++) {
    if (popcount(mask) !== k) continue
    const combo: number[] = []
    for (let b = 0; b < n; b++) if (mask & (1 << b)) combo.push(b)
    out.push(combo)
  }
  return out
}
