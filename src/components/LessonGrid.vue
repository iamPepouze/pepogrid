<script setup lang="ts">
import { digitsOf } from '../lib/grid'
import type { LessonCell } from '../lib/lessons'

defineProps<{ cells: LessonCell[] }>()

/** What a screen reader hears for a cell: where it is, what it holds, and how the step treats it. */
function labelOf(cell: LessonCell, i: number) {
  const where = `Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}`
  const holds = cell.digit ? String(cell.digit) : `candidates ${digitsOf(cell.candidates).join(' ')}`
  const struck = digitsOf(cell.struck)
  const notes = [
    cell.placed && 'placed',
    struck.length && `rules out ${struck.join(' ')}`,
    cell.highlighted && 'highlighted',
    cell.faded && 'faded',
  ].filter(Boolean)
  return [`${where}: ${holds}`, ...notes].join(', ')
}

const bordered = (i: number) => ({
  'box-right': i % 3 === 2 && i % 9 !== 8,
  'box-bottom': Math.floor(i / 9) % 3 === 2 && i < 72,
})
</script>

<template>
  <div class="lesson-grid" role="group" aria-label="Example grid">
    <div
      v-for="(cell, i) in cells"
      :key="i"
      class="cell"
      :class="{ ...bordered(i), faded: cell.faded, highlighted: cell.highlighted, placed: cell.placed }"
      role="img"
      :aria-label="labelOf(cell, i)"
    >
      <span v-if="cell.digit" class="digit">{{ cell.digit }}</span>
      <span v-else class="candidates">
        <span
          v-for="d in 9"
          :key="d"
          :class="{ marked: cell.marked & (1 << d), struck: cell.struck & (1 << d) }"
        >{{ cell.candidates & (1 << d) ? d : '' }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.lesson-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  /* Small enough on a wide screen that the caption and the step buttons stay in view below it. */
  width: min(100%, 420px);
  align-self: center;
  aspect-ratio: 1;
  border: 2px solid var(--line-thick);
  background: var(--cell);
  user-select: none;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-width: 0;
  border-right: 1px solid var(--line-thin);
  border-bottom: 1px solid var(--line-thin);
  color: var(--given-digit);
}

.cell:nth-child(9n) {
  border-right: 0;
}

.cell:nth-child(n + 73) {
  border-bottom: 0;
}

.cell.box-right {
  border-right: 2px solid var(--line-thick);
}

.cell.box-bottom {
  border-bottom: 2px solid var(--line-thick);
}

.cell.highlighted {
  background: var(--selected);
}

/* Out of the step: faded, so the pattern stands out. */
.cell.faded > * {
  opacity: 0.3;
}

.digit {
  font-size: clamp(0.9rem, 5vw, 1.4rem);
}

.cell.placed .digit {
  color: var(--user-digit);
  font-weight: 600;
}

.candidates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  color: var(--note);
  font-size: clamp(0.45rem, 2.2vw, 0.65rem);
  line-height: 1;
  text-align: center;
  align-items: center;
}

.candidates .marked {
  color: var(--accent);
  font-weight: 700;
}

.candidates .struck {
  color: var(--wrong-digit);
  text-decoration: line-through;
}
</style>
