// @vitest-environment happy-dom
import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { colOf, rowOf } from '../lib/sudoku'
import { useGameStore } from '../stores/game'
import { useSettingsStore } from '../stores/settings'
import { crossingColumn, fill, quietRow } from '../stores/testing'
import SudokuBoard from './SudokuBoard.vue'

/** Lets the board schedule a new glow, then waits a frame for it to start and render. */
async function waveStarted(board: VueWrapper) {
  await board.vm.$nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
  await board.vm.$nextTick()
}

enableAutoUnmount(afterEach)

describe('SudokuBoard', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  /** The board, on this test's store. */
  const mountBoard = () => mount(SudokuBoard, { global: { plugins: [pinia] } })

  it('names each cell to a screen reader in the chosen language', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    useSettingsStore().language = 'fr'
    const board = mountBoard()
    const cell = (i: number) => board.findAll('.cell')[i]
    const given = game.puzzle.findIndex((v) => v !== 0)
    const empty = game.puzzle.findIndex((v) => v === 0)

    expect(board.find('[role=grid]').attributes('aria-label')).toBe('Grille de sudoku')
    expect(cell(given).attributes('aria-label')).toBe(`Ligne ${rowOf(given) + 1}, colonne ${colOf(given) + 1} : ${game.puzzle[given]} (donné)`)
    expect(cell(empty).attributes('aria-label')).toBe(`Ligne ${rowOf(empty) + 1}, colonne ${colOf(empty) + 1} : vide`)

    game.select(empty)
    game.input(game.solution[empty] % 9 + 1)
    await board.vm.$nextTick()
    expect(cell(empty).attributes('aria-label')).toMatch(/ : \d, incorrect$/)

    useSettingsStore().language = 'de'
    await board.vm.$nextTick()
    expect(cell(given).attributes('aria-label')).toBe(`Zeile ${rowOf(given) + 1}, Spalte ${colOf(given) + 1}: ${game.puzzle[given]} (Vorgabe)`)
    expect(cell(empty).attributes('aria-label')).toMatch(/: \d, falsch$/)
  })

  it('shows and announces digits in a complete unit as complete', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mountBoard()
    const cell = (i: number) => board.findAll('.cell')[i]
    const row = quietRow(game)
    const [first] = row

    fill(game, row.slice(0, -1))
    await board.vm.$nextTick()
    expect(cell(first).attributes('aria-label')).not.toContain('complete')
    expect(cell(first).classes()).not.toContain('locked')

    fill(game, row.slice(-1))
    await board.vm.$nextTick()
    expect(cell(first).attributes('aria-label')).toBe(`Row ${rowOf(first) + 1}, column ${colOf(first) + 1}: ${game.solution[first]}, complete`)
    expect(cell(first).classes()).toContain('locked')

    const given = game.puzzle.findIndex((v) => v !== 0)
    expect(cell(given).attributes('aria-label')).not.toContain('complete')
    expect(cell(given).classes()).not.toContain('locked')
  })

  it('recolors only the digits a placement locked, not ones locked before that its glow covers', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mountBoard()
    const cell = (i: number) => board.findAll('.cell')[i]
    const row = quietRow(game)
    fill(game, row)
    const column = crossingColumn(game, row)
    const last = column[column.length - 1]
    fill(game, column)

    // The frame before the wave starts: only the newly locked digit holds its old color.
    await board.vm.$nextTick()
    expect(cell(last).classes()).toContain('pending')
    expect(cell(row[0]).classes()).not.toContain('pending')

    await waveStarted(board)
    expect(cell(row[0]).classes()).toContain('glow')
    expect(cell(last).classes()).toContain('settling')
    expect(cell(row[0]).classes()).not.toContain('settling')
  })

  it('stops the glow when an undo breaks the unit', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mountBoard()
    const cell = (i: number) => board.findAll('.cell')[i]
    const row = quietRow(game)
    fill(game, row)
    await waveStarted(board)
    expect(cell(row[0]).classes()).toContain('settling')

    game.undo()
    await board.vm.$nextTick()
    expect(cell(row[0]).classes()).not.toContain('locked')
    expect(cell(row[0]).classes()).not.toContain('settling')
    expect(cell(row[0]).classes()).not.toContain('glow')
  })

  it('leaves nothing scheduled after an undo in the frame before the glow starts', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mountBoard()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    try {
      fill(game, quietRow(game))
      await board.vm.$nextTick() // the glow's start is now queued for the next frame
      game.undo()
      await board.vm.$nextTick()
      vi.advanceTimersToNextFrame()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
