import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Difficulty, HodokuLevel } from '../lib/difficulty'

const MAX_RESULTS = 1000

export type Outcome = 'completed' | 'abandoned'

export interface GameResult {
  id: string
  difficulty: Difficulty
  outcome: Outcome
  /** ISO timestamps. */
  startedAt: string
  endedAt: string
  /** Seconds played. */
  elapsed: number
  mistakes: number
  /** Share of the initially empty cells filled correctly, 0-100. */
  progress: number
  /** Grids as 81-character strings in row-major order, '0' for empty. */
  puzzle: string
  solution: string
  finalBoard: string
  /** Sudoku Explainer 1.2.1 rating. */
  se: number
  hodokuScore: number
  hodokuLevel: HodokuLevel
  /** Technique behind the SE rating. */
  hardest: string
}

export const gridToString = (grid: readonly number[]) => grid.join('')

/** History of finished and abandoned games, newest last. Persisted as `pepogrid.results`. */
export const useResultsStore = defineStore(
  'results',
  () => {
    const results = ref<GameResult[]>([])

    function record(result: Omit<GameResult, 'id'>) {
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      results.value.push({ id, ...result })
      if (results.value.length > MAX_RESULTS) results.value.splice(0, results.value.length - MAX_RESULTS)
    }

    return { results, record }
  },
  {
    persist: {
      afterHydrate: ({ store }) => {
        if (!Array.isArray(store.results)) store.results = []
      },
    },
  },
)
