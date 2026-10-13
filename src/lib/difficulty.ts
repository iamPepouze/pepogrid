/**
 * Difficulty tiers, defined by two community ratings:
 * - SE: Sudoku Explainer 1.2.1 rating, the hardest technique the solution needs.
 * - HoDoKu: its level, which combines the hardest technique and the total step score.
 * SE picks the tier; HoDoKu's level must match the tier's level or the puzzle is rejected.
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master'

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'master']

export type HodokuLevel = 'easy' | 'medium' | 'hard' | 'unfair' | 'extreme'

export const HODOKU_LEVELS: readonly HodokuLevel[] = ['easy', 'medium', 'hard', 'unfair', 'extreme']

export interface Rating {
  /** Sudoku Explainer 1.2.1 rating. */
  se: number
  hodokuScore: number
  hodokuLevel: HodokuLevel
  /** Name of the technique behind the SE rating. */
  hardest: string
}

export interface Tier {
  label: string
  /** Inclusive SE range. */
  se: [number, number]
  hodoku: HodokuLevel
  /** Generated live in the app, or picked from the pre-rated bank. */
  source: 'live' | 'bank'
  /** Whether the ratings are shown to the player. */
  showRating: boolean
}

export const TIERS: Record<Difficulty, Tier> = {
  easy: { label: 'Easy', se: [1.0, 1.5], hodoku: 'easy', source: 'live', showRating: false },
  medium: { label: 'Medium', se: [1.6, 2.6], hodoku: 'medium', source: 'live', showRating: false },
  hard: { label: 'Hard', se: [2.7, 4.2], hodoku: 'hard', source: 'live', showRating: false },
  expert: { label: 'Expert', se: [4.3, 6.5], hodoku: 'unfair', source: 'bank', showRating: true },
  master: { label: 'Master', se: [6.6, 8.0], hodoku: 'extreme', source: 'bank', showRating: true },
}

export const LABELS: Record<Difficulty, string> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d, TIERS[d].label]),
) as Record<Difficulty, string>

export const HODOKU_LABELS: Record<HodokuLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  unfair: 'Unfair',
  extreme: 'Extreme',
}

/** The tier a rating belongs to, or null when SE and HoDoKu disagree or it's out of range. */
export function tierOf(rating: Pick<Rating, 'se' | 'hodokuLevel'>): Difficulty | null {
  // Ratings are tenths; compare with a small epsilon against float noise.
  const se = Math.round(rating.se * 10) / 10
  const tier = DIFFICULTIES.find((d) => se >= TIERS[d].se[0] && se <= TIERS[d].se[1])
  return tier && TIERS[tier].hodoku === rating.hodokuLevel ? tier : null
}
