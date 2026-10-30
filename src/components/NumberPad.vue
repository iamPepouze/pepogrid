<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useGameStore, vibrate } from '../stores/game'

const LONG_PRESS_MS = 450

const { t } = useI18n()
const game = useGameStore()

let timer: number | undefined
let longPressed = false

// Long-press enters a note, the touch equivalent of Shift + digit.
function startPress(d: number) {
  longPressed = false
  cancelPress()
  // Some browsers still send pointer events to a disabled button.
  if (game.completeDigits.has(d)) return
  timer = window.setTimeout(() => {
    longPressed = true
    game.toggleNote(d)
    vibrate(15)
  }, LONG_PRESS_MS)
}

function cancelPress() {
  window.clearTimeout(timer)
}

function onClick(d: number) {
  cancelPress()
  if (longPressed) {
    longPressed = false
    return
  }
  game.input(d)
}

onBeforeUnmount(cancelPress)
</script>

<template>
  <div class="pad" :class="{ notes: game.notesMode }" role="group" :aria-label="t.numberPad">
    <button
      v-for="d in 9"
      :key="d"
      type="button"
      class="digit"
      :disabled="game.completeDigits.has(d)"
      @pointerdown="startPress(d)"
      @pointerup="cancelPress"
      @pointerleave="cancelPress"
      @pointercancel="cancelPress"
      @contextmenu.prevent
      @click="onClick(d)"
    >
      {{ d }}
    </button>
  </div>
</template>

<style scoped>
.pad {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  /* 4px between digits: at 200% text the digits' own width leaves a pad the height-fitted board squeezes no room for 6px. */
  gap: 6px 4px;
}

.digit {
  height: clamp(44px, 7.5dvh, 60px);
  padding: 0;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--user-digit);
  font: inherit;
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
  -webkit-touch-callout: none;
  transition:
    opacity 0.8s ease,
    color 0.8s ease;
}

/* A complete digit: every cell that needs it holds it. */
.digit:disabled {
  opacity: 0.35;
  color: var(--note);
  cursor: default;
}

.digit:active:not(:disabled) {
  background: var(--selected);
}

.pad.notes .digit {
  color: var(--note);
  font-size: 1.05rem;
}

@media (hover: hover) {
  .digit:hover:not(:disabled) {
    background: var(--peer);
  }
}

@media (prefers-reduced-motion: reduce) {
  .digit {
    transition: none;
  }
}

@media (orientation: landscape) and (min-width: 600px) {
  .pad {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .digit {
    height: clamp(40px, 9dvh, 64px);
  }
}
</style>
