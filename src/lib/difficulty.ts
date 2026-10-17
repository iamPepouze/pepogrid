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
  /** Whether the ratings are shown to the player. */
  showRating: boolean
  /** Rotate new games across technique families (see familyOf). */
  rotate: boolean
}

export const TIERS: Record<Difficulty, Tier> = {
  // Easy is all hidden singles, so there is nothing to rotate.
  easy: { label: 'Easy', se: [1.0, 1.5], hodoku: 'easy', showRating: false, rotate: false },
  medium: { label: 'Medium', se: [1.6, 2.6], hodoku: 'medium', showRating: false, rotate: true },
  hard: { label: 'Hard', se: [2.7, 4.2], hodoku: 'hard', showRating: false, rotate: true },
  expert: { label: 'Expert', se: [4.3, 6.5], hodoku: 'unfair', showRating: true, rotate: true },
  master: { label: 'Master', se: [6.6, 8.0], hodoku: 'extreme', showRating: true, rotate: true },
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

/** The technique family an SE technique belongs to, whatever the tier; the key technique's lessons follow it. */
export function techniqueFamily(technique: string): string {
  if (technique === 'Hidden Single') return 'Singles'
  if (technique === 'Naked Single') return 'Naked Single'
  if (technique.startsWith('Direct Hidden')) return 'Hidden subsets'
  if (/Pointing|Claiming/.test(technique)) return 'Intersections'
  if (/^(X-Wing|Swordfish|Jellyfish)$/.test(technique)) return 'Fish'
  if (/^(Naked|Hidden) (Pair|Triplet|Quad)$/.test(technique)) return 'Subsets'
  if (technique.endsWith('Wing')) return 'Wings'
  if (/^Unique (Rectangle|Loop)/.test(technique)) return 'Uniqueness'
  if (technique.startsWith('BUG')) return 'BUG'
  if (technique.endsWith('Exclusion')) return 'Exclusion'
  if (technique.includes('Forcing')) return 'Forcing chains'
  if (/Cycle|Turbot/.test(technique)) return 'Cycles'
  return 'Other'
}

/**
 * Technique family of a puzzle's hardest step (SE technique names), used to
 * rotate what consecutive games of a tier hinge on.
 */
export function familyOf(tier: Difficulty, hardest: string): string {
  const family = techniqueFamily(hardest)
  // Expert has only a handful of these, so they rotate as one family.
  if (tier === 'expert' && ['Wings', 'Subsets', 'Fish'].includes(family)) return 'Wings & subsets'
  return family
}
