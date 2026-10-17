<script setup lang="ts">
import { ChartColumn, Plus } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppDialog, { type DialogContent } from './components/AppDialog.vue'
import DifficultyMenu from './components/DifficultyMenu.vue'
import GameControls from './components/GameControls.vue'
import NumberPad from './components/NumberPad.vue'
import SettingsMenu from './components/SettingsMenu.vue'
import StatisticsView from './components/StatisticsView.vue'
import SudokuBoard from './components/SudokuBoard.vue'
import { useInstall } from './composables/useInstall'
import { useTheme } from './composables/useTheme'
import { HODOKU_LABELS, LABELS, TIERS, type Difficulty } from './lib/difficulty'
import { formatDuration } from './lib/statistics'
import { useGameStore } from './stores/game'
import { useResultsStore } from './stores/results'

const game = useGameStore()
const results = useResultsStore()
// First visit, or a save that's missing or corrupt: start a game.
if (!game.isValid()) loadGame('easy', { recordAbandoned: false })

useTheme()
const { canInstall, install } = useInstall()

/** Ratings of the current puzzle, shown only for the difficulties that display them. */
const shownRating = computed(() => (TIERS[game.difficulty].showRating ? game.rating : null))

/** True while Statistics stands in for the game: the timer and the board keys pause meanwhile. */
const statisticsOpen = ref(false)
const statisticsButton = ref<HTMLButtonElement | null>(null)

/** Opens Statistics, or goes back to the game; focus lands on the Statistics button either way. */
function toggleStatistics() {
  statisticsOpen.value = !statisticsOpen.value
  statisticsButton.value?.focus()
}

const statisticsView = ref<InstanceType<typeof StatisticsView> | null>(null)

/** Asks, then clears every result. `trigger` is the Reset button: focus returns there on cancel. */
async function resetStatistics(trigger: HTMLButtonElement | null) {
  const confirmed = await ask({
    title: 'Reset statistics?',
    message: 'Every solved and abandoned game will be forgotten. This can’t be undone.',
    confirmLabel: 'Reset',
    cancelLabel: 'Cancel',
  })
  if (!confirmed) {
    trigger?.focus()
    return
  }
  results.clear()
  // Reset is disabled once there is nothing to clear, so focus moves to Back.
  await nextTick()
  statisticsView.value?.focusBack()
}

/** The open dialog's content, and how to report the player's answer; null while no dialog is open. */
const prompt = ref<{ content: DialogContent; resolve: (confirmed: boolean) => void } | null>(null)

/** Opens the in-app dialog and resolves with whether the player confirmed. */
function ask(content: DialogContent) {
  return new Promise<boolean>((resolve) => {
    prompt.value = { content, resolve }
  })
}

async function closePrompt(confirmed: boolean) {
  const open = prompt.value
  prompt.value = null
  // Answer only once the dialog is gone: while it is open and modal, the page behind it can't take focus.
  await nextTick()
  open?.resolve(confirmed)
}

/** Deals a new game; on failure, says so and resolves false once the player has read it. */
async function loadGame(difficulty: Difficulty, options?: { recordAbandoned?: boolean }) {
  try {
    await game.newGame(difficulty, options)
    return true
  } catch (error) {
    console.error(error)
    await ask({ title: `Couldn't load a new ${LABELS[difficulty]} puzzle`, message: 'Check your connection and try again.', confirmLabel: 'OK' })
    return false
  }
}

const time = computed(() => formatDuration(game.elapsed))

/**
 * Deals a new game, asking first when that would lose progress. `from` is the button the player
 * used: focus returns there when they cancel or the load fails.
 */
async function startGame(difficulty: Difficulty, from: EventTarget | null) {
  // Passed in rather than read from document.activeElement: Safari doesn't focus a tapped button.
  const opener = from instanceof HTMLElement ? from : null
  const unfinished = game.hasProgress && !game.completed
  if (unfinished) {
    const confirmed = await ask({
      title: `Start a new ${LABELS[difficulty]} game?`,
      message: `Your current ${LABELS[game.difficulty]} game will be lost.`,
      confirmLabel: 'New game',
      cancelLabel: 'Cancel',
    })
    if (!confirmed) {
      opener?.focus()
      return
    }
  }
  // A fresh game starts on the board; after a failed load, the player is back where they tried from.
  if (await loadGame(difficulty)) board.value?.focus()
  else opener?.focus()
}

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

function onKeydown(e: KeyboardEvent) {
  // Focus can leave the dialog's buttons (a tap on its text lands on <body>), so check the dialog itself.
  if (prompt.value || statisticsOpen.value) return
  if (e.target instanceof Element && e.target.closest('[data-own-keys]')) return
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
  } else if (e.key.toLowerCase() === 'f' && !e.shiftKey) {
    game.fillNotes()
  }
}

/* Must match the side-by-side media query in the styles below. */
const SIDE_BY_SIDE = window.matchMedia('(orientation: landscape) and (min-width: 600px)')
const MIN_BOARD = 200

