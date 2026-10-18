import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, toRaw } from 'vue'
import { positionOf } from '../lib/lessons'
import { PEERS, ROWS, bit, digitsOf, rowOf, solve as solutionOf, unitsOf } from '../lib/sudoku'
import { useGameStore } from './game'
import { useResultsStore } from './results'
import { crossingColumn, fill, nonGivensOf, place, quietRow, type Game } from './testing'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const firstNonGiven = (game: Game) => game.puzzle.findIndex((v) => v === 0)

function solve(game: Game) {
  game.puzzle.forEach((v, i) => {
    if (!v) place(game, [i], game.solution[i])
  })
}

/** Stands in for localStorage, which these Node tests lack. */
const storage = new Map<string, string>()
const storageLike = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value) }

/** A fresh app start: a new Pinia that saves and loads the game as main.ts does, from `storage`. */
function reload() {
  const pinia = createPinia().use(createPersistedState({ key: (id) => `pepogrid.${id}`, storage: storageLike }))
  // Pinia only applies plugins once it is installed in an app.
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useGameStore()
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

  it('keeps the technique-family rotation history when the results are cleared', async () => {
    const game = useGameStore()
    await game.newGame('hard')
    const rotation = structuredClone(toRaw(game.familyPlayed))
    expect(Object.keys(rotation.hard)).toHaveLength(1)

    const results = useResultsStore()
    results.clear()
    expect(results.results).toEqual([])
    expect(game.familyPlayed).toEqual(rotation)
  })

  it('records a completed game with full stats', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    const i = firstNonGiven(game)
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
    const i = firstNonGiven(game)
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

  it('counts a placed digit as progress, but not notes alone, written or filled', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    game.select(firstNonGiven(game))
    game.toggleNote(5)
    game.fillNotes()
    await game.newGame('easy')
    expect(results.results).toHaveLength(0)

    const i = firstNonGiven(game)
    place(game, [i], (game.solution[i] % 9) + 1) // a mistake still counts
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

describe('key technique', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts each game unrevealed, and stays revealed once revealed until the next game', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    expect(game.keyTechniqueRevealed).toBe(false)

    game.revealKeyTechnique()
    expect(game.keyTechniqueRevealed).toBe(true)
    await game.newGame('easy')
    expect(game.keyTechniqueRevealed).toBe(false)
  })

  it('records on a solved result whether the key technique was revealed', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    solve(game)
    await game.newGame('easy')
    game.revealKeyTechnique()
    solve(game)

    expect(results.results.map((r) => r.keyTechniqueRevealed)).toEqual([false, true])
  })

  it('records on an abandoned result that the key technique was revealed', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('medium')
    game.revealKeyTechnique()
    fill(game, [firstNonGiven(game)])
    await game.newGame('medium')

    expect(results.results[0].outcome).toBe('abandoned')
    expect(results.results[0].keyTechniqueRevealed).toBe(true)
  })

  describe('across a reload', () => {
    beforeEach(() => storage.clear())

    it('keeps the reveal', async () => {
      const game = reload()
      await game.newGame('easy')
      game.revealKeyTechnique()
      await nextTick()

      const resumed = reload()
      expect(resumed.isValid()).toBe(true)
      expect(resumed.keyTechniqueRevealed).toBe(true)
    })

    it('resumes a save from before the key technique as unrevealed', async () => {
      const game = reload()
      await game.newGame('easy')
      await nextTick()
      const { keyTechniqueRevealed, ...older } = JSON.parse(storage.get('pepogrid.game')!)
      expect(keyTechniqueRevealed).toBe(false)
      storage.set('pepogrid.game', JSON.stringify(older))

      const resumed = reload()
      expect(resumed.isValid()).toBe(true)
      expect(resumed.keyTechniqueRevealed).toBe(false)
    })
  })

  it('rejects a save whose reveal is not true or false', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    game.$patch({ keyTechniqueRevealed: 'yes' as unknown as boolean })
    expect(game.isValid()).toBe(false)
  })
})

