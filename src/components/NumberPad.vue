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
  // A tap in the gap beside a complete digit lands on its slot, not its disabled button.
  if (game.completeDigits.has(d)) return
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
    <!-- The slot spreads each digit's tap area over half the gap beside it, so a tap between digits lands on the nearer one. -->
    <div
      v-for="d in 9"
      :key="d"
      class="slot"
      @pointerdown="startPress(d)"
      @pointerup="cancelPress"
      @pointerleave="cancelPress"
      @pointercancel="cancelPress"
      @contextmenu.prevent
      @click="onClick(d)"
    >
      <button type="button" class="digit" :disabled="game.completeDigits.has(d)">{{ d }}</button>
    </div>
  </div>
</template>

<style scoped>
.pad {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  /* 4px between digits, not 6px: at 200% text the digits are as wide as the board allows, and the extra 16px keeps the pad inside it. */
  gap: 6px 4px;
}

/* Each slot grows over half the gap on each side (margin) and pads its digit back to its own cell, so the digit keeps its size and the slots meet mid-gap. The pad's outer edges stay put. */
.slot {
  margin: 0 -2px;
  padding: 0 2px;
}

.slot:first-child {
  margin-left: 0;
  padding-left: 0;
}

.slot:last-child {
  margin-right: 0;
  padding-right: 0;
}

.digit {
  width: 100%;
  /* Block, so the slot has no line box to grow taller than its digit. */
  display: block;
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

/* The gap beside a digit is clickable too, so it shows the same cursor. */
.slot {
  cursor: pointer;
}

.slot:has(.digit:disabled) {
  cursor: default;
}

/* A complete digit: every cell that needs it holds it. */
.digit:disabled {
  opacity: 0.35;
  color: var(--note);
  cursor: default;
}

.slot:active .digit:not(:disabled) {
  background: var(--selected);
}

.pad.notes .digit {
  color: var(--note);
  font-size: 1.05rem;
}

@media (hover: hover) {
  .slot:hover .digit:not(:disabled) {
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

  /* 8px between digits in both directions: 4px of reach each side. */
  .slot {
    margin: -4px;
    padding: 4px;
  }

  .slot:nth-child(3n + 1) {
    margin-left: 0;
    padding-left: 0;
  }

  .slot:nth-child(3n) {
    margin-right: 0;
    padding-right: 0;
  }

  .slot:nth-child(-n + 3) {
    margin-top: 0;
    padding-top: 0;
  }

  .slot:nth-child(n + 7) {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .digit {
    height: clamp(40px, 9dvh, 64px);
  }
}
</style>
