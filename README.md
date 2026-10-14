# PepoGrid

*Your grid, your chill.*

A mobile-first Sudoku progressive web app (PWA) built with Vue 3, TypeScript and Vite. It installs to the home screen and plays offline.

**Play it at [iampepouze.github.io/pepogrid](https://iampepouze.github.io/pepogrid/).**

## Features

- **Five difficulty tiers** with ratings from two community-standard tools: [Sudoku Explainer](https://github.com/SudokuMonster/SukakuExplainer) 1.2.1 (SE) and [HoDoKu](https://hodoku.sourceforge.net/). SE decides the tier, and HoDoKu's level must match it, or the puzzle isn't used.

  | Tier | SE rating | HoDoKu level | Typical hardest technique |
  | --- | --- | --- | --- |
  | Easy | 1.0–1.5 | Easy | hidden singles |
  | Medium | 1.6–2.6 | Medium | naked singles, pointing |
  | Hard | 2.7–4.2 | Hard | X-Wing, Swordfish, XY-Wing |
  | Expert | 4.3–6.5 | Unfair | uniqueness, quads, APE, short chains |
  | Master | 6.6–8.0 | Extreme | forcing chains and cycles |

  Puzzles come from a bundled bank of 1000 per tier, rated offline by the real tools. Each game disguises its puzzle with a random digit relabelling, row/column shuffles and transposition, and a tier's puzzles don't repeat until all have been played. Expert and Master show the SE rating in the status bar, and the full ratings once solved.
- **Notes (pencil marks).** Use the *Notes* button or press `N` to toggle notes mode. To add a single note, press `Shift` + digit, or long-press a number pad button on touch screens. Placing a number clears that digit from the notes in its row, column and box.
- **Error checking.** Digits that don't match the solution are shown in red. Cells that clash in a row, column or box are tinted red. A mistake counter tracks wrong entries.
- **Timer, Undo, Erase.** The timer pauses while the tab is hidden.
- **Auto-save.** The game in progress, including the selected cell, notes mode and undo history, is saved after every change. A browser refresh resumes exactly where you were.
- **Results history.** Solved games are recorded, and so are games abandoned by starting a new one after any progress. Each record has the difficulty, outcome, start/end time, time played, mistakes, progress %, the puzzle, solution and final board, and its ratings (SE, HoDoKu score and level, hardest technique). The 1000 most recent are kept.
- **Mobile-first layout.** On phones, a compact header sits above the board, with controls and the number pad at the bottom. In landscape and on wide screens, the board sits beside the controls. Keyboard hints show only on devices with a mouse.
- **Matching numbers.** Selecting a filled cell tints the other cells with the same digit and emphasizes that digit in notes. This can be turned off in the gear menu (*Highlight matching numbers*).
- **Complete digits.** Once a digit sits in every cell that needs it, its number pad button greys out and stops responding, keyboard key included. Wrong copies don't count. Placing the last one sends a soft glow across that digit's cells, unless the device asks for reduced motion. Undo or Erase brings the button back.
- **Light, dark or system theme.** Choose it from the gear menu in the header. *System* (the default) follows the device setting. The choice is saved, and the title/status bar color follows the theme.
- **Haptics.** The phone gives a short vibration on a mistake (Android only; iOS doesn't support web vibration).
- **Installable PWA.** Works offline. An *Install* button appears in the header when the browser supports it (Chrome, Edge, Android). On iOS, use Share → Add to Home Screen. Updates download in the background and apply the next time the app is launched.

## Keyboard

| Key | Action |
| --- | --- |
| `1`–`9` | Place a digit (or a note, in notes mode) |
| `Shift` + `1`–`9` | Toggle a note |
| `N` | Toggle notes mode |
| `Backspace` / `Delete` / `0` | Erase cell |
| `Ctrl` + `Z` | Undo |
| Arrow keys | Move selection |

## Storage

State lives in [Pinia](https://pinia.vuejs.org/) stores, saved to `localStorage` by `pinia-plugin-persistedstate`:

| Key | Store | Contents |
| --- | --- | --- |
| `pepogrid.settings` | [settings](src/stores/settings.ts) | Preferences (theme, matching-number highlight) |
| `pepogrid.game` | [game](src/stores/game.ts) | The game in progress |
| `pepogrid.results` | [results](src/stores/results.ts) | Finished and abandoned games, newest last |

Grids in results are 81-character strings in row-major order, with `0` for an empty cell.

## Puzzle bank

The bank lives in `src/data/bank-<tier>.json`. Each entry is `[puzzle, SE rating, HoDoKu score, hardest technique]`. To rebuild it (needs Java 17+):

```sh
node scripts/bank/setup-tools.mjs        # download SukakuExplainer and HoDoKu into tools/ (gitignored)
npx tsx scripts/bank/build-bank.ts 1000  # generate, rate and file 1000 puzzles per tier (resumable)
npx tsx scripts/bank/calibrate.ts 2000   # check the built-in rater against the real tools
```

Candidates are pre-filtered by a built-in rater ([src/lib/rater.ts](src/lib/rater.ts)). It emulates SE exactly up to 4.2 and HoDoKu up to XYZ-Wing, and the real tools decide what goes into the bank. A build takes one to two hours, mostly spent finding Expert puzzles: random puzzles in the SE 4.3–6.5 range are almost always HoDoKu *Hard* rather than *Unfair*.

## Development

```sh
npm ci             # install the exact locked dependencies, as CI does
npm run dev        # start the dev server at http://localhost:5173/pepogrid/
npm run lint       # lint the code with ESLint
npm test           # run the tests
npm run build      # type-check and build to dist/ (includes the service worker)
npm run preview    # serve the production build to test the PWA locally
```

If a script fails because `vitest`, `vue-tsc` or `eslint` is "not recognized" or "not found", `node_modules` is likely incomplete: run `npm ci` to reinstall it from the lockfile.

Changes reach `main` through pull requests, which must pass the `check` job in [.github/workflows/ci.yml](.github/workflows/ci.yml) (`npm run lint`, `npm test`, `npm run build`, plus actionlint on the workflows); see [docs/agents/ci.md](docs/agents/ci.md). Every push to `main` reruns `check` and deploys the build to GitHub Pages ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

The app icon source is [public/favicon.svg](public/favicon.svg). Android's cropped (maskable) icon has its own source, [icons/maskable.svg](icons/maskable.svg), with a smaller grid that stays inside Android's safe zone. The PNG icons in `public/` are rendered from these two files.

## License

Copyright (c) 2026 Pepouze ([github.com/iamPepouze](https://github.com/iamPepouze)).

PepoGrid is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE): you may use, modify and share it for any noncommercial purpose, keeping the copyright notice. Commercial use of any kind, including selling it or running it with ads, is not permitted.

The skills in [.claude/skills/](.claude/skills/) are by Matt Pocock and remain under the [MIT License](.claude/skills/LICENSE).
