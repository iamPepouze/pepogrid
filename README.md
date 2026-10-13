# PepoGrid

*Your grid, your chill.*

A mobile-first Sudoku progressive web app (PWA) built with Vue 3, TypeScript and Vite. It installs to the home screen and plays offline.

## Features

- **Three difficulties.** Every puzzle is generated fresh and has a unique solution.
  - **Easy:** 36–40 givens, solvable with naked and hidden singles only.
  - **Medium:** about 27–31 givens, needs locked candidates or naked/hidden pairs.
  - **Hard:** about 22–26 givens, needs techniques beyond those.
- **Notes (pencil marks).** Use the *Notes* button or press `N` to toggle notes mode. To add a single note, press `Shift` + digit, or long-press a number pad button on touch screens. Placing a number clears that digit from the notes in its row, column and box.
- **Error checking.** Digits that don't match the solution are shown in red. Cells that clash in a row, column or box are tinted red. A mistake counter tracks wrong entries.
- **Timer, Undo, Erase.** The timer pauses while the tab is hidden.
- **Auto-save.** The game in progress, including the selected cell, notes mode and undo history, is saved after every change. A browser refresh resumes exactly where you were.
- **Results history.** Solved games are recorded, and so are games abandoned by starting a new one after any progress. Each record has the difficulty, outcome, start/end time, time played, mistakes, progress % and the puzzle, solution and final board. The 1000 most recent are kept.
- **Mobile-first layout.** On phones, a compact header sits above the board, with controls and the number pad at the bottom. In landscape and on wide screens, the board sits beside the controls. Keyboard hints show only on devices with a mouse.
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
| `pepogrid.settings` | [settings](src/stores/settings.ts) | Preferences (theme) |
| `pepogrid.game` | [game](src/stores/game.ts) | The game in progress |
| `pepogrid.results` | [results](src/stores/results.ts) | Finished and abandoned games, newest last |

Grids in results are 81-character strings in row-major order, with `0` for an empty cell.

## Development

```sh
npm install
npm run dev        # start the dev server
npm test           # run the generator tests
npm run build      # type-check and build to dist/ (includes the service worker)
npm run preview    # serve the production build to test the PWA locally
```

The app icon source is [public/favicon.svg](public/favicon.svg). Android's cropped (maskable) icon has its own source, [icons/maskable.svg](icons/maskable.svg), with a smaller grid that stays inside Android's safe zone. The PNG icons in `public/` are rendered from these two files.