describe('next step', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('counts each next step shown and returns its technique, until the next game', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    expect(game.nextStepsShown).toBe(0)

    expect(game.showNextStep()).toEqual({ kind: 'technique', technique: 'Hidden Single' })
    game.showNextStep()
    expect(game.nextStepsShown).toBe(2)
    await game.newGame('easy')
    expect(game.nextStepsShown).toBe(0)
  })

  it('takes the player’s digits and notes into account', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    // The Naked Pair lesson's position: without its notes, Pointing would come first.
    const { puzzle, values, candidates } = positionOf('naked-pair')
    const givens = [...puzzle].map(Number)
    game.$patch({ puzzle: givens, solution: solutionOf(givens)!, values, notes: candidates })
    expect(game.showNextStep()).toEqual({ kind: 'technique', technique: 'Naked Pair' })
  })

  it('says the grid has a mistake when a placed digit is wrong', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const i = game.puzzle.indexOf(0)
    place(game, [i], (game.solution[i] % 9) + 1)
    expect(game.showNextStep()).toEqual({ kind: 'mistake' })
    expect(game.nextStepsShown).toBe(1)
  })

  it('records on a solved or abandoned result how many next steps were shown', async () => {
    const game = useGameStore()
    const results = useResultsStore()
    await game.newGame('easy')
    solve(game)
    await game.newGame('easy')
    game.showNextStep()
    game.showNextStep()
    fill(game, [firstNonGiven(game)])
    await game.newGame('easy')

    expect(results.results.map((r) => r.nextStepsShown)).toEqual([0, 2])
  })

  describe('across a reload', () => {
    beforeEach(() => storage.clear())

    it('keeps the count', async () => {
      const game = reload()
      await game.newGame('easy')
      game.showNextStep()
      await nextTick()

      const resumed = reload()
      expect(resumed.isValid()).toBe(true)
      expect(resumed.nextStepsShown).toBe(1)
    })

    it('resumes a save from before the next step with none shown', async () => {
      const game = reload()
      await game.newGame('easy')
      await nextTick()
      const { nextStepsShown, ...older } = JSON.parse(storage.get('pepogrid.game')!)
      expect(nextStepsShown).toBe(0)
      storage.set('pepogrid.game', JSON.stringify(older))

      const resumed = reload()
      expect(resumed.isValid()).toBe(true)
      expect(resumed.nextStepsShown).toBe(0)
    })
  })

  it('rejects a save whose count is not a whole number', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    game.$patch({ nextStepsShown: 1.5 })
    expect(game.isValid()).toBe(false)
  })
})

/** Non-given cells whose solution is digit `d`: the ones the player must fill with it. */
const nonGivensOfDigit = (game: Game, d: number) =>
  game.solution.flatMap((v, i) => (v === d && game.puzzle[i] === 0 ? [i] : []))

/** A digit whose cells each keep, in their row, column and box, an empty cell needing another digit, so placing it completes no unit. */
function quietDigit(game: Game) {
  const d = DIGITS.find((d) =>
    nonGivensOfDigit(game, d).every((i) =>
      unitsOf(i).every((u) => u.some((j) => game.puzzle[j] === 0 && game.solution[j] !== d)),
    ),
  )
  if (!d) throw new Error('no quiet digit in this puzzle')
  return d
}

describe('complete digits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('completes a digit once all nine of its solution cells hold it', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = quietDigit(game)
    const cells = nonGivensOfDigit(game, d)
    place(game, cells.slice(0, -1), d)
    expect(game.completeDigits.has(d)).toBe(false)
    place(game, cells.slice(-1), d)
    expect(game.completeDigits.has(d)).toBe(true)
  })

  it('ignores wrong copies: they neither complete a digit nor undo it', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = quietDigit(game)
    const cells = nonGivensOfDigit(game, d)
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
    const d = quietDigit(game)
    const cells = nonGivensOfDigit(game, d)
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
    const d = quietDigit(game)
    place(game, nonGivensOfDigit(game, d), d)
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

  it('clears stray notes of a digit once it is complete, and undo restores them', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = quietDigit(game)
    const cells = nonGivensOfDigit(game, d)
    const last = cells[cells.length - 1]
    place(game, cells.slice(0, -1), d)
    // A note out of reach of the last placement's own peer clearing.
    const stray = game.values.findIndex((v, i) => v === 0 && i !== last && !PEERS[last].includes(i))
    game.select(stray)
    game.toggleNote(d)
    place(game, [last], d)
    expect(game.notes[stray] & bit(d)).toBe(0)
    game.undo()
    expect(game.notes[stray] & bit(d)).not.toBe(0)
  })

  it('signals a newly complete digit only when a placement completes it', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = quietDigit(game)
    const cells = nonGivensOfDigit(game, d)
    place(game, cells.slice(0, -1), d)
    expect(game.newlyComplete).toBeNull()
    place(game, cells.slice(-1), d)
    const signal = game.newlyComplete
    expect(signal?.cell).toBe(cells[cells.length - 1])

    game.erase()
    game.undo() // complete again, but not by a placement
    expect(game.newlyComplete).toBeNull()

    game.erase()
    game.input(d) // placed again: signalled anew
    expect(game.newlyComplete).not.toBe(signal)
    expect(game.newlyComplete?.cell).toBe(cells[cells.length - 1])
  })

  it("names the digit's nine cells to glow, leaving out a wrong copy", async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const d = quietDigit(game)
    const wrong = game.puzzle.findIndex((v, i) => v === 0 && game.solution[i] !== d)
    place(game, [wrong], d)
    place(game, nonGivensOfDigit(game, d), d)
    const cells = game.newlyComplete?.cells ?? []
    expect(cells).toHaveLength(9)
    expect(cells).not.toContain(wrong)
    expect(cells.every((i) => game.solution[i] === d)).toBe(true)
  })
})

