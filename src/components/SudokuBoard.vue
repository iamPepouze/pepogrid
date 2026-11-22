<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '../composables/useI18n'
import { bit, colOf, rowOf } from '../lib/sudoku'
import { useGameStore, type NewlyComplete } from '../stores/game'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const game = useGameStore()
const settings = useSettingsStore()
const { isGiven, isLocked, isWrong } = game

/** The cell indexes of each of the nine rows. */
const rowCells = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c))

const board = ref<HTMLElement | null>(null)

/** The cell that is the board's one Tab stop: the selected one, or row 1, column 1 with none. */
const tabStop = computed(() => game.selected ?? 0)

/** Cell `i`'s element, if the board has rendered it. */
function cellEl(i: number) {
  return board.value?.querySelectorAll<HTMLElement>('[role=gridcell]')[i]
}

// While focus is on the board or one of its cells, it follows the selection onto the selected cell
// (the arrow keys move the selection from App). With focus elsewhere in the game, the selection moves
// alone. When the selection clears (a solved puzzle), focus moves to the board itself, so it never
// rests on a cell that shows no ring.
watch(
  () => game.selected,
  (i) => {
    const active = document.activeElement
    if (!(active instanceof HTMLElement) || !board.value?.contains(active)) return
    if (i === null) board.value.focus({ preventScroll: true })
    else cellEl(i)?.focus({ preventScroll: true })
  },
  { flush: 'post' },
)

/** Selects and focuses the cell: Safari doesn't focus a tapped button. */
function pick(i: number) {
  game.select(i)
  cellEl(i)?.focus({ preventScroll: true })
}

defineExpose({
  /** Moves focus onto the board as a whole, without scrolling: where a fresh game starts. */
  focus: () => board.value?.focus({ preventScroll: true }),
})

/** Digit of the selected cell, highlighted across the grid; 0 for none. */
const matchDigit = computed(() =>
  settings.highlightMatching && game.selected !== null ? game.values[game.selected] : 0,
)

/** Length of one cell's glow (the CSS reads it as --glow-duration). */
const GLOW_MS = 1200
/** Delay between the glow reaching one cell and the next, along the wave. */
const GLOW_STEP_MS = 70
/** The farthest cell's delay (corner to corner) plus its own glow. */
const GLOW_TOTAL_MS = Math.ceil(Math.hypot(8, 8) * GLOW_STEP_MS) + GLOW_MS

/** The newly complete digit and units, glowing across their cells (or about to), if any. */
const glow = ref<NewlyComplete | null>(null)
/** False for the frame before the glow starts, while the digits it locked keep their old color. */
const glowStarted = ref(false)
let glowFrame: number | undefined
let glowTimer: number | undefined

/** Cancels a glow's queued start and its end, so a stale one can't touch the next glow. */
function cancelGlow() {
  window.cancelAnimationFrame(glowFrame ?? 0)
  window.clearTimeout(glowTimer)
}

watch(
  () => game.newlyComplete,
  (complete) => {
    cancelGlow()
    glow.value = complete
    glowStarted.value = false
    if (!complete) return
    // Next frame, so a repeat on the same cells restarts the animation.
    glowFrame = window.requestAnimationFrame(() => {
      glowStarted.value = true
      glowTimer = window.setTimeout(() => {
        glow.value = null
        glowStarted.value = false
      }, GLOW_TOTAL_MS)
    })
  },
)

onBeforeUnmount(cancelGlow)

/** Glow delay for cell `i`: a wave spreading out from the placement that completed the digit or units. */
function glowDelay(i: number) {
  if (!glow.value) return undefined
  const from = glow.value.cell
  const distance = Math.hypot(rowOf(i) - rowOf(from), colOf(i) - colOf(from))
  return { '--glow-delay': `${Math.round(distance * GLOW_STEP_MS)}ms` }
}

function cellClass(i: number) {
  const inGlow = glow.value?.cells.includes(i) ?? false
  const newlyLocked = glow.value?.locked.includes(i) ?? false
  return {
    given: isGiven(i),
    peer: game.peers.has(i),
    same: matchDigit.value !== 0 && game.values[i] === matchDigit.value,
    conflict: game.conflicts.has(i),
    wrong: isWrong(i),
    selected: game.selected === i,
    locked: !isGiven(i) && isLocked(i),
    pending: newlyLocked && !glowStarted.value,
    glow: inGlow && glowStarted.value,
    settling: newlyLocked && glowStarted.value,
  }
}

