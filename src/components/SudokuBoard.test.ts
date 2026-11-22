// @vitest-environment happy-dom
import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bit } from '../lib/grid'
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
    expect(cell(given).attributes('aria-label')).toBe(`Ligne ${rowOf(given) + 1}, colonne ${colOf(given) + 1} : ${game.puzzle[given]} (donné)`)
    expect(cell(empty).attributes('aria-label')).toBe(`Ligne ${rowOf(empty) + 1}, colonne ${colOf(empty) + 1} : vide`)

    game.select(empty)
    game.input(game.solution[empty] % 9 + 1)
    await board.vm.$nextTick()
    expect(cell(empty).attributes('aria-label')).toMatch(/\u00a0: \d, incorrect$/)

    useSettingsStore().language = 'de'
    await board.vm.$nextTick()
    expect(cell(given).attributes('aria-label')).toBe(`Zeile ${rowOf(given) + 1}, Spalte ${colOf(given) + 1}: ${game.puzzle[given]} (Vorgabe)`)
    expect(cell(empty).attributes('aria-label')).toMatch(/: \d, falsch$/)
  })

  it('marks only wrong digits, and drops the mark when the digit stops being wrong', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mountBoard()
    const cell = (i: number) => board.findAll('.cell')[i]
    const given = game.puzzle.findIndex((v) => v !== 0)
    const empty = game.puzzle.findIndex((v) => v === 0)

    game.select(empty)
    game.input(game.solution[empty])
    await board.vm.$nextTick()
    expect(cell(given).classes()).not.toContain('wrong')
    expect(cell(empty).classes()).not.toContain('wrong')

    // The next digit round from the solution's is never the solution's.
    game.input(game.solution[empty] % 9 + 1)
    await board.vm.$nextTick()
    expect(cell(empty).classes()).toContain('wrong')

    game.erase()
    await board.vm.$nextTick()
    expect(cell(empty).classes()).not.toContain('wrong')

    game.undo()
    await board.vm.$nextTick()
    expect(cell(empty).classes()).toContain('wrong')

    game.undo()
    await board.vm.$nextTick()
    expect(cell(empty).classes()).not.toContain('wrong')
  })

  it('exposes nine rows of nine gridcells', async () => {
    await useGameStore().newGame('easy')
    const board = mountBoard()
    const rows = board.findAll('[role=grid] > [role=row]')

    expect(rows).toHaveLength(9)
    for (const row of rows) expect(row.findAll('[role=gridcell]')).toHaveLength(9)
    expect(board.findAll('[role=gridcell]')).toHaveLength(81)
  })

  it('has one Tab stop: the selected cell, or row 1, column 1 with none', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    game.selected = null
    const board = mountBoard()
    const stops = () => board.findAll('.cell').flatMap((c, i) => (c.attributes('tabindex') === '0' ? [i] : []))

    expect(stops()).toEqual([0])
    game.select(30)
    await board.vm.$nextTick()
    expect(stops()).toEqual([30])
  })

  it('moves focus with the selection while a cell has focus, and selects a cell that takes focus', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mount(SudokuBoard, { global: { plugins: [pinia] }, attachTo: document.body })
    const cell = (i: number) => board.findAll('.cell')[i]

    await cell(40).trigger('focus')
    expect(game.selected).toBe(40)

    ;(cell(40).element as HTMLElement).focus()
    game.move(0, 1)
    await board.vm.$nextTick()
    expect(document.activeElement).toBe(cell(41).element)

    await cell(3).trigger('click')
    expect(game.selected).toBe(3)
    expect(document.activeElement).toBe(cell(3).element)
  })

  it('moves focus from a cell to the board when the selection clears', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const board = mount(SudokuBoard, { global: { plugins: [pinia] }, attachTo: document.body })

    await board.findAll('.cell')[40].trigger('click')
    game.selected = null
    await board.vm.$nextTick()
    expect(document.activeElement).toBe(board.find('[role=grid]').element)
  })

  it('moves focus from the board onto the cell the selection moves to', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    game.selected = null
    const board = mount(SudokuBoard, { global: { plugins: [pinia] }, attachTo: document.body })

    ;(board.vm as unknown as { focus: () => void }).focus()
    game.move(0, 1)
    await board.vm.$nextTick()
    // With no selection, move starts from the centre cell (40), so one step right lands on 41.
    expect(document.activeElement).toBe(board.findAll('.cell')[41].element)
  })

  it('leaves focus where it is when the selection moves from elsewhere', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const outside = document.createElement('button')
    document.body.append(outside)
    const board = mount(SudokuBoard, { global: { plugins: [pinia] }, attachTo: document.body })

    outside.focus()
    game.move(1, 0)
    await board.vm.$nextTick()
    expect(document.activeElement).toBe(outside)
    outside.remove()
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

  it('marks the notes of the selected digit, unless matching numbers are not highlighted', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const given = game.puzzle.findIndex((v) => v !== 0)
    const d = game.puzzle[given]
    const [empty, without] = game.puzzle.flatMap((v, i) => (v === 0 ? [i] : []))
    game.notes[empty] = bit(d) | bit((d % 9) + 1)
    game.notes[without] = bit((d % 9) + 1)
    game.select(given)
    const board = mountBoard()
    const marked = () => board.findAll('.note-match').map((n) => n.text())

    // Only the note that is written is marked: a cell without it shows no square in its spot.
    expect(marked()).toEqual([String(d)])

    useSettingsStore().highlightMatching = false
    await board.vm.$nextTick()
    expect(marked()).toEqual([])
  })
})
