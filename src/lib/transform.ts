import { shuffle } from './sudoku'

/** A random validity-preserving transform: relabel digits, permute bands/rows and stacks/columns, maybe transpose. */
export interface Transform {
  digits: number[]
  rows: number[]
  cols: number[]
  transpose: boolean
}

/** A permutation of 0..8 that keeps the three bands (or stacks) intact. */
function bandPermutation(): number[] {
  return shuffle([0, 1, 2]).flatMap((band) => shuffle([0, 1, 2]).map((k) => band * 3 + k))
}

export function randomTransform(): Transform {
  return {
    digits: [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])],
    rows: bandPermutation(),
    cols: bandPermutation(),
    transpose: Math.random() < 0.5,
  }
}

/** Applies `t` to a grid; the result has the same solving logic (and ratings) as the original. */
export function applyTransform(grid: readonly number[], t: Transform): number[] {
  const out = new Array<number>(81)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const [sr, sc] = t.transpose ? [t.cols[c], t.rows[r]] : [t.rows[r], t.cols[c]]
      out[r * 9 + c] = t.digits[grid[sr * 9 + sc]]
    }
  }
  return out
}