const appEl = ref<HTMLElement | null>(null)
const headerEl = ref<HTMLElement | null>(null)
const gameEl = ref<HTMLElement | null>(null)
const boardAreaEl = ref<HTMLElement | null>(null)
const board = ref<InstanceType<typeof SudokuBoard> | null>(null)

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
  // A hidden game measures as empty, so keep the size it had until it shows again.
  if (!app || !header || !main || !area || statisticsOpen.value) return
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
  // The timer only runs while the tab is visible and the board is on screen.
  timer = window.setInterval(() => {
    if (document.visibilityState === 'visible' && !statisticsOpen.value) game.tick()
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
      <SettingsMenu />
      <button
        ref="statisticsButton"
        type="button"
        class="icon-button"
        aria-label="Statistics"
        title="Statistics"
        :aria-pressed="statisticsOpen"
        :disabled="game.loading"
        @click="toggleStatistics"
      >
        <ChartColumn aria-hidden="true" />
      </button>
      <template v-if="!statisticsOpen">
        <button
          type="button"
          class="new-game icon-button"
          aria-label="New game"
          title="New game"
          :disabled="game.loading"
          @click="startGame(game.difficulty, $event.currentTarget)"
        >
          <Plus aria-hidden="true" />
        </button>
        <DifficultyMenu :current="game.difficulty" :disabled="game.loading" @select="startGame" />
      </template>
    </header>

    <StatisticsView
      v-if="statisticsOpen"
      ref="statisticsView"
      class="statistics-area"
      :current="game.difficulty"
      @back="toggleStatistics"
      @reset="resetStatistics"
    />

    <!-- Hidden rather than unmounted, so the board's element and the layout's observers outlive a look at Statistics. -->
    <main v-show="!statisticsOpen" ref="gameEl" class="game">
      <div class="status-area">
        <div class="status">
          <span>Mistakes: <strong>{{ game.mistakes }}</strong></span>
          <span v-if="shownRating" class="rating" title="Sudoku Explainer rating">SE {{ shownRating.se.toFixed(1) }}</span>
          <span class="timer" aria-label="Elapsed time">{{ time }}</span>
        </div>
        <div v-if="game.completed" class="win" role="status">
          <p>
            <strong>Solved!</strong> {{ LABELS[game.difficulty] }} in {{ time }} with {{ game.mistakes }}
            {{ game.mistakes === 1 ? 'mistake' : 'mistakes' }}.
            <span v-if="shownRating" class="win-rating">
              SE {{ shownRating.se.toFixed(1) }} · HoDoKu {{ shownRating.hodokuScore }}
              ({{ HODOKU_LABELS[shownRating.hodokuLevel] }}) · hardest: {{ shownRating.hardest }}
            </span>
          </p>
          <button type="button" :disabled="game.loading" @click="startGame(game.difficulty, $event.currentTarget)">Play again</button>
        </div>
      </div>

      <div ref="boardAreaEl" class="board-area">
        <SudokuBoard ref="board" />
      </div>

      <GameControls class="controls-area" />
      <NumberPad class="pad-area" />

      <p class="hints">
        <kbd>1</kbd>–<kbd>9</kbd> place · <kbd>Shift</kbd>+digit note · <kbd>N</kbd> notes mode ·
        <kbd>F</kbd> fill notes · <kbd>Del</kbd> erase · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · arrows move
      </p>
    </main>
  </div>

  <!-- Outside .app: a modal is no part of its column layout. -->
  <AppDialog v-if="prompt" v-bind="prompt.content" @close="closePrompt" />
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
  /* Room below the status bar too: at just the inset, the header touches the iPhone's Dynamic Island area. */
  padding: calc(env(safe-area-inset-top) + 12px) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
}

/* The header and the game only: a bare `> *` would also size any child component's root, such as a dialog. */
.app > :is(.topbar, .game) {
  flex-shrink: 0;
  width: var(--board-size, 100%);
}

/* Statistics takes the rest of the height and scrolls inside it, under a header that stays put. */
.statistics-area {
  flex: 1;
  min-height: 0;
  width: var(--board-size, 100%);
  overflow-y: auto;
}

.topbar {
  position: relative;
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

.icon-button[aria-pressed='true'] {
  border-color: var(--accent);
  color: var(--accent);
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

.rating {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.win-rating {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.85rem;
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
  color: var(--on-accent);
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

  .app > :is(.topbar, .game) {
    width: auto;
  }

  .statistics-area {
    align-self: center;
    width: min(100%, 640px);
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

/* Desktop-sized screens get the tagline and a roomier header. AppDialog.vue widens at the same query. */
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

/*
 * Since iOS 26, the installed app on iPhone and iPad gets a blur over its top edge, stronger on iOS 27,
 * with no switch to turn it off. The header sits below it: about 40pt of blur plus 8px of room.
 * At least 600px tall: an iPhone in portrait, an iPad either way. An iPhone in landscape has no
 * status bar, so no blur. Last, so it also wins over the desktop-sized query on an iPad.
 */
@media (display-mode: standalone) and (min-height: 600px) {
  @supports (-webkit-touch-callout: none) {
    .app {
      padding-top: calc(env(safe-area-inset-top) + 48px);
    }
  }
}
</style>
