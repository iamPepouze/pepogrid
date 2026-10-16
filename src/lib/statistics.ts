/**
 * Statistics: figures drawn from stored results, for one difficulty or all of them.
 * Pure, so it takes only the fields it reads rather than the results store's own type.
 */
import { TIERS, familyOf, type Difficulty } from './difficulty'

/** How a game ended; `completed` is a solved game. */
export type Outcome = 'completed' | 'abandoned'

/** The parts of a stored result the statistics read. */
export interface StatResult {
  difficulty: Difficulty
  outcome: Outcome
  /** ISO timestamp. */
  endedAt: string
  /** Seconds played. */
  elapsed: number
  mistakes: number
  /** Share of the initially empty cells filled correctly, 0-100. */
  progress: number
  se: number
  hodokuScore: number
  /** Technique behind the SE rating. */
  hardest: string
}

export interface Counts {
  played: number
  solved: number
  abandoned: number
  /** Solved results as a share of all results, 0-1; null when there are none. */
  solveRate: number | null
}

/** A difficulty's figures. Those drawn from solved results are null when there are none. */
export interface Statistics extends Counts {
  /** Seconds. */
  bestTime: number | null
  averageTime: number | null
  averageMistakes: number | null
  /** Solved results with no mistakes. */
  flawless: number | null
  se: Spread | null
  hodoku: Spread | null
  /** Solved results in a row up to the latest result, 0 when it is an abandon. */
  currentStreak: number
  /** The longest run of solved results. */
  bestStreak: number
  /** Each technique family played, most played first; empty where the tier doesn't rotate (Easy). */
  families: FamilyRecord[]
  /** Mean progress of abandoned results, 0-100; null when there are none. */
  averageProgress: number | null
  /** The latest results, newest first. */
  recent: StatResult[]
}

export interface FamilyRecord {
  family: string
  solved: number
  played: number
}

export interface Spread {
  average: number
  min: number
  max: number
}

const RECENT_COUNT = 10

const mean = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

const spreadOf = (values: readonly number[]): Spread | null =>
  values.length ? { average: mean(values), min: Math.min(...values), max: Math.max(...values) } : null

/** `seconds`, rounded, as mm:ss, or h:mm:ss from one hour up. */
export function formatDuration(seconds: number) {
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** The counts of `results` at `difficulty`, or across every difficulty when it is left out. */
export function countsOf(results: readonly StatResult[], difficulty?: Difficulty): Counts {
  const scoped = difficulty ? results.filter((r) => r.difficulty === difficulty) : results
  const played = scoped.length
  const solved = scoped.filter((r) => r.outcome === 'completed').length
  return { played, solved, abandoned: played - solved, solveRate: played ? solved / played : null }
}

/** Solved of played per technique family, most played first, then by name. */
function familiesOf(results: readonly StatResult[], difficulty: Difficulty): FamilyRecord[] {
  // A tier that doesn't rotate has a single family (Easy: Singles), so listing it says nothing.
  if (!TIERS[difficulty].rotate) return []
  const records = new Map<string, FamilyRecord>()
  for (const r of results) {
    const family = familyOf(difficulty, r.hardest)
    const record = records.get(family) ?? { family, solved: 0, played: 0 }
    record.played++
    if (r.outcome === 'completed') record.solved++
    records.set(family, record)
  }
  return [...records.values()].sort((a, b) => b.played - a.played || a.family.localeCompare(b.family))
}

/** Every figure of `results` at `difficulty`. */
export function statisticsOf(results: readonly StatResult[], difficulty: Difficulty): Statistics {
  // Stored order is recording order, which a hand-edited save or a clock change can break.
  const scoped = results.filter((r) => r.difficulty === difficulty).sort((a, b) => Date.parse(a.endedAt) - Date.parse(b.endedAt))
  const solved = scoped.filter((r) => r.outcome === 'completed')
  let currentStreak = 0
  let bestStreak = 0
  for (const r of scoped) {
    currentStreak = r.outcome === 'completed' ? currentStreak + 1 : 0
    bestStreak = Math.max(bestStreak, currentStreak)
  }
  const time = spreadOf(solved.map((r) => r.elapsed))
  const mistakes = spreadOf(solved.map((r) => r.mistakes))
  return {
    ...countsOf(scoped),
    bestTime: time?.min ?? null,
    averageTime: time?.average ?? null,
    averageMistakes: mistakes?.average ?? null,
    flawless: mistakes ? solved.filter((r) => r.mistakes === 0).length : null,
    se: spreadOf(solved.map((r) => r.se)),
    hodoku: spreadOf(solved.map((r) => r.hodokuScore)),
    currentStreak,
    bestStreak,
    families: familiesOf(scoped, difficulty),
    averageProgress: spreadOf(scoped.filter((r) => r.outcome === 'abandoned').map((r) => r.progress))?.average ?? null,
    recent: scoped.slice(-RECENT_COUNT).reverse(),
  }
}
