<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { bit, colOf, rowOf } from '../lib/sudoku'
import { useGameStore, type NewlyComplete } from '../stores/game'
import { useSettingsStore } from '../stores/settings'

const game = useGameStore()
const settings = useSettingsStore()
const { isGiven, isWrong } = game

const cells = [...Array(81).keys()]

/** Digit of the selected cell, highlighted across the grid; 0 for none. */
const matchDigit = computed(() =>
  settings.highlightMatching && game.selected !== null ? game.values[game.selected] : 0,
)

/** Delay between the glow reaching one cell and the next, along the wave. */
const GLOW_STEP_MS = 70
/** Longest wave delay (about 8√2 steps) plus the 1.2s glow animation. */
const GLOW_TOTAL_MS = 2100

/** The newly complete digit currently glowing across its cells, if any. */
const glow = ref<NewlyComplete | null>(null)
let glowTimer: number | undefined

watch(
  () => game.newlyComplete,
  (complete) => {
    window.clearTimeout(glowTimer)
    glow.value = null
    if (!complete) return
    // Next frame, so a repeat on the same cells restarts the animation.
    requestAnimationFrame(() => {
      glow.value = complete
      glowTimer = window.setTimeout(() => (glow.value = null), GLOW_TOTAL_MS)
    })
  },
)

onBeforeUnmount(() => window.clearTimeout(glowTimer))

/** Glow delay for cell `i`: a wave spreading out from the placement that completed the digit. */
function glowDelay(i: number) {
  if (!glow.value) return undefined
  const from = glow.value.cell
  const distance = Math.hypot(rowOf(i) - rowOf(from), colOf(i) - colOf(from))
  return { '--glow-delay': `${Math.round(distance * GLOW_STEP_MS)}ms` }
}

function cellClass(i: number) {
  const c = colOf(i)
  const r = rowOf(i)
  return {
    given: isGiven(i),
    peer: game.peers.has(i),
    same: matchDigit.value !== 0 && game.values[i] === matchDigit.value,
    conflict: game.conflicts.has(i),
    wrong: isWrong(i),
    selected: game.selected === i,
    // The digit's solution cells only: a wrong copy elsewhere stays unlit.
    glow: glow.value !== null && game.solution[i] === glow.value.digit,
    'box-right': c % 3 === 2 && c !== 8,
    'box-bottom': r % 3 === 2 && r !== 8,
    'last-col': c === 8,
    'last-row': r === 8,
  }
}

function cellLabel(i: number) {
  const where = `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}`
  const v = game.values[i]
  if (v) return `${where}: ${v}${isGiven(i) ? ' (given)' : ''}${isWrong(i) ? ', incorrect' : ''}`
  return `${where}: empty`
}
</script>

<template>
  <div class="board" role="grid" aria-label="Sudoku board">
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

.cell.given {
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
  animation: glow 1.2s ease-in-out var(--glow-delay, 0ms);
}

.cell.glow .value {
  animation: swell 1.2s ease-in-out var(--glow-delay, 0ms);
}

/* A soft wash of colour and a gentle swell, played when a digit becomes complete. */
@keyframes glow {
  40% {
    opacity: 0.28;
  }
  100% {
    opacity: 0;
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
  .cell.glow .value {
    animation: none;
  }
}

.value,
.notes {
  position: relative;
}

.value {
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
