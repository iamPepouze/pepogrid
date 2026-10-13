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

  it('starts empty and invalid until a game is created', () => {
    const game = useGameStore()
    expect(game.isValid()).toBe(false)
    game.newGame('easy')
    expect(game.isValid()).toBe(true)
  })

  it('records a completed game with full stats', () => {
    const game = useGameStore()
    const results = useResultsStore()
    game.newGame('easy')
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
    expect(Date.parse(r.endedAt)).toBeGreaterThanOrEqual(Date.parse(r.startedAt))
  })

  it('records an abandoned game with progress when starting a new one', () => {
    const game = useGameStore()
    const results = useResultsStore()
    game.newGame('medium')
    const empties = game.puzzle.filter((v) => v === 0).length
    const i = firstEmpty(game)
    game.select(i)
    game.input(game.solution[i])
    game.newGame('hard')

    expect(results.results).toHaveLength(1)
    const r = results.results[0]
    expect(r.outcome).toBe('abandoned')
    expect(r.difficulty).toBe('medium')
    expect(r.progress).toBe(Math.round(100 / empties))
    expect(r.finalBoard[i]).toBe(String(r.solution[i]))
  })

  it('counts notes as progress but not untouched games', () => {
    const game = useGameStore()
    const results = useResultsStore()
    game.newGame('easy')
    game.newGame('easy')
    expect(results.results).toHaveLength(0)

    game.select(firstEmpty(game))
    game.toggleNote(5)
    game.newGame('easy')
    expect(results.results).toHaveLength(1)
    expect(results.results[0].progress).toBe(0)
  })

  it('does not record twice after completion', () => {
    const game = useGameStore()
    const results = useResultsStore()
    game.newGame('easy')
    solve(game)
    game.newGame('easy')
    expect(results.results).toHaveLength(1)
  })
})

describe('results store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps only the 1000 most recent results', () => {
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
    }
    for (let n = 0; n < 1005; n++) results.record({ ...base, mistakes: n })
    expect(results.results).toHaveLength(1000)
    expect(results.results[0].mistakes).toBe(5)
    expect(results.results[999].mistakes).toBe(1004)
  })
})
