<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

/* Must match the side-by-side media query in the styles below. */
const SIDE_BY_SIDE = window.matchMedia('(orientation: landscape) and (min-width: 600px)')
const MIN_BOARD = 200

const appEl = ref<HTMLElement | null>(null)
const headerEl = ref<HTMLElement | null>(null)
const gameEl = ref<HTMLElement | null>(null)
const boardAreaEl = ref<HTMLElement | null>(null)

/**
 * Stacked layout: sizes the board to the largest square that leaves room for
 * everything else, and exposes it as --board-size so the column matches it.
 * The side-by-side layout sizes the board in CSS instead.
 */
function fitBoard() {
  const app = appEl.value
  const header = headerEl.value
  const main = gameEl.value
  const area = boardAreaEl.value
  if (!app || !header || !main || !area) return
  if (SIDE_BY_SIDE.matches) {
    app.style.removeProperty('--board-size')
    return
  }
  const cs = getComputedStyle(app)
  const width = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  const height = app.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
  // Other items can rewrap at the new width, so settle over a couple of passes.
  for (let pass = 0; pass < 3; pass++) {
    const others = header.offsetHeight + parseFloat(cs.rowGap) + main.offsetHeight - area.offsetHeight
    const size = Math.floor(Math.max(MIN_BOARD, Math.min(width, height - others)))
    const value = `${size}px`
    if (app.style.getPropertyValue('--board-size') === value) break
    app.style.setProperty('--board-size', value)
  }
}

let timer: number | undefined
let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // The timer only runs while the tab is visible.
  timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') game.tick()
  }, 1000)

  // Refit when the window resizes or content changes height (win banner, install button).
  resizeObserver = new ResizeObserver(fitBoard)
  for (const el of [appEl.value, headerEl.value, gameEl.value]) if (el) resizeObserver.observe(el)
  SIDE_BY_SIDE.addEventListener('change', fitBoard)
  fitBoard()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.clearInterval(timer)
  resizeObserver?.disconnect()
  SIDE_BY_SIDE.removeEventListener('change', fitBoard)
})
</script>

<template>
  <div ref="appEl" class="app">
    <header ref="headerEl" class="topbar">
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

    <main ref="gameEl" class="game">
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

      <div ref="boardAreaEl" class="board-area">
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
/*
 * Stacked layout (default): one column, as wide as the board, with the board
 * sized by fitBoard() to fill the free height and controls right below it.
 */
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100dvh;
  padding: max(10px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}

.app > * {
  flex-shrink: 0;
  width: var(--board-size, 100%);
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
  display: flex;
  flex-direction: column;
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
  display: flex;
  align-items: center;
  justify-content: center;
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
    align-items: stretch;
    max-width: 1100px;
    margin: 0 auto;
  }

  .app > * {
    width: auto;
  }

  .game {
    flex: 1;
    min-height: 0;
    display: grid;
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
    /* The board fills the largest square of its cell. */
    container-type: size;
    min-height: 0;
    --board-size: min(100cqw, 100cqh, 640px);
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
