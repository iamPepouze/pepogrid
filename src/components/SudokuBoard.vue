<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { bit, colOf, rowOf } from '../lib/sudoku'
import { useGameStore, type NewlyComplete } from '../stores/game'
import { useSettingsStore } from '../stores/settings'

const game = useGameStore()
const settings = useSettingsStore()
const { isGiven, isLocked, isWrong } = game

const cells = [...Array(81).keys()]

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
let glowTimer: number | undefined

watch(
  () => game.newlyComplete,
  (complete) => {
    window.clearTimeout(glowTimer)
    glow.value = complete
    glowStarted.value = false
    if (!complete) return
    // Next frame, so a repeat on the same cells restarts the animation.
    requestAnimationFrame(() => {
      glowStarted.value = true
      glowTimer = window.setTimeout(() => {
        glow.value = null
        glowStarted.value = false
      }, GLOW_TOTAL_MS)
    })
  },
)

onBeforeUnmount(() => window.clearTimeout(glowTimer))

/** Glow delay for cell `i`: a wave spreading out from the placement that completed the digit or units. */
function glowDelay(i: number) {
  if (!glow.value) return undefined
  const from = glow.value.cell
  const distance = Math.hypot(rowOf(i) - rowOf(from), colOf(i) - colOf(from))
  return { '--glow-delay': `${Math.round(distance * GLOW_STEP_MS)}ms` }
}

function cellClass(i: number) {
  const c = colOf(i)
  const r = rowOf(i)
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
    'box-right': c % 3 === 2 && c !== 8,
    'box-bottom': r % 3 === 2 && r !== 8,
    'last-col': c === 8,
    'last-row': r === 8,
  }
}

function cellLabel(i: number) {
  const where = `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}`
  const v = game.values[i]
  if (v) return `${where}: ${v}${isGiven(i) ? ' (given)' : isLocked(i) ? ', complete' : ''}${isWrong(i) ? ', incorrect' : ''}`
  return `${where}: empty`
}
</script>

<template>
  <div class="board" role="grid" aria-label="Sudoku board" :style="{ '--glow-duration': `${GLOW_MS}ms` }">
    <button
      v-for="i in cells"
      :key="i"
      type="button"
      class="cell"
      :class="cellClass(i)"
      :style="glowDelay(i)"
      :aria-label="cellLabel(i)"
      @click="game.select(i)"
    >
      <span v-if="game.values[i]" class="value">{{ game.values[i] }}</span>
      <span v-else-if="game.notes[i]" class="notes" aria-hidden="true">
        <span v-for="d in 9" :key="d" class="note" :class="{ match: d === matchDigit }">{{ game.notes[i] & bit(d) ? d : '' }}</span>
      </span>
    </button>
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
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--line-thin);
  border-bottom: 1px solid var(--line-thin);
  background: var(--cell);
  color: var(--user-digit);
  font: inherit;
  cursor: pointer;
}

.cell:focus {
  outline: none;
}

.cell.box-right {
  border-right: 2px solid var(--line-thick);
}

.cell.box-bottom {
  border-bottom: 2px solid var(--line-thick);
}

.cell.last-col {
  border-right: 0;
}

.cell.last-row {
  border-bottom: 0;
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

.cell.selected {
  background: var(--selected);
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
}

.note {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--note);
  font-size: calc(var(--size) / 9 * 0.26);
  line-height: 1;
}
.note.match {
  color: var(--user-digit);
  font-weight: 700;
}
</style>
