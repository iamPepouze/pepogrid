import { describe, expect, it } from 'vitest'
import sample from './__fixtures__/rated-sample.json'
import { loadBank, pickFromBank } from './bank'
import { DIFFICULTIES, TIERS, tierOf, type HodokuLevel } from './difficulty'
import { PEERS, UNITS } from './grid'
import { rateHodoku, rateSE } from './rater'
import { countSolutions, randomSolution, solve } from './sudoku'
import { applyTransform, randomTransform } from './transform'

const toGrid = (s: string) => [...s].map(Number)

function isValidSolution(grid: number[]): boolean {
  return UNITS.every((unit) => new Set(unit.map((i) => grid[i])).size === 9 && unit.every((i) => grid[i] >= 1 && grid[i] <= 9))
}

describe('geometry', () => {
  it('gives every cell 20 peers in ascending order', () => {
    expect(PEERS.every((p) => p.length === 20 && p.every((v, k) => k === 0 || p[k - 1] < v))).toBe(true)
  })
})

describe('solver', () => {
  it('builds valid random solutions', () => {
    for (let n = 0; n < 5; n++) expect(isValidSolution(randomSolution())).toBe(true)
  })

  it('solves and counts solutions', () => {
    const puzzle = toGrid('003020600900305001001806400008102900700000008006708200002609500800203009005010300')
    const solution = solve(puzzle)!
    expect(isValidSolution(solution)).toBe(true)
    expect(puzzle.every((v, i) => v === 0 || v === solution[i])).toBe(true)
    expect(countSolutions(puzzle, 2)).toBe(1)
    expect(countSolutions(new Array(81).fill(0), 3)).toBe(3)
  })
})

/** Puzzles rated by SukakuExplainer (SE 1.2.1 mode) and HoDoKu; see scripts/bank/calibrate.ts. */
const rated = sample as { p: string; se: number; hs: number; hl: HodokuLevel }[]

describe('rater matches the reference tools', () => {
  it('has a meaningful sample', () => {
    expect(rated.length).toBeGreaterThanOrEqual(200)
  })

  it('emulates Sudoku Explainer exactly up to 4.2', () => {
    for (const { p, se } of rated) {
      expect(rateSE(toGrid(p)).se, p).toBe(se <= 4.2 ? se : null)
    }
  })

  it('agrees with HoDoKu on the level wherever it can rate', () => {
    for (const { p, hl } of rated) {
      const ours = rateHodoku(toGrid(p))
      if (ours.level !== null) expect(ours.level, p).toBe(hl)
    }
  })
})

describe('tierOf', () => {
  it('lets SE pick the tier and HoDoKu confirm it', () => {
    expect(tierOf({ se: 1.2, hodokuLevel: 'easy' })).toBe('easy')
    expect(tierOf({ se: 2.6, hodokuLevel: 'medium' })).toBe('medium')
    expect(tierOf({ se: 3.2, hodokuLevel: 'hard' })).toBe('hard')
    expect(tierOf({ se: 3.0, hodokuLevel: 'medium' })).toBeNull()
    expect(tierOf({ se: 5.6, hodokuLevel: 'unfair' })).toBe('expert')
    expect(tierOf({ se: 7.2, hodokuLevel: 'extreme' })).toBe('master')
    expect(tierOf({ se: 9.0, hodokuLevel: 'extreme' })).toBeNull()
  })
})

describe('transform', () => {
  it('keeps a puzzle valid with the transformed solution as its unique solution', () => {
    const puzzle = toGrid('003020600900305001001806400008102900700000008006708200002609500800203009005010300')
    const solution = solve(puzzle)!
    for (let n = 0; n < 20; n++) {
      const t = randomTransform()
      const tp = applyTransform(puzzle, t)
      const ts = applyTransform(solution, t)
      expect(isValidSolution(ts)).toBe(true)
      expect(tp.every((v, i) => v === 0 || v === ts[i])).toBe(true)
      expect(countSolutions(tp, 2)).toBe(1)
    }
  })
})

describe.each(DIFFICULTIES)('bank: %s', (tier) => {
  it('holds distinct valid puzzles rated inside the tier', async () => {
    const bank = await loadBank(tier)
    expect(bank.length).toBeGreaterThan(0)
    expect(new Set(bank.map((e) => e[0])).size).toBe(bank.length)
    const [min, max] = TIERS[tier].se
    for (const [p, se, score, hardest] of bank) {
      expect(p).toMatch(/^[0-9]{81}$/)
      expect(se).toBeGreaterThanOrEqual(min)
      expect(se).toBeLessThanOrEqual(max)
      expect(score).toBeGreaterThan(0)
      expect(hardest.length).toBeGreaterThan(0)
    }
    // Uniqueness of the solution, on a sample to keep the test fast.
    for (const [p] of bank.slice(0, 25)) expect(countSolutions(toGrid(p), 2)).toBe(1)
  })

  it('picks unused puzzles and starts over once all are used', async () => {
    const bank = await loadBank(tier)
    const used = bank.map((_, i) => i).slice(1)
    const pick = await pickFromBank(tier, used)
    expect(pick.index).toBe(0)
    expect(pick.restarted).toBe(false)
    expect(isValidSolution(pick.solution)).toBe(true)
    expect(pick.rating.hodokuLevel).toBe(TIERS[tier].hodoku)
    const again = await pickFromBank(tier, bank.map((_, i) => i))
    expect(again.restarted).toBe(true)
  })
})
