<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import GameControls from './components/GameControls.vue'
import NumberPad from './components/NumberPad.vue'
import SudokuBoard from './components/SudokuBoard.vue'
import { useGame } from './composables/useGame'
import { useInstall } from './composables/useInstall'
import { DIFFICULTIES, type Difficulty } from './lib/sudoku'

const game = useGame()
const { state, hasProgress } = game
const { canInstall, install } = useInstall()

const LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

const time = computed(() => {
  const m = Math.floor(state.elapsed / 60)
  const s = state.elapsed % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function startGame(difficulty: Difficulty) {
  const unfinished = hasProgress.value && !state.completed
  if (unfinished && !window.confirm(`Start a new ${LABELS[difficulty]} game? Your current progress will be lost.`)) {
    return
  }
  game.newGame(difficulty)
}

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    game.undo()
    return
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return

  // Use the physical key so Shift + digit still reads as a digit on every layout.
  const digit = /^(?:Digit|Numpad)([0-9])$/.exec(e.code)
  if (digit) {
    e.preventDefault()
    const d = Number(digit[1])
    if (d === 0) game.erase()
    else if (e.shiftKey) game.toggleNote(d)
    else game.input(d)
    return
  }

  if (e.key in ARROWS) {
    e.preventDefault()
    game.move(...ARROWS[e.key])
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault()
    game.erase()
  } else if (e.key.toLowerCase() === 'n') {
    game.toggleNotesMode()
  }
}

let timer: number | undefined

// The timer only runs while the tab is visible.
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') game.tick()
  }, 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.clearInterval(timer)
})
</script>


<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <h1>PepoGrid</h1>
        <p class="tagline">Your grid, your chill.</p>
      </div>
      <button v-if="canInstall" type="button" class="install" @click="install">Install</button>
      <nav class="difficulty" aria-label="Difficulty">
        <button
          v-for="d in DIFFICULTIES"
          :key="d"
          type="button"
          :class="{ current: state.difficulty === d }"
          :aria-current="state.difficulty === d"
          @click="startGame(d)"
        >
          {{ LABELS[d] }}
        </button>
      </nav>
    </header>

    <main class="game">
      <div class="status-area">
        <div class="status">
          <span>Mistakes: <strong>{{ state.mistakes }}</strong></span>
          <span class="timer" aria-label="Elapsed time">{{ time }}</span>
        </div>
        <div v-if="state.completed" class="win" role="status">
          <p>
            <strong>Solved!</strong> {{ LABELS[state.difficulty] }} in {{ time }} with {{ state.mistakes }}
            {{ state.mistakes === 1 ? 'mistake' : 'mistakes' }}.
          </p>
          <button type="button" @click="startGame(state.difficulty)">Play again</button>
        </div>
      </div>

      <div class="board-area">
        <SudokuBoard />
      </div>

      <GameControls class="controls-area" @new-game="startGame(state.difficulty)" />
      <NumberPad class="pad-area" />

      <p class="hints">
        <kbd>1</kbd>–<kbd>9</kbd> place · <kbd>Shift</kbd>+digit note · <kbd>N</kbd> notes mode ·
        <kbd>Del</kbd> erase · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · arrows move
      </p>
    </main>
  </div>
</template>

<style scoped>
/* Mobile first: compact header, board fills the free space, pad at the bottom. */
.app {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100dvh;
  max-width: 560px;
  margin: 0 auto;
  padding: max(10px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.brand {
  margin-right: auto;
}

.brand h1 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
}

.tagline {
  display: none;
  margin: 2px 0 0;
  color: var(--muted);
}

.install {
  padding: 5px 10px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.difficulty {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
}

.difficulty button {
  min-height: 34px;
  padding: 4px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.difficulty button.current {
  background: var(--accent);
  color: #fff;
}

.game {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto auto auto;
  grid-template-areas: 'status' 'board' 'controls' 'pad' 'hints';
  gap: 10px;
}

.status-area {
  grid-area: status;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-area {
  grid-area: board;
  container-type: size;
  display: flex;
  /* Keep the board under the status line; spare space sits above the controls. */
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
}

.controls-area {
  grid-area: controls;
}

.pad-area {
  grid-area: pad;
}

.status {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}

.status strong {
  color: var(--text);
}

.timer {
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.win {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--peer);
}

.win p {
  margin: 0;
}

.win button {
  flex-shrink: 0;
  min-height: 36px;
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  cursor: pointer;
}

/* Keyboard hints only for devices with a fine pointer (desktop). */
.hints {
  grid-area: hints;
  display: none;
  margin: 0;
  color: var(--muted);
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.8;
}

kbd {
  padding: 1px 5px;
  border: 1px solid var(--button-border);
  border-radius: 4px;
  background: var(--button-bg);
  font-family: inherit;
  font-size: 0.75rem;
}

@media (hover: hover) and (pointer: fine) {
  .hints {
    display: block;
  }

  .difficulty button:hover:not(.current) {
    background: var(--peer);
  }

  .install:hover {
    background: var(--peer);
  }
}

/* Landscape and wide screens: board on the left, everything else beside it. */
@media (orientation: landscape) and (min-width: 600px) {
  .app {
    max-width: 1100px;
  }

  .game {
    grid-template-columns: minmax(0, 1fr) clamp(240px, 32vw, 340px);
    grid-template-rows: 1fr auto auto auto auto 1fr;
    grid-template-areas:
      'board .'
      'board status'
      'board controls'
      'board pad'
      'board hints'
      'board .';
    column-gap: 24px;
    row-gap: 12px;
  }

  .board-area {
    align-items: center;
  }
}

/* Desktop-sized screens get the tagline and a roomier header. */
@media (min-width: 768px) and (min-height: 600px) {
  .app {
    gap: 16px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .brand h1 {
    font-size: 1.8rem;
  }

  .tagline {
    display: block;
  }
}
</style>
