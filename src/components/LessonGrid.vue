<script setup lang="ts">
import { useI18n } from '../composables/useI18n'
import { bit, colOf, digitsOf, rowOf } from '../lib/grid'
import type { LessonCell } from '../lib/lessons'

defineProps<{ cells: LessonCell[] }>()
const { t } = useI18n()

/** What a screen reader hears for a cell: where it is, what it holds, and how the step treats it. */
function labelOf(cell: LessonCell, i: number) {
  const m = t.value.keyTechnique.lesson
  const where = t.value.board.place(rowOf(i) + 1, colOf(i) + 1)
  const holds = cell.digit ? String(cell.digit) : m.candidates(digitsOf(cell.candidates).join(' '))
  const struck = digitsOf(cell.struck)
  const notes = [
    cell.placed && m.placed,
    struck.length && m.rulesOut(struck.join(' ')),
    cell.highlighted && m.highlighted,
    cell.faded && m.faded,
  ].filter(Boolean)
  return [t.value.board.label(where, holds), ...notes].join(', ')
}
</script>

<template>
  <div class="lesson-grid" role="group" :aria-label="t.keyTechnique.lesson.gridLabel">
    <div
      v-for="(cell, i) in cells"
      :key="i"
      class="cell grid-cell"
      :class="{ faded: cell.faded, highlighted: cell.highlighted, placed: cell.placed }"
      role="img"
      :aria-label="labelOf(cell, i)"
    >
      <span v-if="cell.digit" class="digit">{{ cell.digit }}</span>
      <span v-else class="candidates">
        <span
          v-for="d in 9"
          :key="d"
          :class="{ marked: cell.marked & bit(d), struck: cell.struck & bit(d) }"
        >{{ cell.candidates & bit(d) ? d : '' }}</span>
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
  color: var(--given-digit);
}

.cell.highlighted {
  background: var(--selected);
}

/* Out of the step: muted rather than translucent, so the pattern stands out and the digits still read (U11). */
.cell.faded .digit,
.cell.faded .candidates {
  color: var(--muted);
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
  color: var(--accent-text);
  font-weight: 700;
}

.candidates .struck {
  color: var(--wrong-digit);
  text-decoration: line-through;
}
</style>
