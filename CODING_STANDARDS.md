# Coding standards

How code in this repo is written. Each rule describes what the code already does, with an example to copy. `/code-review` checks every diff against these rules. A breach is a hard violation, except for rules that say **prefer**, which are judgement calls.

Rules a tool can check live in the tool, not here: [eslint.config.js](eslint.config.js) (house formatting, and what `src/lib` may import and which browser globals it may not touch), `vue-tsc` (strict, no unused locals or parameters), shellcheck (`scripts/*.sh`, in CI) and [test-seeds.sh](scripts/test-seeds.sh) (changed tests pass under 20 fixed seeds, in CI).

A change that sets or changes a convention updates this file in the same change. A review flags a new convention that the diff introduces without an entry here.

## Everywhere (`src/` and `scripts/`)

- **F1 Line length.** Long lines are fine.
- **F2 Doc comments.** An export or a piece of state whose name doesn't say what it is or holds gets a `/** */` comment that does, in one or two sentences (`PEERS` and `firstDigit` in [grid.ts](src/lib/grid.ts), the refs in [game.ts](src/stores/game.ts)). Self-explanatory names such as `rowOf` or `bit` go without one.
- **F3 Inline comments say why.** An inline comment explains a reason or a gotcha the code can't show ("Some browsers still send pointer events to a disabled button."), never a restatement of the next line.
- **F4 Named constants.** A tuning number or limit gets a `SCREAMING_CASE` constant at the top of its module (`HISTORY_LIMIT`, `LONG_PRESS_MS`, `MAX_RESULTS`). The grid's own sizes (9, 81) stay literal. A limit that both a store and `src/lib` read lives in `src/lib`, and the store imports it (`MAX_RESULTS` in [statistics.ts](src/lib/statistics.ts)).
- **F5 File headers.** A module whose job isn't obvious from its name opens with a header comment (`/** */`, or `//` in a plain `.mjs` script) saying what it is and how it fits ([sudoku.ts](src/lib/sudoku.ts), [bank.ts](src/lib/bank.ts)). A runnable script's header also gives its usage line ([build-bank.ts](scripts/bank/build-bank.ts)).
- **F6 Shell scripts** open with `#!/usr/bin/env bash`, then a comment with purpose and usage, then `set -euo pipefail` ([ci-wait.sh](scripts/ci-wait.sh)).
- **F7 Docs in sync.** A change to user-visible behaviour, keyboard keys, persisted storage or dev commands updates the matching README section (Features, Keyboard, Storage, Development) in the same change.

## App code (`src/` only)

### Layering

- **L1 Each layer has one job.** `src/lib` holds Sudoku logic as pure TypeScript, so the bank scripts and the tests use it directly. `src/stores` holds the app state and the actions that change it. `src/composables` wraps browser APIs (theme, install prompt) for components. Components render and forward user input to store actions. Game rules live in the store or `src/lib`, not in a component.

### Grid model

- **G1 Grids are flat.** A grid is an 81-number array in row-major order, `0` for empty (`Grid` in [grid.ts](src/lib/grid.ts)). Persisted results store it as an 81-character string (`gridToString`).
- **G2 Digit sets are bitmasks.** Notes and candidates are masks where `bit(d)` (d in 1–9) marks digit `d`.
- **G3 Prefer the grid.ts helpers.** Use `PEERS`, `UNITS`, `ROWS`/`COLS`/`BOXES`, `rowOf`/`colOf`/`boxOf`, `unitsOf`, `popcount` and `digitsOf` instead of recomputing geometry or bit counts inline.

### Stores

- **S1 Setup stores.** Stores are Pinia setup stores: `defineStore('<id>', () => { ... return { ... } }, options)`.
- **S2 Persisted as `pepogrid.<id>`.** Persisted state is validated after loading, because a save can be missing, stale or hand-edited. Use `afterHydrate` to fall back to defaults ([settings.ts](src/stores/settings.ts)), or an `isValid()` check the app acts on ([game.ts](src/stores/game.ts)).
- **S3 Transient state is not persisted.** State that must not survive a reload (loading flags, animation triggers) goes in `persist.omit`.

### Components

