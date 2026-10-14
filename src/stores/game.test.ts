import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './game'
import { useResultsStore } from './results'

/** Index of the first empty (non-given) cell. */
const firstEmpty = (game: ReturnType<typeof useGameStore>) => game.puzzle.findIndex((v) => v === 0)

function solve(game: ReturnType<typeof useGameStore>) {
  game.puzzle.forEach((v, i) => {
    if (v) return
    game.select(i)
    game.input(game.solution[i])
  })
}

describe('game store results', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty and invalid until a game is created', async () => {
    const game = useGameStore()
    expect(game.isValid()).toBe(false)
    await game.newGame('easy')
    expect(game.isValid()).toBe(true)
  })

  it('records a completed game with full stats', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    const i = firstEmpty(game)
    game.select(i)
    game.input((game.solution[i] % 9) + 1) // one mistake
    solve(game)

    expect(game.completed).toBe(true)
    expect(results.results).toHaveLength(1)
    const r = results.results[0]
    expect(r.outcome).toBe('completed')
    expect(r.difficulty).toBe('easy')
    expect(r.mistakes).toBe(1)
    expect(r.progress).toBe(100)
    expect(r.finalBoard).toBe(r.solution)
    expect(r.puzzle).toMatch(/^[0-9]{81}$/)
    expect(r.se).toBeGreaterThanOrEqual(1)
    expect(r.hodokuLevel).toBe('easy')
    expect(r.hardest.length).toBeGreaterThan(0)
    expect(Date.parse(r.endedAt)).toBeGreaterThanOrEqual(Date.parse(r.startedAt))
  })

  it('records an abandoned game with progress when starting a new one', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('medium')
    const empties = game.puzzle.filter((v) => v === 0).length
    const i = firstEmpty(game)
    game.select(i)
    game.input(game.solution[i])
    await game.newGame('hard')

    expect(results.results).toHaveLength(1)
    const r = results.results[0]
    expect(r.outcome).toBe('abandoned')
    expect(r.difficulty).toBe('medium')
    expect(r.progress).toBe(Math.round(100 / empties))
    expect(r.finalBoard[i]).toBe(String(r.solution[i]))
  })

  it('counts notes as progress but not untouched games', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    await game.newGame('easy')
    expect(results.results).toHaveLength(0)

    game.select(firstEmpty(game))
    game.toggleNote(5)
    await game.newGame('easy')
    expect(results.results).toHaveLength(1)
    expect(results.results[0].progress).toBe(0)
  })

  it('does not record twice after completion', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    solve(game)
    await game.newGame('easy')
    expect(results.results).toHaveLength(1)
  })
})

/** Empty cells whose solution is digit `d`. */
const cellsOf = (game: ReturnType<typeof useGameStore>, d: number) =>
  game.solution.flatMap((v, i) => (v === d && game.puzzle[i] === 0 ? [i] : []))

function place(game: ReturnType<typeof useGameStore>, cells: number[], d: number) {
  for (const i of cells) {
    game.select(i)
    game.input(d)
  }
}

describe('complete digits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('completes a digit once all nine of its solution cells hold it', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = game.solution[firstEmpty(game)]
    const cells = cellsOf(game, d)
    place(game, cells.slice(0, -1), d)
    expect(game.completeDigits.has(d)).toBe(false)
    place(game, cells.slice(-1), d)
    expect(game.completeDigits.has(d)).toBe(true)
  })

  it('ignores wrong copies: they neither complete a digit nor undo it', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = game.solution[firstEmpty(game)]
    const cells = cellsOf(game, d)
    const other = game.puzzle.findIndex((v, i) => v === 0 && game.solution[i] !== d)
    place(game, [other], d) // wrong copy
    place(game, cells.slice(0, -1), d)
    expect(game.completeDigits.has(d)).toBe(false)
    place(game, cells.slice(-1), d)
    expect(game.completeDigits.has(d)).toBe(true)
  })

  it('stops being complete after erase or undo', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = game.solution[firstEmpty(game)]
    const cells = cellsOf(game, d)
    place(game, cells, d)
    game.erase()
    expect(game.completeDigits.has(d)).toBe(false)
    game.undo()
    expect(game.completeDigits.has(d)).toBe(true)
    game.undo()
    expect(game.completeDigits.has(d)).toBe(false)
  })

  it('ignores input of a complete digit, as a value or a note', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = game.solution[firstEmpty(game)]
    place(game, cellsOf(game, d), d)
    const other = game.puzzle.findIndex((v, i) => v === 0 && game.values[i] === 0)
    game.select(other)
    game.input(d)
    expect(game.values[other]).toBe(0)
    expect(game.mistakes).toBe(0)
    game.toggleNote(d) // Shift + digit, or long-press
    expect(game.notes[other]).toBe(0)
    game.toggleNotesMode()
    game.input(d)
    expect(game.notes[other]).toBe(0)
  })

  it('signals a completion only when a placement completes the digit', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = game.solution[firstEmpty(game)]
    const cells = cellsOf(game, d)
    place(game, cells.slice(0, -1), d)
    expect(game.lastCompletion).toBeNull()
    place(game, cells.slice(-1), d)
    const signal = game.lastCompletion
    expect(signal?.digit).toBe(d)

    game.erase()
    game.undo() // complete again, but not by a placement
    expect(game.lastCompletion).toBe(signal)

    game.erase()
    game.input(d) // placed again: a new completion
    expect(game.lastCompletion).not.toBe(signal)
    expect(game.lastCompletion?.digit).toBe(d)
  })
})

describe('game store bank usage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('stores the rating and does not repeat bank puzzles', async () => {
    const game = useGameStore()
    await game.newGame('master', { recordAbandoned: false })
    expect(game.rating?.hodokuLevel).toBe('extreme')
    await game.newGame('master', { recordAbandoned: false })
    expect(new Set(game.bankUsed.master).size).toBe(2)
  })

  it('rotates through every family before repeating one', async () => {
    const game = useGameStore()
    const seen: string[] = []
    for (let n = 0; n < 3; n++) {
      await game.newGame('hard', { recordAbandoned: false })
      seen.push(Object.entries(game.familyPlayed.hard).sort((a, b) => b[1] - a[1])[0][0])
    }
    expect(new Set(seen).size).toBe(3)
  })

  it('ignores a second start while one is loading', async () => {
    const game = useGameStore()
    const first = game.newGame('hard', { recordAbandoned: false })
    const second = game.newGame('expert', { recordAbandoned: false })
    await Promise.all([first, second])
    expect(game.difficulty).toBe('hard')
  })
})

describe('results store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps only the 1000 most recent results', async () => {
    const results = useResultsStore()
    const base = {
      difficulty: 'easy' as const,
      outcome: 'completed' as const,
      startedAt: '',
      endedAt: '',
      elapsed: 0,
      progress: 100,
      puzzle: '',
      solution: '',
      finalBoard: '',
      se: 1.2,
      hodokuScore: 200,
      hodokuLevel: 'easy' as const,
      hardest: 'Hidden Single',
    }
    for (let n = 0; n < 1005; n++) results.record({ ...base, mistakes: n })
    expect(results.results).toHaveLength(1000)
    expect(results.results[0].mistakes).toBe(5)
    expect(results.results[999].mistakes).toBe(1004)
  })
})
