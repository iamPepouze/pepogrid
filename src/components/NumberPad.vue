<script setup lang="ts">
import { useGame } from '../composables/useGame'

const { notesMode, input } = useGame()
</script>

<template>
  <div class="pad" :class="{ notes: notesMode }" role="group" aria-label="Number pad">
    <button v-for="d in 9" :key="d" type="button" class="digit" @click="input(d)">{{ d }}</button>
  </div>
</template>

<style scoped>
.pad {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  width: var(--board-size);
}

.digit {
  aspect-ratio: 1 / 1.15;
  padding: 0;
  border: 1px solid var(--button-border);
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--user-digit);
  font: inherit;
  font-size: calc(var(--board-size) / 9 * 0.5);
  font-weight: 500;
  cursor: pointer;
}

.digit:hover {
  background: var(--peer);
}

.digit:active {
  background: var(--selected);
}

.pad.notes .digit {
  color: var(--note);
  font-size: calc(var(--board-size) / 9 * 0.36);
}
</style>
