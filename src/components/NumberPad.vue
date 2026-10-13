<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useGame, vibrate } from '../composables/useGame'

const LONG_PRESS_MS = 450

const { notesMode, input, toggleNote } = useGame()

let timer: number | undefined
let longPressed = false

// Long-press enters a note, the touch equivalent of Shift + digit.
function startPress(d: number) {
  longPressed = false
  cancelPress()
  timer = window.setTimeout(() => {
    longPressed = true
    toggleNote(d)
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
  input(d)
}

onBeforeUnmount(cancelPress)
</script>

<template>
  <div class="pad" :class="{ notes: notesMode }" role="group" aria-label="Number pad">
    <button
      v-for="d in 9"
      :key="d"
      type="button"
      class="digit"
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
  gap: 6px;
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
}

.digit:active {
  background: var(--selected);
}

.pad.notes .digit {
  color: var(--note);
  font-size: 1.05rem;
}

@media (hover: hover) {
  .digit:hover {
    background: var(--peer);
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
