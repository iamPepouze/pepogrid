<script setup lang="ts">
import { Eraser, Pencil, Plus, Undo2 } from '@lucide/vue'
import { useGame } from '../composables/useGame'

const { state, notesMode, undo, erase, toggleNotesMode } = useGame()

defineEmits<{ newGame: [] }>()
</script>

<template>
  <div class="controls">
    <button type="button" class="control" :disabled="!state.history.length || state.completed" @click="undo">
      <Undo2 class="icon" aria-hidden="true" />
      <span>Undo</span>
    </button>
    <button type="button" class="control" :disabled="state.completed" @click="erase">
      <Eraser class="icon" aria-hidden="true" />
      <span>Erase</span>
    </button>
    <button
      type="button"
      class="control"
      :class="{ active: notesMode }"
      :aria-pressed="notesMode"
      :disabled="state.completed"
      @click="toggleNotesMode"
    >
      <Pencil class="icon" aria-hidden="true" />
      <span>Notes</span>
      <span class="badge" aria-hidden="true">{{ notesMode ? 'ON' : 'OFF' }}</span>
    </button>
    <button type="button" class="control" @click="$emit('newGame')">
      <Plus class="icon" aria-hidden="true" />
      <span>New game</span>
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

/* Touch screens: icon above a small label, like a mobile toolbar. */
.control {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  padding: 6px 4px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.control:disabled {
  opacity: 0.45;
  cursor: default;
}

.control.active {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.badge {
  position: absolute;
  top: 3px;
  right: 3px;
  padding: 0 3px;
  border: 1px solid var(--button-border);
  border-radius: 999px;
  background: var(--badge-bg);
  color: var(--muted);
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.4;
}

.control.active .badge {
  border-color: var(--accent);
  background: var(--on-accent);
  color: var(--accent);
}

/* Mouse and keyboard devices: icon left of the label. */
@media (hover: hover) and (pointer: fine) {
  .control {
    flex-direction: row;
    gap: 6px;
    min-height: 44px;
    padding: 8px 6px;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .icon {
    width: 18px;
    height: 18px;
  }

  .badge {
    top: 4px;
    right: 4px;
    padding: 1px 5px;
    font-size: 0.6rem;
  }

  .control:hover:not(:disabled, .active) {
    background: var(--peer);
  }
}

/* The desktop side panel is too narrow for four inline labels in a row. */
@media (orientation: landscape) and (min-width: 600px) and (hover: hover) and (pointer: fine) {
  .controls {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
