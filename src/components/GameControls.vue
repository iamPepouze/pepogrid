<script setup lang="ts">
import { Eraser, Pencil, Undo2, WandSparkles } from '@lucide/vue'
import { useGameStore } from '../stores/game'

const game = useGameStore()
</script>

<template>
  <div class="controls">
    <button type="button" class="control" :disabled="!game.history.length || game.completed" @click="game.undo">
      <Undo2 class="icon" aria-hidden="true" />
      <span>Undo</span>
    </button>
    <button type="button" class="control" :disabled="game.completed" @click="game.erase">
      <Eraser class="icon" aria-hidden="true" />
      <span>Erase</span>
    </button>
    <button
      type="button"
      class="control"
      :class="{ active: game.notesMode }"
      :aria-pressed="game.notesMode"
      :disabled="game.completed"
      @click="game.toggleNotesMode"
    >
      <Pencil class="icon" aria-hidden="true" />
      <span>Notes</span>
      <span class="badge" aria-hidden="true">{{ game.notesMode ? 'ON' : 'OFF' }}</span>
    </button>
    <button type="button" class="control" :disabled="!game.canFillNotes" @click="game.fillNotes">
      <WandSparkles class="icon" aria-hidden="true" />
      <span>Fill notes</span>
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

/* Mouse and keyboard devices. */
@media (hover: hover) and (pointer: fine) {
  .control:hover:not(:disabled, .active) {
    background: var(--peer);
  }

  /* Icon left of the label, in the side panel or once four such buttons fit in a row. */
  @media (orientation: landscape) and (min-width: 600px), (min-width: 760px) {
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
  }

  /* The side panel is too narrow for inline labels in one row: a 2×2 grid. */
  @media (orientation: landscape) and (min-width: 600px) {
    .controls {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
