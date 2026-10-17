import { beforeEach, describe, expect, it } from 'vitest'
import sample from './__fixtures__/rated-sample.json'
import { loadBank, pickFromBank } from './bank'
import { DIFFICULTIES, TIERS, familyOf, techniqueFamily, tierOf, type Difficulty, type HodokuLevel } from './difficulty'
import { PEERS, UNITS, bit } from './grid'
import { LESSONS, gridAt, lessonFor, positionOf } from './lessons'
import { rateHodoku, rateSE } from './rater'
import { capReached, countsOf, formatDuration, statisticsOf, type StatResult } from './statistics'
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

describe('technique families', () => {
  it('maps every bank technique to a known family', async () => {
    for (const tier of DIFFICULTIES) {
      for (const [, , , hardest] of await loadBank(tier)) expect(familyOf(tier, hardest), `${tier}: ${hardest}`).not.toBe('Other')
    }
  })

  it('groups techniques as agreed', () => {
    expect(familyOf('medium', 'Direct Hidden Triplet')).toBe('Hidden subsets')
    expect(familyOf('medium', 'Direct Pointing')).toBe('Intersections')
    expect(familyOf('hard', 'XY-Wing')).toBe('Wings')
    expect(familyOf('hard', 'Swordfish')).toBe('Fish')
    expect(familyOf('hard', 'Hidden Pair')).toBe('Subsets')
    expect(familyOf('expert', 'Unique Loop 6 type 1')).toBe('Uniqueness')
    expect(familyOf('expert', 'XYZ-Wing')).toBe('Wings & subsets')
    expect(familyOf('expert', 'Naked Quad')).toBe('Wings & subsets')
    expect(familyOf('master', 'Forcing X-Chain')).toBe('Forcing chains')
    expect(familyOf('master', 'Turbot Fish')).toBe('Cycles')
    expect(familyOf('master', 'Aligned Triplet Exclusion')).toBe('Exclusion')
  })

  it('keeps a technique’s own family apart from the Expert merge used for rotation', () => {
    expect(techniqueFamily('XYZ-Wing')).toBe('Wings')
    expect(techniqueFamily('Naked Quad')).toBe('Subsets')
    expect(techniqueFamily('X-Wing')).toBe('Fish')
  })
})

describe('key technique lessons', () => {
  it('gives every technique in the Easy bank a lesson section with an example', async () => {
    for (const [, , , hardest] of await loadBank('easy')) {
      const found = lessonFor(hardest)
      expect(found?.section.examples.length, hardest).toBeGreaterThan(0)
      expect(found?.lesson.family).toBe(techniqueFamily(hardest))
    }
  })

  it('has no lesson for a technique not written up yet', () => {
    expect(lessonFor('Forcing Chain')).toBeNull()
  })

  it('keeps every example step consistent with its puzzle’s solution', () => {
    for (const lesson of LESSONS) {
      for (const section of lesson.sections) {
        for (const example of section.examples) {
          const position = positionOf(example)
          const where = `${section.title}, ${example.position}`
          expect(section.techniques, where).toContain(position.technique)
          const solution = solve([...position.puzzle].map(Number))!
          expect(solution, where).not.toBeNull()
          position.values.forEach((v, i) => {
            if (v) expect(v, `${where}: cell ${i}`).toBe(solution[i])
            else expect(position.candidates[i] & bit(solution[i]), `${where}: cell ${i} lacks its solution digit`).not.toBe(0)
          })
          example.steps.forEach((step, k) => {
            // Each step is checked against the grid it is drawn on: earlier steps' effects applied.
            const grid = gridAt(example, k)
            const at = `${where}, step ${k + 1}`
            const candidates = [...(step.marks ?? []), ...(step.eliminations ?? []), ...(step.placement ? [step.placement] : [])]
            const cells = [...step.focus, ...(step.highlight ?? []), ...candidates.map(([i]) => i)]
            expect(cells.every((i) => Number.isInteger(i) && i >= 0 && i < 81), `${at}: a cell outside the grid`).toBe(true)
            for (const [i, d] of candidates) expect(grid[i].candidates & bit(d), `${at}: ${d} is no candidate of cell ${i}`).not.toBe(0)
            for (const [i, d] of step.eliminations ?? []) expect(d, `${at}: eliminates the solution at ${i}`).not.toBe(solution[i])
            if (step.placement) expect(step.placement[1], `${at}: places a wrong digit`).toBe(solution[step.placement[0]])
          })
        }
      }
    }
  })
})