- **C1 Shape.** Single-file components use `<script setup lang="ts">`, type-based `defineProps<{ ... }>()` and `defineEmits<{ ... }>()`, and `<style scoped>`. Global styles live only in [style.css](src/style.css).
- **C2 Theme tokens.** Colours come from the CSS custom properties defined in [style.css](src/style.css) (`var(--accent)`, `var(--text)`, …), so light and dark themes both work. A new colour becomes a new token defined for both themes. Literal colours are only for values that stay the same in both themes, such as the switch knob's `#fff` and its shadow ([SettingsMenu.vue](src/components/SettingsMenu.vue)).
- **C3 Reduced motion.** A keyframe animation, or a transition longer than a quick control feedback (about 0.15s), has a `@media (prefers-reduced-motion: reduce)` override that turns it off ([SudokuBoard.vue](src/components/SudokuBoard.vue) glow, [NumberPad.vue](src/components/NumberPad.vue) fade). Quick hover, chevron and switch transitions don't need one.
- **C4 Best-effort browser APIs.** Optional browser features fail silently: optional chaining and `try`/`catch` around the call, as in `vibrate` ([game.ts](src/stores/game.ts)). Listeners and timers a component adds are removed in `onBeforeUnmount`.
- **C5 Props objects.** When a parent builds a component's props as one object, the component exports their type as an interface and passes it to `defineProps`, and the parent hands the object over with `v-bind` (`DialogContent` in [AppDialog.vue](src/components/AppDialog.vue), bound in [App.vue](src/App.vue)).
- **C6 Shared looks.** A look several components share is one class in [style.css](src/style.css), and each component's scoped style adds only its own states (`.icon-button`, used by the header's settings, statistics and New game buttons; `.surface`, the same bordered box for the views' Back buttons, Statistics' Reset button and cards, with `button.surface` giving those buttons their height and disabled look; `.view`, `.view-heading` and `.back-button`, the column, title row and Back button of each view that stands in for the game; `.stat-value`, a Statistics figure's bold, even-width digits).
- **C7 Exposed methods.** A parent that must act on a child's element calls a method the child exposes with `defineExpose`, rather than reaching into its DOM (`focus` in [SudokuBoard.vue](src/components/SudokuBoard.vue)).
- **C8 Dialogs.** Every prompt or message goes through [AppDialog.vue](src/components/AppDialog.vue), never `window.confirm` or `alert`, which the installed iOS app may not show ([ios-installed-app.md](docs/ios-installed-app.md)). AppDialog only takes focus when it opens. The code that opens it gives focus back when it closes, to the element the player used, passed in rather than read from `document.activeElement`, because Safari doesn't focus a tapped button (`startGame`'s `from` in [App.vue](src/App.vue), the trigger in `DifficultyMenu`'s `select` event).
- **C9 Views over the game.** A view that stands in for the game (Statistics, the key technique) is swapped in by the one `view` flag in [App.vue](src/App.vue), with no router. The game stays mounted under `v-show`, so the board and the layout's observers survive, and the game's timer, board keys and `fitBoard` each check the flag. The button that opens the view is disabled while a puzzle loads, so no game is dealt behind it.
- **C10 Missing figures.** `src/lib/statistics.ts` returns `null` for a figure it can't compute (no solved result, no abandon), never `0`. The view shows it as "—" through `shown` in [StatisticsView.vue](src/components/StatisticsView.vue), so a missing figure isn't read as zero.

### Tests

- **T1 Vitest layout.** `src/lib` is tested from one file, [sudoku.test.ts](src/lib/sudoku.test.ts), with a `describe` per module or behaviour. Tests of a store's or component's own behaviour (its state, rendering, keys, emitted events) sit beside it as `<name>.test.ts` ([game.test.ts](src/stores/game.test.ts), [SudokuBoard.test.ts](src/components/SudokuBoard.test.ts)); [App.test.ts](src/App.test.ts) covers only how App wires components together. Each `it` reads as a sentence about the behaviour.
- **T2 Through the public interface.** Store tests drive the actions a player triggers (`select`, `input`, `undo`) with a fresh Pinia from `setActivePinia(createPinia())` in `beforeEach`, and assert on store state ([game.test.ts](src/stores/game.test.ts)). Shared steps become small helpers in the test file (`solve`), or in [testing.ts](src/stores/testing.ts) when the store and component tests both use them (`fill`, `nonGivensOf`, `quietRow`). A helper that builds a record fills it with plausible defaults and takes a `Partial` of fields to override, so each test states only the fields it checks (`seedResult`, the `solved`/`abandoned` builders in [sudoku.test.ts](src/lib/sudoku.test.ts)). Tests may play whatever random puzzle `newGame` deals: [test-setup.ts](src/test-setup.ts) seeds `Math.random` per test, so pick cells by what the test needs (`quietRow`) rather than mocking randomness again.
- **T3 Component tests.** A component test opens with `// @vitest-environment happy-dom`, so the rest stay in Node. It mounts the component with `@vue/test-utils`, passing the test's Pinia as a plugin, drives the store as a player would, and asserts on what the player or a screen reader gets: classes and `aria-label`s. `enableAutoUnmount(afterEach)` keeps one test's component from reacting to the next one's store ([SudokuBoard.test.ts](src/components/SudokuBoard.test.ts)). happy-dom leaves out three focus rules a browser applies: `autofocus` in `showModal()`, the inert page behind an open modal `<dialog>`, and a disabled button losing focus. A change to focus is also checked in a real browser with the `drive-app` skill, which leaves a `drive-app:` line in the branch file's spec; a review flags the check as missing only when that line is absent.
- **T4 Device checks.** A change for the installed iOS app is checked against [ios-installed-app.md](docs/ios-installed-app.md), which also says what can be checked off-device. Whatever only shows on an iPhone or iPad gets a `device-check:` line in the branch file's spec, naming what to look at and how to get the new version: `device-check: header sharp below the status bar, iPhone portrait; after deploy, launch, close from the app switcher, launch again`. A review flags the check as missing only when that line is absent.
