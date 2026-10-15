// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { BOXES, COLS, ROWS, boxOf, colOf, rowOf } from '../lib/sudoku'
import { useGameStore } from '../stores/game'
import SudokuBoard from './SudokuBoard.vue'

type Game = ReturnType<typeof useGameStore>

function fill(game: Game, cells: number[]) {
  for (const i of cells) {
    game.select(i)
    game.input(game.solution[i])
  }
}

/** An empty cell whose row, column and box each keep another empty cell. */
const openCell = (game: Game) =>
  game.puzzle.findIndex(
    (v, i) =>
      v === 0 && [ROWS[rowOf(i)], COLS[colOf(i)], BOXES[boxOf(i)]].every((u) => u.some((j) => j !== i && game.puzzle[j] === 0)),
  )

describe('SudokuBoard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows and announces digits in a complete unit as complete', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mount(SudokuBoard)
    const cell = (i: number) => board.findAll('.cell')[i]

    const open = openCell(game)
    fill(game, [open])
    await board.vm.$nextTick()
    expect(cell(open).attributes('aria-label')).not.toContain('complete')
    expect(cell(open).classes()).not.toContain('locked')

    const empties = game.puzzle.flatMap((v, i) => (v === 0 && i !== open ? [i] : []))
    fill(game, empties)
    await board.vm.$nextTick()
    expect(cell(open).attributes('aria-label')).toBe(`Row ${rowOf(open) + 1}, column ${colOf(open) + 1}: ${game.solution[open]}, complete`)
    expect(cell(open).classes()).toContain('locked')

    const given = game.puzzle.findIndex((v) => v !== 0)
    expect(cell(given).attributes('aria-label')).not.toContain('complete')
    expect(cell(given).classes()).not.toContain('locked')
  })
})