describe('family rotation', () => {
  const families = async (tier: (typeof DIFFICULTIES)[number]) => [...new Set((await loadBank(tier)).map((e) => familyOf(tier, e[3])))]

  it('picks from the family played least recently', async () => {
    const all = await families('master')
    expect(all.length).toBeGreaterThan(1)
    const [stale, ...recent] = all
    const played = Object.fromEntries([[stale, 1], ...recent.map((f, k) => [f, 100 + k])])
    for (let n = 0; n < 10; n++) expect((await pickFromBank('master', [], played)).family).toBe(stale)
  })

  it('skips a family with no unused puzzles left', async () => {
    const bank = await loadBank('hard')
    const fish = bank.flatMap((e, i) => (familyOf('hard', e[3]) === 'Fish' ? [i] : []))
    const pick = await pickFromBank('hard', fish, { Fish: 0, Wings: 5, Subsets: 5 })
    expect(pick.family).not.toBe('Fish')
  })

  it('does not rotate Easy', () => {
    expect(TIERS.easy.rotate).toBe(false)
  })
})

describe('statistics', () => {
  /** End times one minute apart, in the order each test builds its results. */
  let minute = 0
  beforeEach(() => {
    minute = 0
  })
  const nextEnd = () => new Date(Date.UTC(2026, 9, 1) + minute++ * 60_000).toISOString()
  const result = (difficulty: Difficulty, outcome: StatResult['outcome'], fields: Partial<StatResult>): StatResult => ({
    difficulty, outcome, endedAt: nextEnd(), elapsed: 600, mistakes: 0, progress: outcome === 'completed' ? 100 : 40,
    se: 2, hodokuScore: 200, hardest: 'Hidden Single', ...fields,
  })
  const solved = (difficulty: Difficulty, fields: Partial<StatResult> = {}) => result(difficulty, 'completed', fields)
  const abandoned = (difficulty: Difficulty, fields: Partial<StatResult> = {}) => result(difficulty, 'abandoned', fields)

  it('counts played, solved and abandoned results and the solve rate at one difficulty', () => {
    const results = [solved('hard'), abandoned('hard'), solved('hard'), solved('easy'), solved('hard')]
    expect(countsOf(results, 'hard')).toEqual({ played: 4, solved: 3, abandoned: 1, solveRate: 0.75 })
  })

  it('counts across every difficulty when none is given', () => {
    expect(countsOf([solved('easy'), abandoned('master'), solved('medium'), abandoned('easy')])).toEqual({ played: 4, solved: 2, abandoned: 2, solveRate: 0.5 })
  })

  it('has no solve rate without results', () => {
    expect(countsOf([solved('easy')], 'master')).toEqual({ played: 0, solved: 0, abandoned: 0, solveRate: null })
  })

  it('times and counts mistakes over solved results only', () => {
    const results = [
      solved('hard', { elapsed: 300, mistakes: 2 }),
      abandoned('hard', { elapsed: 100, mistakes: 5 }),
      solved('hard', { elapsed: 500, mistakes: 0 }),
      solved('easy', { elapsed: 50, mistakes: 0 }),
    ]
    expect(statisticsOf(results, 'hard')).toMatchObject({ bestTime: 300, averageTime: 400, averageMistakes: 1, flawless: 1 })
  })

  it('rates over solved results only, on any difficulty', () => {
    const results = [
      solved('easy', { se: 1.2, hodokuScore: 100 }),
      abandoned('easy', { se: 1.5, hodokuScore: 900 }),
      solved('easy', { se: 1.0, hodokuScore: 140 }),
      solved('easy', { se: 1.4, hodokuScore: 120 }),
    ]
    const { se, hodoku } = statisticsOf(results, 'easy')
    expect(se).toEqual({ average: expect.closeTo(1.2), min: 1.0, max: 1.4 })
    expect(hodoku).toEqual({ average: 120, min: 100, max: 140 })
  })

  it('has no time, mistake or rating figures without a solved result', () => {
    expect(statisticsOf([abandoned('master'), abandoned('master')], 'master')).toMatchObject({
      bestTime: null, averageTime: null, averageMistakes: null, flawless: null, se: null, hodoku: null,
    })
  })

  it('streaks over solved results in end-time order, broken by an abandon', () => {
    const at = (day: number) => ({ endedAt: `2026-10-${String(day).padStart(2, '0')}T12:00:00.000Z` })
    // Stored out of end-time order: by date the run is S S S A S S, with an Easy abandon between that doesn't count.
    const results = [
      solved('hard', at(5)), solved('hard', at(1)), abandoned('hard', at(4)), solved('hard', at(6)),
      solved('hard', at(2)), abandoned('easy', at(3)), solved('hard', at(3)),
    ]
    expect(statisticsOf(results, 'hard')).toMatchObject({ currentStreak: 2, bestStreak: 3 })
  })

  it('has no current streak once the latest result is an abandon', () => {
    expect(statisticsOf([solved('medium'), solved('medium'), abandoned('medium')], 'medium')).toMatchObject({ currentStreak: 0, bestStreak: 2 })
  })

  it('lists the technique families played, as solved of played, most played first, grouped as the difficulty groups them', () => {
    const results = [
      solved('expert', { hardest: 'Unique Rectangle type 1' }),
      solved('expert', { hardest: 'XY-Wing' }),
      abandoned('expert', { hardest: 'Turbot Fish' }),
      abandoned('expert', { hardest: 'X-Wing' }),
      solved('expert', { hardest: 'Naked Pair' }),
      abandoned('expert', { hardest: 'Turbot Fish' }),
      solved('hard', { hardest: 'X-Wing' }),
    ]
    expect(statisticsOf(results, 'expert').families).toEqual([
      { family: 'Wings & subsets', solved: 2, played: 3, revealed: 0 },
      { family: 'Cycles', solved: 0, played: 2, revealed: 0 },
      { family: 'Uniqueness', solved: 1, played: 1, revealed: 0 },
    ])
    expect(statisticsOf(results, 'hard').families).toEqual([{ family: 'Fish', solved: 1, played: 1, revealed: 0 }])
  })

  it('counts solved results whose key technique was revealed, missing or odd values as not', () => {
    const results = [
      solved('hard', { keyTechniqueRevealed: true }),
      abandoned('hard', { keyTechniqueRevealed: true }),
      solved('hard', { keyTechniqueRevealed: false }),
      solved('hard'),
      solved('hard', { keyTechniqueRevealed: 'yes' as unknown as boolean }),
      solved('easy', { keyTechniqueRevealed: true }),
    ]
    expect(statisticsOf(results, 'hard').revealed).toBe(1)
    expect(statisticsOf([abandoned('hard', { keyTechniqueRevealed: true })], 'hard').revealed).toBeNull()
  })

  it('leaves flawless, streaks and solve rate alone when the key technique was revealed', () => {
    const results = [solved('hard', { keyTechniqueRevealed: true }), solved('hard', { keyTechniqueRevealed: true })]
    expect(statisticsOf(results, 'hard')).toMatchObject({ flawless: 2, currentStreak: 2, bestStreak: 2, solveRate: 1 })
  })

  it('counts each technique family’s solved results whose key technique was revealed', () => {
    const results = [
      solved('hard', { hardest: 'X-Wing', keyTechniqueRevealed: true }),
      abandoned('hard', { hardest: 'X-Wing', keyTechniqueRevealed: true }),
      solved('hard', { hardest: 'X-Wing' }),
      solved('hard', { hardest: 'XY-Wing' }),
    ]
    expect(statisticsOf(results, 'hard').families).toEqual([
      { family: 'Fish', solved: 2, played: 3, revealed: 1 },
      { family: 'Wings', solved: 1, played: 1, revealed: 0 },
    ])
  })

  it('counts revealed solves in the family the difficulty groups them into', () => {
    const results = [
      solved('expert', { hardest: 'XYZ-Wing', keyTechniqueRevealed: true }),
      solved('expert', { hardest: 'Naked Quad', keyTechniqueRevealed: true }),
      solved('expert', { hardest: 'Naked Quad' }),
    ]
    expect(statisticsOf(results, 'expert').families).toEqual([{ family: 'Wings & subsets', solved: 3, played: 3, revealed: 2 }])
  })

  it('lists no technique families on Easy', () => {
    expect(statisticsOf([solved('easy')], 'easy').families).toEqual([])
  })

  it('averages progress over abandoned results only', () => {
    const results = [abandoned('hard', { progress: 20 }), solved('hard'), abandoned('hard', { progress: 50 }), abandoned('easy', { progress: 90 })]
    expect(statisticsOf(results, 'hard').averageProgress).toBe(35)
    expect(statisticsOf([solved('hard')], 'hard').averageProgress).toBeNull()
  })

  it('keeps the 10 latest results, newest first', () => {
    const results = Array.from({ length: 12 }, (_, i) => (i % 3 ? solved : abandoned)('medium', { elapsed: i + 1 }))
    results.splice(5, 0, solved('hard'))
    // Stored newest first, against recording order.
    results.reverse()
    expect(statisticsOf(results, 'medium').recent.map((r) => r.elapsed)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
  })

  it('flags the results as capped once they number 1000', () => {
    const results = Array.from({ length: 999 }, () => solved('easy'))
    expect(capReached(results)).toBe(false)
    results.push(abandoned('master'))
    expect(capReached(results)).toBe(true)
  })

  it('shows a time as mm:ss, or h:mm:ss from one hour', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(3599)).toBe('59:59')
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(37_230)).toBe('10:20:30')
  })
})
