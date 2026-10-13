/**
 * Generates candidate puzzles for a tier, pre-filtered with the built-in rater
 * so the slow real tools mostly see puzzles likely to land in the tier.
 *   npx tsx scripts/bank/candidates.ts <tier> <count> <outFile>
 */
import { appendFileSync, writeFileSync } from 'node:fs'
import { TIERS, tierOf, type Difficulty } from '../../src/lib/difficulty'
import { rateHodoku, rateSE } from '../../src/lib/rater'
import { countSolutions, dig, randomSolution, shuffle } from '../../src/lib/sudoku'

/**
 * Clue counts at which the easier tiers start checking the rating, so their
 * puzzles keep a natural look (not too many or too few clues for the tier).
 */
const CHECK_BELOW: Partial<Record<Difficulty, [number, number]>> = {
  easy: [32, 38],
  medium: [27, 32],
  hard: [23, 28],
}

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/**
 * Easy to Hard: remove clues while SE stays within the tier's maximum, and take
 * the first state the built-in rater places in the tier.
 */
function easierCandidate(tier: Difficulty): string | null {
  const [seMin, seMax] = TIERS[tier].se
  const solution = randomSolution()
  const puzzle = solution.slice()
  const checkBelow = randomInt(...CHECK_BELOW[tier]!)
  let givens = 81
  for (const i of shuffle([...Array(81).keys()])) {
    const value = puzzle[i]
    puzzle[i] = 0
    // A logical solve only makes forced deductions, so it also proves uniqueness.
    const { se } = rateSE(puzzle, seMax)
    if (se === null) {
      puzzle[i] = value
      continue
    }
    givens--
    if (givens > checkBelow || se < seMin) continue
    const hd = rateHodoku(puzzle)
    if (hd.level && tierOf({ se, hodokuLevel: hd.level }) === tier) return puzzle.join('')
  }
  return null
}

/** Expert and Master: minimal unique puzzles that SE rates above 4.2. */
function harderCandidate(): string | null {
  const puzzle = dig(randomSolution(), (p) => countSolutions(p, 2) === 1)
  return rateSE(puzzle).se === null ? puzzle.join('') : null
}

export function candidate(tier: Difficulty): string | null {
  return TIERS[tier].se[0] > 4.2 ? harderCandidate() : easierCandidate(tier)
}

// CLI: write `count` candidates, one per line, flushing as they come.
if (process.argv[1]?.endsWith('candidates.ts')) {
  const [tier, countArg, outFile] = process.argv.slice(2) as [Difficulty, string, string]
  const count = Number(countArg)
  writeFileSync(outFile, '')
  let made = 0
  while (made < count) {
    const p = candidate(tier)
    if (!p) continue
    appendFileSync(outFile, p + '\n')
    made++
  }
}
