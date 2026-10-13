# PepoGrid

*Your grid, your chill.*

A Sudoku web app built with Vue 3, TypeScript and Vite.

## Features

- **Three difficulties.** Every puzzle is generated fresh and has a unique solution.
  - **Easy:** 36–40 givens, solvable with naked and hidden singles only.
  - **Medium:** about 27–31 givens, needs locked candidates or naked/hidden pairs.
  - **Hard:** about 22–26 givens, needs techniques beyond those.
- **Notes (pencil marks).** Use the *Notes* button or press `N` to toggle notes mode, or press `Shift` + digit to add a single note. Placing a number clears that digit from the notes in its row, column and box.
- **Error checking.** Digits that don't match the solution are shown in red. Cells that clash in a row, column or box are tinted red. A mistake counter tracks wrong entries.
- **Timer, Undo, Erase.** The timer pauses while the tab is hidden.
- **Auto-save.** Progress is kept in the browser's local storage.

## Keyboard

| Key | Action |
| --- | --- |
| `1`–`9` | Place a digit (or a note, in notes mode) |
| `Shift` + `1`–`9` | Toggle a note |
| `N` | Toggle notes mode |
| `Backspace` / `Delete` / `0` | Erase cell |
| `Ctrl` + `Z` | Undo |
| Arrow keys | Move selection |

## Development

```sh
npm install
npm run dev        # start the dev server
npm test           # run the generator tests
npm run build      # type-check and build to dist/
```
