/** Steps shared by the game store and board tests. Test-only: the app never imports this. */
import { COLS, ROWS, colOf, rowOf, unitsOf } from '../lib/sudoku'
import type { Difficulty } from '../lib/difficulty'
import type { useGameStore } from './game'
import { useResultsStore, type GameResult, type Outcome } from './results'

export type Game = ReturnType<typeof useGameStore>

/** Selects each cell in turn and enters digit `d`. */
export function place(game: Game, cells: number[], d: number) {
  for (const i of cells) {
    game.select(i)
    game.input(d)
  }
}

/** Places the solution's digit in each of `cells`. */
export const fill = (game: Game, cells: number[]) => cells.forEach((i) => place(game, [i], game.solution[i]))

/** The cells among `cells` that are not givens: the ones the player fills. */
export const nonGivensOf = (game: Game, cells: readonly number[]) => cells.filter((i) => game.puzzle[i] === 0)

/**
 * The non-given cells of a row with two or more of them, where each one's column and box keep
 * a non-given cell outside the row, so filling them completes only the row.
 */
export function quietRow(game: Game) {
  const row = ROWS.find((r) => {
    const cells = nonGivensOf(game, r)
    return (
      cells.length >= 2 &&
      cells.every((i) => {
        const [, column, box] = unitsOf(i)
        return [column, box].every((u) => u.some((j) => game.puzzle[j] === 0 && rowOf(j) !== rowOf(i)))
      })
    )
  })
  if (!row) throw new Error('no quiet row in this puzzle')
  return nonGivensOf(game, row)
}

/** The non-given cells outside `row` of the column through its first cell: filling them completes that column across the row. */
export const crossingColumn = (game: Game, row: readonly number[]) =>
  nonGivensOf(game, COLS[colOf(row[0])]).filter((i) => !row.includes(i))

/** Stores a result as the game store would, filled in with plausible values that `fields` override. */
export function seedResult(difficulty: Difficulty, outcome: Outcome, fields: Partial<Omit<GameResult, 'id'>> = {}) {
  const grid = '0'.repeat(81)
  useResultsStore().record({
    difficulty, outcome, startedAt: '2026-10-01T10:00:00Z', endedAt: '2026-10-01T10:10:00Z', elapsed: 600, mistakes: 0,
    progress: outcome === 'completed' ? 100 : 40, puzzle: grid, solution: grid, finalBoard: grid,
    se: 2, hodokuScore: 200, hodokuLevel: 'medium', hardest: 'Hidden Single', ...fields,
  })
}