describe('complete units', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('locks a unit once all nine of its cells match the solution', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const empties = quietRow(game)
    fill(game, empties.slice(0, -1))
    expect(empties.some(game.isLocked)).toBe(false)
    fill(game, empties.slice(-1))
    expect(empties.every(game.isLocked)).toBe(true)
  })

  it('leaves a full unit with a mistake in it unlocked', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const empties = quietRow(game)
    const last = empties[empties.length - 1]
    fill(game, empties.slice(0, -1))
    place(game, [last], (game.solution[last] % 9) + 1)
    expect(empties.some(game.isLocked)).toBe(false)
  })

  it('ignores input and erase on a locked cell, until undo reopens the unit', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const empties = quietRow(game)
    fill(game, empties)
    const [first] = empties
    const digit = game.solution[first]
    game.select(first)
    game.erase()
    game.input((digit % 9) + 1)
    expect(game.values[first]).toBe(digit)
    expect(game.mistakes).toBe(0)

    game.undo() // takes back the placement that completed the row
    expect(empties.some(game.isLocked)).toBe(false)
    game.select(first)
    game.erase()
    expect(game.values[first]).toBe(0)
  })

  it("signals the unit's nine cells to glow from the placement that completed it", async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const empties = quietRow(game)
    const last = empties[empties.length - 1]
    fill(game, empties.slice(0, -1))
    expect(game.newlyComplete).toBeNull()
    fill(game, [last])
    expect(game.newlyComplete?.cell).toBe(last)
    expect([...(game.newlyComplete?.cells ?? [])].sort((a, b) => a - b)).toEqual(ROWS[rowOf(last)])
  })

  it('merges every unit and digit one placement completes into one glow', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const empties = nonGivensOf(game, game.puzzle.map((_, i) => i))
    const last = empties[empties.length - 1]
    fill(game, empties.slice(0, -1))
    fill(game, [last])
    // Its row, column and box (21 cells) and the digit's 8 other cells.
    const cells = game.newlyComplete?.cells ?? []
    expect(new Set(cells).size).toBe(cells.length)
    expect(cells).toHaveLength(29)
    expect(cells).toEqual(expect.arrayContaining(unitsOf(last).flat()))
  })

  it('stops the glow on undo', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    fill(game, quietRow(game))
    expect(game.newlyComplete).not.toBeNull()
    game.undo()
    expect(game.newlyComplete).toBeNull()
  })

  it('names as newly locked only the placed digits that were not locked before', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const row = quietRow(game)
    fill(game, row)
    expect([...(game.newlyComplete?.locked ?? [])].sort((a, b) => a - b)).toEqual(row)

    // Complete the column through the row's first cell: that cell glows again but was already locked.
    const column = crossingColumn(game, row)
    fill(game, column)
    expect(game.newlyComplete?.cells).toContain(row[0])
    expect(game.newlyComplete?.locked).toContain(column[column.length - 1])
    expect(game.newlyComplete?.locked.some((i) => row.includes(i))).toBe(false)
  })
})

/**
 * A wrong digit for empty cell `i`, and an empty peer `j` that only this mistake keeps from
 * having it as a candidate, since no other peer of `j` holds it.
 */
function isolatedMistake(game: Game) {
  for (const i of nonGivensOf(game, game.values.map((_, k) => k))) {
    for (const wrong of DIGITS.filter((d) => d !== game.solution[i])) {
      const j = PEERS[i].find((p) => game.values[p] === 0 && !PEERS[p].some((q) => game.values[q] === wrong))
      if (j !== undefined) return { i, wrong, j }
    }
  }
  throw new Error('no isolated mistake in this puzzle')
}

describe('fill notes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('notes in each empty cell exactly the digits none of its peers holds, and its solution digit', async () => {
    const game = useGameStore()
    await game.newGame('medium')
    game.fillNotes()

    game.values.forEach((v, i) => {
      if (v) return expect(game.notes[i]).toBe(0)
      const held = new Set(PEERS[i].map((p) => game.values[p]))
      expect(digitsOf(game.notes[i])).toEqual(DIGITS.filter((d) => !held.has(d)))
      expect(digitsOf(game.notes[i])).toContain(game.solution[i])
    })
  })

  it('treats a mistake like any placed digit', async () => {
    const game = useGameStore()
    await game.newGame('medium')
    const { i, wrong, j } = isolatedMistake(game)
    place(game, [i], wrong)
    game.fillNotes()

    expect(game.values[i]).toBe(wrong)
    expect(digitsOf(game.notes[j])).not.toContain(wrong)
  })

  it("replaces the player's notes, and one undo restores them", async () => {
    const game = useGameStore()
    await game.newGame('medium')
    const i = firstNonGiven(game)
    const held = game.values[PEERS[i].find((p) => game.values[p] !== 0)!]
    game.select(i)
    game.toggleNote(held) // a note no candidate backs
    game.toggleNote(game.solution[i])
    const written = game.notes.slice()
    game.fillNotes()

    expect(digitsOf(game.notes[i])).not.toContain(held)
    game.undo()
    expect(game.notes).toEqual(written)
  })

  it('is unavailable, and adds no undo step, when it would change no notes', async () => {
    const game = useGameStore()
    await game.newGame('medium')
    expect(game.canFillNotes).toBe(true)
    game.fillNotes()
    const steps = game.history.length

    expect(game.canFillNotes).toBe(false)
    game.fillNotes()
    expect(game.history).toHaveLength(steps)
  })

  it('is unavailable once the game is solved', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    solve(game)

    expect(game.canFillNotes).toBe(false)
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
