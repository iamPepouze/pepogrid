<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import GameControls from './components/GameControls.vue'
import NumberPad from './components/NumberPad.vue'
import SudokuBoard from './components/SudokuBoard.vue'
import { useGame } from './composables/useGame'
import { DIFFICULTIES, type Difficulty } from './lib/sudoku'

const game = useGame()
const { state, hasProgress } = game

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
    <header class="brand">
      <h1>PepoGrid</h1>
      <p class="tagline">Your grid, your chill.</p>
    </header>

    <main class="game">
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

      <SudokuBoard />
      <GameControls @new-game="startGame(state.difficulty)" />
      <NumberPad />

      <p class="hints">
        <kbd>1</kbd>–<kbd>9</kbd> place · <kbd>Shift</kbd>+digit note · <kbd>N</kbd> notes mode ·
        <kbd>Del</kbd> erase · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · arrows move
      </p>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 24px 16px 32px;
}

.brand {
  text-align: center;
  margin-bottom: 20px;
}

.brand h1 {
  margin: 0;
  font-size: 2.2rem;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 4px 0 0;
  color: var(--muted);
}

.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.difficulty {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
}

.difficulty button {
  padding: 6px 16px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.difficulty button:hover:not(.current) {
  background: var(--peer);
}

.difficulty button.current {
  background: var(--accent);
  color: #fff;
}

.status {
  display: flex;
  justify-content: space-between;
  width: var(--board-size);
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
  width: var(--board-size);
  padding: 10px 14px;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: var(--peer);
}

.win p {
  margin: 0;
}

.win button {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.hints {
  max-width: var(--board-size);
  margin: 4px 0 0;
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
</style>