function cellLabel(i: number) {
  const m = t.value.board
  const where = m.place(rowOf(i) + 1, colOf(i) + 1)
  const v = game.values[i]
  if (v) return m.label(where, `${v}${isGiven(i) ? ` (${m.given})` : isLocked(i) ? `, ${m.complete}` : ''}${isWrong(i) ? `, ${m.incorrect}` : ''}`)
  return m.label(where, m.empty)
}
</script>

<template>
  <!-- tabindex="-1": focusable from script (a new game), but no extra Tab stop. -->
  <div ref="board" class="board" role="grid" tabindex="-1" :aria-label="t.board.title" :style="{ '--glow-duration': `${GLOW_MS}ms` }">
    <div v-for="row in rowCells" :key="row[0]" class="row grid-row" role="row">
      <button
        v-for="i in row"
        :key="i"
        type="button"
        role="gridcell"
        class="cell grid-cell"
        :class="cellClass(i)"
        :style="glowDelay(i)"
        :tabindex="tabStop === i ? 0 : -1"
        :aria-label="cellLabel(i)"
        @click="pick(i)"
        @focus="game.select(i)"
      >
        <span v-if="game.values[i]" class="value">{{ game.values[i] }}</span>
        <span v-else-if="game.notes[i]" class="notes" aria-hidden="true">
          <span v-for="d in 9" :key="d" class="note" :class="{ 'note-match': d === matchDigit && (game.notes[i] & bit(d)) !== 0 }">{{ game.notes[i] & bit(d) ? d : '' }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  /* Set by the layout (App.vue). */
  --size: var(--board-size, 100%);
  width: var(--size);
  aspect-ratio: 1;
  border: 3px solid var(--line-thick);
  background: var(--cell);
  user-select: none;
}

.cell {
  position: relative;
  padding: 0;
  background: var(--cell);
  color: var(--user-digit);
  font: inherit;
  cursor: pointer;
}

/* A focused cell is the selected one, whose ring is its focus cue. The board itself (focused by a new game, or by a solve that clears the selection) gets a frame outline for keyboard players only. */
.board:focus,
.cell:focus {
  outline: none;
}

.board:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Rows group the cells for screen readers without changing the 9x9 layout. */
.row {
  display: contents;
}

.cell.peer {
  background: var(--peer);
}

.cell.same {
  background: var(--same-digit);
}

.cell.conflict {
  background: var(--conflict);
}

/* The ring sits inside the cell, under the digit and notes, so the grid lines and the cell's size don't change. */
.cell.selected {
  background: var(--selected);
  box-shadow: inset 0 0 0 2px var(--accent-text);
}

.cell.given,
.cell.locked:not(.pending) {
  color: var(--given-digit);
}

.cell.wrong {
  color: var(--wrong-digit);
}

.cell.glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  pointer-events: none;
  animation: glow var(--glow-duration) ease-in-out var(--glow-delay, 0ms);
}

.cell.glow .value {
  animation: swell var(--glow-duration) ease-in-out var(--glow-delay, 0ms);
}

/* A digit that just locked stays blue until the wave reaches it, then settles to the given color. */
.cell.settling .value {
  animation:
    swell var(--glow-duration) ease-in-out var(--glow-delay, 0ms),
    settle var(--glow-duration) ease-in-out var(--glow-delay, 0ms) backwards;
}

/* The wash stays inside the selected cell's ring, so it can't dilute the ring's contrast. */
.cell.selected.glow::before {
  inset: 2px;
}

/* A soft wash of color and a gentle swell, played when a digit or unit becomes complete. */
@keyframes glow {
  40% {
    opacity: 0.28;
  }
  100% {
    opacity: 0;
  }
}

@keyframes settle {
  0%,
  25% {
    color: var(--user-digit);
  }
  55% {
    color: var(--given-digit);
  }
}

@keyframes swell {
  40% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cell.glow::before,
  .cell.glow .value,
  .cell.settling .value {
    animation: none;
  }
}

.value {
  position: relative;
  font-size: calc(var(--size) / 9 * 0.6);
  line-height: 1;
}

.cell:not(.given) .value {
  font-weight: 500;
}

.cell.given .value {
  font-weight: 600;
}

.notes {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  padding: 2px;
  /* On the grid rather than each note, so a matching note's shared colour (.note-match) wins. */
  color: var(--note);
}

.note {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--size) / 9 * 0.26);
  line-height: 1;
}
</style>
