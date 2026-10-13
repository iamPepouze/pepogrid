<script setup lang="ts">
import { bit, colOf, rowOf } from '../lib/sudoku'
import { useGameStore } from '../stores/game'

const game = useGameStore()
const { isGiven, isWrong } = game

const cells = [...Array(81).keys()]

function cellClass(i: number) {
  const c = colOf(i)
  const r = rowOf(i)
  return {
    given: isGiven(i),
    peer: game.peers.has(i),
    conflict: game.conflicts.has(i),
    wrong: isWrong(i),
    selected: game.selected === i,
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
      :aria-label="cellLabel(i)"
      @click="game.select(i)"
    >
      <span v-if="game.values[i]" class="value">{{ game.values[i] }}</span>
      <span v-else-if="game.notes[i]" class="notes" aria-hidden="true">
        <span v-for="d in 9" :key="d" class="note">{{ game.notes[i] & bit(d) ? d : '' }}</span>
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
</style>
