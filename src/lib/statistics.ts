/**
 * Statistics: figures drawn from stored results, for one difficulty or all of them.
 * Pure, so it takes only the fields it reads rather than the results store's own type.
 */
import type { Difficulty } from './difficulty'

/** How a game ended; `completed` is a solved game. */
export type Outcome = 'completed' | 'abandoned'

/** The parts of a stored result the statistics read. */
export interface StatResult {
  difficulty: Difficulty
  outcome: Outcome
}

export interface Statistics {
  played: number
  solved: number
  abandoned: number
  /** Solved results as a share of all results, 0-1; null when there are none. */
  solveRate: number | null
}

/** The statistics of `results` at `difficulty`, or across every difficulty when it is left out. */
export function statisticsOf(results: readonly StatResult[], difficulty?: Difficulty): Statistics {
  const scoped = difficulty ? results.filter((r) => r.difficulty === difficulty) : results
  const played = scoped.length
  const solved = scoped.filter((r) => r.outcome === 'completed').length
  return { played, solved, abandoned: played - solved, solveRate: played ? solved / played : null }
}
