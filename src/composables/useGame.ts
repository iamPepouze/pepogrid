import { computed, reactive, ref, watch } from 'vue'
import { DIFFICULTIES, PEERS, bit, colOf, generate, rowOf, type Difficulty } from '../lib/sudoku'

const STORAGE_KEY = 'pepogrid:game'
const HISTORY_LIMIT = 100

interface Snapshot {
  values: number[]
  notes: number[]
}

export interface GameState {
  difficulty: Difficulty
  /** Given clues, 0 for cells the player fills. */
  puzzle: number[]
  solution: number[]
  /** Current digits, including givens. */
  values: number[]
  /** Pencil marks per cell as a bitmask of digits 1-9. */
  notes: number[]
  mistakes: number
  /** Seconds spent on this puzzle. */
  elapsed: number
  completed: boolean
  history: Snapshot[]
}

function freshGame(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generate(difficulty)
  return {
    difficulty,
    puzzle,
    solution,
    values: puzzle.slice(),
    notes: new Array(81).fill(0),
    mistakes: 0,
    elapsed: 0,
    completed: false,
    history: [],
  }
}

function isGrid(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === 81 && value.every((v) => Number.isInteger(v))
}

function loadSaved(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState
    const valid =
      DIFFICULTIES.includes(s.difficulty) &&
      [s.puzzle, s.solution, s.values, s.notes].every(isGrid) &&
      Number.isInteger(s.mistakes) &&
      Number.isInteger(s.elapsed) &&
      typeof s.completed === 'boolean' &&
      Array.isArray(s.history)
    return valid ? s : null
  } catch {
    return null
  }
}

function save(s: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Storage unavailable (private mode, quota): play on without saving.
  }
}

const state = reactive<GameState>(loadSaved() ?? freshGame('easy'))
const selected = ref<number | null>(null)
const notesMode = ref(false)

watch(state, () => save(state), { deep: true })

const isGiven = (i: number) => state.puzzle[i] !== 0
const isWrong = (i: number) => !isGiven(i) && state.values[i] !== 0 && state.values[i] !== state.solution[i]

/** Cells whose digit repeats in their row, column or box. */
const conflicts = computed(() => {
  const set = new Set<number>()
  for (let i = 0; i < 81; i++) {
    const v = state.values[i]
    if (v && PEERS[i].some((p) => state.values[p] === v)) set.add(i)
  }
  return set
})

const peers = computed(() => new Set(selected.value === null ? [] : PEERS[selected.value]))

const hasProgress = computed(
  () => state.values.some((v, i) => v !== state.puzzle[i]) || state.notes.some((n) => n !== 0),
)

/** Haptic feedback; a no-op where unsupported (e.g. iOS). */
export function vibrate(ms: number) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Ignore: vibration is best-effort.
  }
}

function pushHistory() {
  state.history.push({ values: state.values.slice(), notes: state.notes.slice() })
  if (state.history.length > HISTORY_LIMIT) state.history.shift()
}

/** The selected cell if the player may edit it, otherwise null. */
function editableCell(): number | null {
  const i = selected.value
  if (i === null || state.completed || isGiven(i)) return null
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
  if (i === null || state.values[i] === d) return
  pushHistory()
  state.values[i] = d
  state.notes[i] = 0
  for (const p of PEERS[i]) state.notes[p] &= ~bit(d)
  if (d !== state.solution[i]) {
    state.mistakes++
    vibrate(80)
  }
  if (state.values.every((v, k) => v === state.solution[k])) {
    state.completed = true
    selected.value = null
  }
}

function toggleNote(d: number) {
  const i = editableCell()
  if (i === null || state.values[i] !== 0) return
  pushHistory()
  state.notes[i] ^= bit(d)
}

/** Digit entry from the number pad or keyboard, honouring notes mode. */
function input(d: number) {
  if (notesMode.value) toggleNote(d)
  else setValue(d)
}

function erase() {
  const i = editableCell()
  if (i === null || (state.values[i] === 0 && state.notes[i] === 0)) return
  pushHistory()
  state.values[i] = 0
  state.notes[i] = 0
}

function undo() {
  if (state.completed) return
  const snapshot = state.history.pop()
  if (!snapshot) return
  state.values = snapshot.values
  state.notes = snapshot.notes
}

function toggleNotesMode() {
  notesMode.value = !notesMode.value
}

function newGame(difficulty: Difficulty) {
  Object.assign(state, freshGame(difficulty))
  selected.value = null
  notesMode.value = false
}

function tick() {
  if (!state.completed) state.elapsed++
}

export function useGame() {
  return {
    state,
    selected,
    notesMode,
    conflicts,
    peers,
    hasProgress,
    isGiven,
    isWrong,
    select,
    move,
    input,
    toggleNote,
    erase,
    undo,
    toggleNotesMode,
    newGame,
    tick,
  }
}
