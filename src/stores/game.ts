import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { pickFromBank } from '../lib/bank'
import { DIFFICULTIES, HODOKU_LEVELS, type Difficulty, type Rating } from '../lib/difficulty'
import { PEERS, bit, colOf, rowOf } from '../lib/sudoku'
import { gridToString, useResultsStore, type Outcome } from './results'

const HISTORY_LIMIT = 100

interface Snapshot {
  values: number[]
  notes: number[]
}

/** Haptic feedback; a no-op where unsupported (e.g. iOS). */
export function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Ignore: vibration is best-effort.
  }
}

const isGrid = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === 81 && value.every((v) => Number.isInteger(v))

const isRating = (r: Rating | null): r is Rating =>
  !!r && typeof r.se === 'number' && typeof r.hodokuScore === 'number' && HODOKU_LEVELS.includes(r.hodokuLevel) && typeof r.hardest === 'string'

const emptyBankUsage = (): Record<Difficulty, number[]> => ({ easy: [], medium: [], hard: [], expert: [], master: [] })
const emptyFamilyPlays = (): Record<Difficulty, Record<string, number>> => ({ easy: {}, medium: {}, hard: {}, expert: {}, master: {} })

/**
 * The game in progress, persisted as `pepogrid.game` so a refresh resumes exactly
 * where it was. Call `isValid()` after creation: with no (or a corrupt) save the
 * state is empty and needs `newGame()`.
 */
