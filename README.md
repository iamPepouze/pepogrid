# PepoGrid

*Your grid, your chill.*

A mobile-first Sudoku progressive web app (PWA) built with Vue 3, TypeScript and Vite. It installs to the home screen and plays offline.

**Play it at [iampepouze.github.io/pepogrid](https://iampepouze.github.io/pepogrid/).**

## Features

- **Five difficulties** with ratings from two community-standard tools: [Sudoku Explainer](https://github.com/SudokuMonster/SukakuExplainer) 1.2.1 (SE) and [HoDoKu](https://hodoku.sourceforge.net/). SE decides the difficulty, and HoDoKu's level must match it, or the puzzle isn't used.

  | Difficulty | SE rating | HoDoKu level | Typical hardest technique |
  | --- | --- | --- | --- |
  | Easy | 1.0–1.5 | Easy | hidden singles |
  | Medium | 1.6–2.6 | Medium | naked singles, pointing |
  | Hard | 2.7–4.2 | Hard | X-Wing, Swordfish, XY-Wing |
  | Expert | 4.3–6.5 | Unfair | uniqueness, quads, APE, short chains |
  | Master | 6.6–8.0 | Extreme | forcing chains and cycles |

  Puzzles come from a bundled bank of 1000 per difficulty, rated offline by the real tools. Each game disguises its puzzle with a random digit relabelling, row/column shuffles and transposition, and a difficulty's puzzles don't repeat until all have been played. Expert and Master show the SE rating in the status bar, and the full ratings once solved.
- **Notes (pencil marks).** Use the *Notes* button or press `N` to toggle notes mode. To add a single note, press `Shift` + digit, or long-press a number pad button on touch screens. Placing a number clears that digit from the notes in its row, column and box.
- **Fill notes.** The *Fill notes* button or `F` replaces every empty cell's notes with the digits not yet placed in its row, column or box, wrong ones included, so it gives nothing away. One Undo brings back the notes you had. The button greys out when it would change nothing.
- **Key technique.** The *Technique* button swaps the game for the key technique, which has two tabs. It opens on *Next step*: the easiest technique that makes progress from your digits and notes, found each time you open it, never with its cells or digit. A cell without notes counts as holding every digit its row, column and box allow. When a digit isn't the solution's, or a cell's notes leave out its solution, it says your grid has a mistake instead, without saying where. When the next step needs a technique beyond XY-Wing (possible on Expert and Master), it says so. *Hardest* names the hardest technique this puzzle needs. Each tab asks first the first time in a game, through an in-app dialog, since each is noted on the game's result: every opening of the view counts as one look at the next step, and opening *Hardest* marks the key technique as revealed. After that they open straight away, also after a refresh. *Back* returns to the game as it was. Below the name, a lesson explains the technique's family and steps through a real example (*Previous* / *Next*), with the cells that matter highlighted and the rest faded. The family's other sections follow, collapsed, to open on demand. Every technique in the banks has a lesson: singles, direct hidden pairs and triplets, pointing and claiming, naked and hidden subsets up to the naked quad, X-Wing and Swordfish, XY- and XYZ-Wing, unique rectangles and loops, BUG, aligned pair and triplet exclusion, the Turbot Fish and bidirectional X-, Y- and mixed cycles, and forcing X-Chains, forcing chains and Nishio forcing chains, each chain stepped through one link at a time. The button is disabled while a puzzle loads and once the game is solved.
- **Error checking.** Digits that don't match the solution are shown in red. Cells that clash in a row, column or box are tinted red. A mistake counter tracks wrong entries.
- **Timer, Undo, Erase.** The timer shows mm:ss, or h:mm:ss from one hour, as Statistics does. It pauses while the tab is hidden or Statistics or the key technique is open.
- **Auto-save.** The game in progress, including the selected cell, notes mode and undo history, is saved after every change. A browser refresh resumes exactly where you were.
- **Results history.** Solved games are recorded, and so are games abandoned by starting a new one while at least one placed digit is on the board (notes alone, or digits all erased or undone, don't count, though starting over still asks first). Each record has the difficulty, outcome, start/end time, time played, mistakes, progress %, the puzzle, solution and final board, its ratings (SE, HoDoKu score and level, hardest technique), how many times the next step was shown, and whether the key technique was revealed. The 1000 most recent are kept.
- **Statistics.** The chart button in the header swaps the game for Statistics; *Back*, or the chart button again, returns to the game as it was. A summary counts games played, solved and abandoned and the solve rate across every difficulty, and a tab per difficulty, opening on the one being played, gives that difficulty's counts and more: best and average solve time, average mistakes, flawless solves, solves with the key technique revealed and solves that used the next step, current and best streak, SE rating and HoDoKu score (average and range, on every difficulty), average progress of abandoned games, solved of played per technique family, with how many of those solves revealed the key technique or used the next step, each on its own line under the count (not on Easy), and the 10 most recent games. Figures that need a solved game show a dash until there is one. Once 1000 games are stored, the summary says the figures cover only those. *Reset statistics*, at the bottom, asks first and then forgets every stored game; the order puzzles are dealt in carries on. While Statistics is open, the board's keys, *New game* and the difficulty menu are set aside; while a puzzle loads, the chart button waits for it.
- **New game.** The *+* button in the header, next to the difficulty menu, deals a new puzzle at the current difficulty; picking a difficulty deals one at that difficulty. If the game in progress has a digit or a note, an in-app dialog asks first. Cancel, `Esc` or a tap outside it keeps the game.
- **Mobile-first layout.** On phones, a compact header sits above the board, with controls and the number pad at the bottom. In the installed app, the header sits clear of the device's status bar, and on iPhone and iPad also clear of the blur iOS draws below it. In landscape and on wide screens, the board sits beside the controls. Keyboard hints show only on devices with a mouse.
- **Matching numbers.** Selecting a filled cell tints the other cells with the same digit and emphasizes that digit in notes. This can be turned off in the gear menu (*Highlight matching numbers*).
- **Complete digits.** Once a digit sits in every cell that needs it, its number pad button greys out and stops responding, keyboard key included. Wrong copies don't count. Placing the last one clears any leftover notes of that digit and sends a soft glow across its cells, unless the device asks for reduced motion. Undo or Erase brings the button back.
- **Complete units.** Once a row, column or box holds the right digit in all nine cells, the same glow runs across it and its placed digits turn from blue to the givens' color as the glow reaches them, so blue marks only what is still in progress. Those cells then lock like givens; only Undo reopens them, and it also stops any glow still running. A placement that completes several units and a digit at once sends a single glow across all of them.
- **English, French and German.** The app opens in the first of the device's preferred languages it supports (regional variants such as fr-CA or de-CH count as French and German), and in English when it supports none. The *Language* group, first in the gear menu, picks English, Français or Deutsch instead; *System* follows the device and says which language it gives. Picking a language reloads the app, which keeps the game in progress; an open Statistics or key technique closes. The page declares its language before the first paint. The game screen is translated (header, difficulty names, board, controls, number pad, status bar, *Solved!* banner, new game and load-failure dialogs, keyboard hints, numbers and the screen-reader names) and so is Statistics (labels, technique families, percentages, decimals, recent-game dates and the reset dialog, all in the app's language, not the device's), and the key technique (its view, tabs, messages and first-look confirmations, and the technique names, here and in the *Solved!* banner: the basic subsets and singles are named as French and German players call them, patterns such as X-Wing stay in English, and HoDoKu's level names stay English). The Singles and Naked Single lessons are translated, captions included; any other lesson shows in English under a note in the player's language, until its own ticket translates it; the rest follows ticket by ticket. SE ratings use the language's decimal mark.
- **Light, dark or system theme.** Choose it from the gear menu in the header. *System* (the default) follows the device setting. The choice is saved, and the title/status bar color follows the theme.
- **Haptics.** The phone gives a short vibration on a mistake (Android only; iOS doesn't support web vibration).
- **Installable PWA.** Works offline. An *Install* button appears in the header when the browser supports it (Chrome, Edge, Android). On iOS, use Share → Add to Home Screen. Updates download in the background, also when the app comes back from the background. An *Update* button then appears in the header and loads the new version at once, keeping the game in progress. Left alone, the update applies once the app has been fully closed and launched again.

## Keyboard

| Key | Action |
| --- | --- |
| `1`–`9` | Place a digit (or a note, in notes mode) |
| `Shift` + `1`–`9` | Toggle a note |
| `N` | Toggle notes mode |
| `F` | Fill notes |
| `Backspace` / `Delete` / `0` | Erase cell |
| `Ctrl` + `Z` | Undo |
| Arrow keys | Move selection |

On Statistics and the key technique, the board keys do nothing. On Statistics, `←` / `→`, `Home` and `End` move between the difficulty tabs. On the key technique, they move between its tabs, and `Enter` or `Space` opens one. In the gear menu, the arrow keys move between the Language options without picking one, since a pick reloads the app; `Enter` or `Space` picks.

## Storage

State lives in [Pinia](https://pinia.vuejs.org/) stores, saved to `localStorage` by `pinia-plugin-persistedstate`:

| Key | Store | Contents |
| --- | --- | --- |
| `pepogrid.settings` | [settings](src/stores/settings.ts) | Preferences (language, theme, matching-number highlight) |
| `pepogrid.game` | [game](src/stores/game.ts) | The game in progress, including how many times its next step was shown and whether its key technique was revealed |
| `pepogrid.results` | [results](src/stores/results.ts) | Finished and abandoned games, newest last |

Grids in results are 81-character strings in row-major order, with `0` for an empty cell.

## Puzzle bank

The bank lives in `src/data/bank-<difficulty>.json`. Each entry is `[puzzle, SE rating, HoDoKu score, hardest technique]`. To rebuild it (needs Java 17+):

```sh
node scripts/bank/setup-tools.mjs        # download SukakuExplainer and HoDoKu into tools/ (gitignored)
npx tsx scripts/bank/build-bank.ts 1000  # generate, rate and file 1000 puzzles per difficulty (resumable)
npx tsx scripts/bank/calibrate.ts 2000   # check the built-in rater against the real tools
```

Candidates are pre-filtered by a built-in rater ([src/lib/rater.ts](src/lib/rater.ts)). It emulates SE exactly up to 4.2 and HoDoKu up to XYZ-Wing, and the real tools decide what goes into the bank. A build takes one to two hours, mostly spent finding Expert puzzles: random puzzles in the SE 4.3–6.5 range are almost always HoDoKu *Hard* rather than *Unfair*.

## Lessons

The key technique's lessons live in [src/lib/lessons.ts](src/lib/lessons.ts): one per technique family, with a section per technique. Their prose and steps are written by hand, in English. The steps' cells, marks and eliminations are defined there once; a translation (`src/locales/lessons-fr.ts`, `lessons-de.ts`) holds only the words, in the same order of sections, examples and steps, so it can't change what a step points at. A family a language hasn't translated shows in English under a note. Each example's position comes from a real bank puzzle, just before Sudoku Explainer applies the technique, and is saved in `src/data/lesson-positions.json`. To add or replace one (after `setup-tools.mjs`, as above):

```sh
npx tsx scripts/bank/lesson-positions.ts "Hidden Single" hidden-single     # save the first Hidden Single step as `hidden-single`
npx tsx scripts/bank/lesson-positions.ts "Hidden Single" hidden-single 5   # skip 5 matches to try another position
```

The script prints what to write the steps from: Sudoku Explainer's summary (e.g. `X-Wing: Cells r3c4,r3c7,r6c4,r6c7: 8 in 2 columns and 2 rows`), its explanation, and what the step does (`Places: nothing`, `Removes: r3c6-8, r3c9-8, …`), which become a step's `placement` and `eliminations`. A direct technique (Direct Hidden Pair, Direct Pointing, …) removes nothing and goes straight to its single, so its lesson strikes the candidates the pattern rules out by hand, to show why the single follows. A test checks every step against the puzzle's solution, and checks each of a step's `sources` (the placed digits its caption rests on) is where the step says. It can't read the caption itself, so read the lesson in the app before committing it.

## Development

```sh
npm ci             # install the exact locked dependencies, as CI does
npm run dev        # start the dev server at http://localhost:5173/pepogrid/
npm run lint       # lint the code with ESLint, house formatting included
npm run contrast   # check the theme colours' contrast against WCAG (UX_STANDARDS.md)
npm test           # run the tests
npm run build      # type-check and build to dist/ (includes the service worker)
npm run preview    # serve the production build to test the PWA locally
```

Each test draws its random puzzles from a fresh seed. A failing test's error ends with `Replay this test with TEST_SEED=<n>`; replay it with the same puzzles by running `TEST_SEED=<n> npm test` in Bash, or `$env:TEST_SEED=<n>; npm test` in PowerShell. A test that passes only for some puzzles is caught by [scripts/test-seeds.sh](scripts/test-seeds.sh), which reruns the tests related to files changed since `origin/main` under seeds 1–20 (`bash scripts/test-seeds.sh`, about 40 seconds).

If a script fails because `vitest`, `vue-tsc` or `eslint` is "not recognized" or "not found", `node_modules` is likely incomplete: run `npm ci` to reinstall it from the lockfile.

Dependency install scripts run only when `allowScripts` in [package.json](package.json) approves them, and [.npmrc](.npmrc) makes an unreviewed one fail the install. Both scripts in the tree are denied: esbuild's only re-fetches or relinks the native binary its optional `@esbuild/<platform>` package already installs, and fsevents (macOS only) rebuilds a binary the package already ships. The policy needs the npm version set in `devEngines`, which recent Node 24 releases bundle; older npm ignores `allowScripts` and runs every script. After adding a dependency that has an install script, run `npm install-scripts approve <pkg>` or `npm install-scripts deny <pkg>` to record a decision.

Changes reach `main` through pull requests, which must pass the `check` job in [.github/workflows/ci.yml](.github/workflows/ci.yml) (`npm run lint`, which also runs [scripts/check-utf8.mjs](scripts/check-utf8.mjs) to fail on a text file that isn't valid UTF-8, `npm run contrast`, `npm test`, `scripts/test-seeds.sh`, `npm run build`, plus actionlint on the workflows and shellcheck on `scripts/*.sh`); see [docs/agents/ci.md](docs/agents/ci.md). Every push to `main` reruns `check` and deploys the build to GitHub Pages ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

Code follows [CODING_STANDARDS.md](CODING_STANDARDS.md), and what players get follows [UX_STANDARDS.md](UX_STANDARDS.md). `/code-review` checks changes against both. The [ux](.claude/skills/ux/SKILL.md) skill critiques ideas and screens against the UX rules, and brings its questions into grilling.

Agents see UI changes in a real browser through the [drive-app](.claude/skills/drive-app/SKILL.md) skill: it drives the system Edge with `playwright-core`, so no browser is downloaded. A project hook in [.claude/settings.json](.claude/settings.json) refuses an agent's Bash or PowerShell command that runs Python with a file write in the command itself, since Python's Windows defaults have changed encodings and line endings; agents edit with their Edit tool, or a Node script for one change across many files. A write the hook can't see (inside a script file, or through a redirect) is left to `npm run lint`'s UTF-8 check.

The app icon source is [public/favicon.svg](public/favicon.svg). Android's cropped (maskable) icon has its own source, [icons/maskable.svg](icons/maskable.svg), with a smaller grid that stays inside Android's safe zone. The PNG icons in `public/` are rendered from these two files.

## License

Copyright (c) 2026 Pepouze ([github.com/iamPepouze](https://github.com/iamPepouze)).

PepoGrid is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE): you may use, modify and share it for any noncommercial purpose, keeping the copyright notice. Commercial use of any kind, including selling it or running it with ads, is not permitted.

The skills in [.claude/skills/](.claude/skills/) listed in [skills-lock.json](skills-lock.json) are by Matt Pocock and remain under the [MIT License](.claude/skills/LICENSE); the others are this repo's own.
