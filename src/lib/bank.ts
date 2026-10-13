/**
 * The puzzle bank: 1000 puzzles per tier, rated offline by the real tools
 * (scripts/bank/build-bank.ts). Each tier is a separate lazily loaded chunk.
 */
import { TIERS, type Difficulty, type Rating } from './difficulty'
import { solve, type Grid } from './sudoku'
import { applyTransform, randomTransform } from './transform'

/** [puzzle (81 digits, 0 = empty), SE rating, HoDoKu score, hardest technique] */
export type BankEntry = [string, number, number, string]

const LOADERS: Record<Difficulty, () => Promise<{ default: unknown }>> = {
  easy: () => import('../data/bank-easy.json'),
  medium: () => import('../data/bank-medium.json'),
  hard: () => import('../data/bank-hard.json'),
  expert: () => import('../data/bank-expert.json'),
  master: () => import('../data/bank-master.json'),
}

export async function loadBank(tier: Difficulty): Promise<BankEntry[]> {
  return (await LOADERS[tier]()).default as BankEntry[]
}

export interface BankPick {
  /** Index in the tier's bank, for avoiding repeats. */
  index: number
  /** True when every puzzle had been used, so `used` started over. */
  restarted: boolean
  puzzle: Grid
  solution: Grid
  rating: Rating
}

/**
 * Picks a puzzle not in `used` (all are eligible again once every one has been
 * used) and disguises it with a random digit relabelling and symmetry.
 */
export async function pickFromBank(tier: Difficulty, used: readonly number[]): Promise<BankPick> {
  const bank = await loadBank(tier)
  const restarted = used.length >= bank.length
  const usedSet = new Set(restarted ? [] : used)
  const free = bank.map((_, i) => i).filter((i) => !usedSet.has(i))
  const index = free[Math.floor(Math.random() * free.length)]
  const [givens, se, hodokuScore, hardest] = bank[index]
  const puzzle = applyTransform([...givens].map(Number), randomTransform())
  const solution = solve(puzzle)
  if (!solution) throw new Error(`Bank puzzle ${tier}#${index} has no solution`)
  return { index, restarted, puzzle, solution, rating: { se, hodokuScore, hodokuLevel: TIERS[tier].hodoku, hardest } }
}