export const useGameStore = defineStore(
  'game',
  () => {
    const difficulty = ref<Difficulty>('easy')
    /** Given clues, 0 for cells the player fills. */
    const puzzle = ref<number[]>([])
    const solution = ref<number[]>([])
    /** Current digits, including givens. */
    const values = ref<number[]>([])
    /** Pencil marks per cell as a bitmask of digits 1-9. */
    const notes = ref<number[]>([])
    const mistakes = ref(0)
    /** Seconds spent on this puzzle. */
    const elapsed = ref(0)
    /** ISO timestamp of when the puzzle was started. */
    const startedAt = ref('')
    const completed = ref(false)
    const history = ref<Snapshot[]>([])
    const selected = ref<number | null>(null)
    const notesMode = ref(false)
    /** SE and HoDoKu ratings of the puzzle (from the bank). */
    const rating = ref<Rating | null>(null)
    /** Bank indexes already played per tier, to avoid repeats. */
    const bankUsed = ref<Record<Difficulty, number[]>>(emptyBankUsage())
    /** When each technique family was last played, per tier (for rotation). */
    const familyPlayed = ref<Record<Difficulty, Record<string, number>>>(emptyFamilyPlays())
    /** True while a new puzzle is being loaded (not persisted). */
    const loading = ref(false)
    /**
     * Set to a fresh object each time a placement makes a digit complete, to trigger
     * its animation. Undo never sets it, and it is not persisted, so a resume is silent.
     */
    const lastCompletion = ref<{ digit: number; cell: number } | null>(null)

    const isGiven = (i: number) => puzzle.value[i] !== 0
    const isWrong = (i: number) => !isGiven(i) && values.value[i] !== 0 && values.value[i] !== solution.value[i]

    /** Cells whose digit repeats in their row, column or box. */
    const conflicts = computed(() => {
      const set = new Set<number>()
      for (let i = 0; i < 81; i++) {
        const v = values.value[i]
        if (v && PEERS[i].some((p) => values.value[p] === v)) set.add(i)
      }
      return set
    })

    /** Digits that sit in every cell where the solution has them; wrong copies don't count. */
    const completeDigits = computed(() => {
      const set = new Set<number>()
      if (!isGrid(solution.value)) return set // no game yet
      for (let d = 1; d <= 9; d++) {
        if (solution.value.every((v, i) => v !== d || values.value[i] === d)) set.add(d)
      }
      return set
    })

    const peers = computed(() => new Set(selected.value === null ? [] : PEERS[selected.value]))

    const hasProgress = computed(
      () => values.value.some((v, i) => v !== puzzle.value[i]) || notes.value.some((n) => n !== 0),
    )

    function recordResult(outcome: Outcome) {
      const empties = puzzle.value.filter((v) => v === 0).length
      const correct = values.value.filter((v, i) => puzzle.value[i] === 0 && v === solution.value[i]).length
      useResultsStore().record({
        difficulty: difficulty.value,
        outcome,
        startedAt: startedAt.value,
        endedAt: new Date().toISOString(),
        elapsed: elapsed.value,
        mistakes: mistakes.value,
        progress: empties ? Math.round((correct / empties) * 100) : 100,
        puzzle: gridToString(puzzle.value),
        solution: gridToString(solution.value),
        finalBoard: gridToString(values.value),
        se: rating.value!.se,
        hodokuScore: rating.value!.hodokuScore,
        hodokuLevel: rating.value!.hodokuLevel,
        hardest: rating.value!.hardest,
      })
    }

    /** Starts a new puzzle; an unfinished game with progress is recorded as abandoned. */
    async function newGame(level: Difficulty, { recordAbandoned = true } = {}) {
      if (loading.value) return
      loading.value = true
      try {
        const pick = await pickFromBank(level, bankUsed.value[level] ?? [], familyPlayed.value[level] ?? {})
        if (recordAbandoned && isValid() && !completed.value && hasProgress.value) recordResult('abandoned')
        bankUsed.value[level] = pick.restarted ? [pick.index] : [...(bankUsed.value[level] ?? []), pick.index]
        // Strictly increasing, so two games in the same millisecond still order correctly.
        const plays = familyPlayed.value[level] ?? {}
        const stamp = Math.max(Date.now(), ...Object.values(plays).map((t) => t + 1))
        familyPlayed.value[level] = { ...plays, [pick.family]: stamp }
        start(level, pick.puzzle, pick.solution, pick.rating)
      } finally {
        loading.value = false
      }
    }

    function start(level: Difficulty, givens: number[], answer: number[], puzzleRating: Rating) {
      difficulty.value = level
      puzzle.value = givens
      solution.value = answer
      rating.value = puzzleRating
      values.value = givens.slice()
      notes.value = new Array(81).fill(0)
      mistakes.value = 0
      elapsed.value = 0
      startedAt.value = new Date().toISOString()
      completed.value = false
      history.value = []
      selected.value = null
      notesMode.value = false
      lastCompletion.value = null
    }

    function pushHistory() {
      history.value.push({ values: values.value.slice(), notes: notes.value.slice() })
      if (history.value.length > HISTORY_LIMIT) history.value.shift()
    }

    /** The selected cell if the player may edit it, otherwise null. */
    function editableCell(): number | null {
      const i = selected.value
      if (i === null || loading.value || completed.value || isGiven(i)) return null
      return i
    }

    function select(i: number) {
      selected.value = i
    }

    function move(dRow: number, dCol: number) {
      const i = selected.value ?? 40
      const r = (rowOf(i) + dRow + 9) % 9
      const c = (colOf(i) + dCol + 9) % 9
      selected.value = r * 9 + c
    }

    function setValue(d: number) {
      const i = editableCell()
      if (i === null || values.value[i] === d || completeDigits.value.has(d)) return
      pushHistory()
      values.value[i] = d
      notes.value[i] = 0
      for (const p of PEERS[i]) notes.value[p] &= ~bit(d)
      if (d !== solution.value[i]) {
        mistakes.value++
        vibrate(80)
      } else if (completeDigits.value.has(d)) {
        lastCompletion.value = { digit: d, cell: i }
      }
      if (values.value.every((v, k) => v === solution.value[k])) {
        completed.value = true
        selected.value = null
        recordResult('completed')
      }
    }

    function toggleNote(d: number) {
      const i = editableCell()
      if (i === null || values.value[i] !== 0 || completeDigits.value.has(d)) return
      pushHistory()
      notes.value[i] ^= bit(d)
    }

    /** Digit entry from the number pad or keyboard, honouring notes mode. */
    function input(d: number) {
      if (notesMode.value) toggleNote(d)
      else setValue(d)
    }

    function erase() {
      const i = editableCell()
      if (i === null || (values.value[i] === 0 && notes.value[i] === 0)) return
      pushHistory()
      values.value[i] = 0
      notes.value[i] = 0
    }

    function undo() {
      if (completed.value) return
      const snapshot = history.value.pop()
      if (!snapshot) return
      values.value = snapshot.values
      notes.value = snapshot.notes
    }

    function toggleNotesMode() {
      notesMode.value = !notesMode.value
    }

    function tick() {
      if (!completed.value) elapsed.value++
    }

    /** True when hydrated state is complete and consistent. */
    function isValid() {
      return (
        DIFFICULTIES.includes(difficulty.value) &&
        [puzzle.value, solution.value, values.value, notes.value].every(isGrid) &&
        Number.isInteger(mistakes.value) &&
        Number.isInteger(elapsed.value) &&
        typeof completed.value === 'boolean' &&
        Array.isArray(history.value) &&
        isRating(rating.value) &&
        (selected.value === null || (Number.isInteger(selected.value) && selected.value >= 0 && selected.value < 81))
      )
    }

    return {
      difficulty,
      puzzle,
      solution,
      values,
      notes,
      mistakes,
      elapsed,
      startedAt,
      completed,
      history,
      selected,
      notesMode,
      rating,
      bankUsed,
      familyPlayed,
      loading,
      lastCompletion,
      conflicts,
      completeDigits,
      peers,
      hasProgress,
      isGiven,
      isWrong,
      newGame,
      select,
      move,
      input,
      toggleNote,
      erase,
      undo,
      toggleNotesMode,
      tick,
      isValid,
    }
  },
  { persist: { omit: ['loading', 'lastCompletion'] } },
)
