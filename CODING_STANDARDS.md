# Coding standards

How code in this repo is written. Each rule describes what the code already does, with an example to copy. `/code-review` checks every diff against these rules. A breach is a hard violation, except for rules that say **prefer**, which are judgement calls.

ESLint and `vue-tsc` (strict, no unused locals or parameters) already enforce their own rules, so this file leaves them out.

A change that sets or changes a convention updates this file in the same change.

## Everywhere (`src/` and `scripts/`)

- **F1 Formatting.** No semicolons, single quotes, 2-space indent, trailing commas in multi-line lists. Long lines are fine; **prefer** to stay under about 140 characters. No formatter enforces this, so match the surrounding code.
- **F2 Doc comments.** Exported functions, types and constants, and any state whose meaning isn't obvious from its name, get a `/** */` comment that says what it is or holds, in one or two sentences ([grid.ts](src/lib/grid.ts), [game.ts](src/stores/game.ts) refs).
- **F3 Inline comments say why.** An inline comment explains a reason or a gotcha the code can't show ("Some browsers still send pointer events to a disabled button."), never a restatement of the next line.
- **F4 Named constants.** A tuning number or limit gets a `SCREAMING_CASE` constant at the top of its module (`HISTORY_LIMIT`, `LONG_PRESS_MS`, `MAX_RESULTS`). The grid's own sizes (9, 81) stay literal.
- **F5 File headers.** A module whose job isn't obvious from its name opens with a `/** */` header saying what it is and how it fits ([sudoku.ts](src/lib/sudoku.ts), [bank.ts](src/lib/bank.ts)). A runnable script's header also gives its usage line ([build-bank.ts](scripts/bank/build-bank.ts)).
- **F6 Shell scripts** start with `#!/usr/bin/env bash`, a comment with purpose and usage, and `set -euo pipefail` ([ci-wait.sh](scripts/ci-wait.sh)).
- **F7 Docs in sync.** A change to user-visible behaviour, keyboard keys, persisted storage or dev commands updates the matching README section (Features, Keyboard, Storage, Development) in the same change.

## App code (`src/` only)

### Layering

- **L1 `src/lib` is pure TypeScript.** It imports only from `src/lib` and touches no Vue, Pinia, `window` or `document`, so the bank scripts and the tests can use it directly.
- **L2 Each layer has one job.** `src/lib` holds Sudoku logic. `src/stores` holds the app state and the actions that change it. `src/composables` wraps browser APIs (theme, install prompt) for components. Components render and forward user input to store actions. Game rules live in the store or `src/lib`, not in a component.

### Grid model

- **G1 Grids are flat.** A grid is an 81-number array in row-major order, `0` for empty (`Grid` in [grid.ts](src/lib/grid.ts)). Persisted results store it as an 81-character string (`gridToString`).
- **G2 Digit sets are bitmasks.** Notes and candidates are masks where `bit(d)` (d in 1–9) marks digit `d`.
- **G3 Prefer the grid.ts helpers.** Use `PEERS`, `UNITS`, `ROWS`/`COLS`/`BOXES`, `rowOf`/`colOf`/`boxOf`, `popcount` and `digitsOf` instead of recomputing geometry or bit counts inline.

### Stores

- **S1 Setup stores.** Stores are Pinia setup stores: `defineStore('<id>', () => { ... return { ... } }, options)`.
- **S2 Persisted as `pepogrid.<id>`.** Persisted state is validated after loading, because a save can be missing, stale or hand-edited. Use `afterHydrate` to fall back to defaults ([settings.ts](src/stores/settings.ts)), or an `isValid()` check the app acts on ([game.ts](src/stores/game.ts)).
- **S3 Transient state is not persisted.** State that must not survive a reload (loading flags, animation triggers) goes in `persist.omit`.

### Components

- **C1 Shape.** Single-file components use `<script setup lang="ts">`, type-based `defineProps<{ ... }>()` and `defineEmits<{ ... }>()`, and `<style scoped>`. Global styles live only in [style.css](src/style.css).
- **C2 Theme tokens.** Colours come from the CSS custom properties defined in [style.css](src/style.css) (`var(--accent)`, `var(--text)`, …), so light and dark themes both work. A new colour becomes a new token defined for both themes. The one literal is a colour that stays the same in both themes, such as the switch knob's `#fff` ([SettingsMenu.vue](src/components/SettingsMenu.vue)).
- **C3 Reduced motion.** A keyframe animation, or a transition longer than a quick control feedback (about 0.15s), has a `@media (prefers-reduced-motion: reduce)` override that turns it off ([SudokuBoard.vue](src/components/SudokuBoard.vue) glow, [NumberPad.vue](src/components/NumberPad.vue) fade). Quick hover, chevron and switch transitions don't need one.
- **C4 Best-effort browser APIs.** Optional browser features fail silently: optional chaining and `try`/`catch` around the call, as in `vibrate` ([game.ts](src/stores/game.ts)). Listeners and timers a component adds are removed in `onBeforeUnmount`.

### Tests

- **T1 Colocated Vitest.** Tests sit beside their module as `<name>.test.ts`, grouped with `describe` per behaviour, and each `it` reads as a sentence about that behaviour.
- **T2 Through the public interface.** Store tests drive the actions a player triggers (`select`, `input`, `undo`) with a fresh Pinia from `setActivePinia(createPinia())` in `beforeEach`, and assert on store state ([game.test.ts](src/stores/game.test.ts)). Shared steps become small helpers in the test file (`place`, `solve`).
