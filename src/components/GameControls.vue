<script setup lang="ts">
import { useGame } from '../composables/useGame'

const { state, notesMode, undo, erase, toggleNotesMode } = useGame()

defineEmits<{ newGame: [] }>()
</script>

<template>
  <div class="controls">
    <button type="button" class="control" :disabled="!state.history.length || state.completed" @click="undo">
      Undo
    </button>
    <button type="button" class="control" :disabled="state.completed" @click="erase">Erase</button>
    <button
      type="button"
      class="control"
      :class="{ active: notesMode }"
      :aria-pressed="notesMode"
      :disabled="state.completed"
      @click="toggleNotesMode"
    >
      Notes: {{ notesMode ? 'On' : 'Off' }}
    </button>
    <button type="button" class="control" @click="$emit('newGame')">New game</button>
  </div>
</template>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.control {
  min-height: 44px;
  padding: 8px 4px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.control:disabled {
  opacity: 0.45;
  cursor: default;
}

.control.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

@media (hover: hover) {
  .control:hover:not(:disabled, .active) {
    background: var(--peer);
  }
}
</style>
