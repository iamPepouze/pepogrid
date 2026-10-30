/**
 * The English messages. They define the shape every language must match (ADR 0009): French and
 * German are typed as `Messages`, so the build fails when one lacks a key English has. Later
 * tickets add their screens' keys here and to each language.
 */
export const en = {
  common: { cancel: 'Cancel', ok: 'OK' },
  /** Difficulty names, as GLOSSARY.md gives them. */
  difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', master: 'Master' },
  app: {
    tagline: 'Your grid, your chill.',
    update: 'Update',
    install: 'Install',
    statistics: 'Statistics',
    newGame: 'New game',
    mistakes: 'Mistakes:',
    elapsedTime: 'Elapsed time',
    ratingTitle: 'Sudoku Explainer rating',
    solved: 'Solved!',
    /** The sentence after "Solved!". */
    solvedSummary: (difficulty: string, time: string, mistakes: number) => `${difficulty} in ${time} with ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}.`,
    hardest: 'hardest:',
    playAgain: 'Play again',
    newGameTitle: (difficulty: string) => `Start a new ${difficulty} game?`,
    newGameMessage: (difficulty: string) => `Your current ${difficulty} game will be lost.`,
    loadFailedTitle: (difficulty: string) => `Couldn't load a new ${difficulty} puzzle`,
    loadFailedMessage: 'Check your connection and try again.',
  },
  /** The keyboard hints under the game: key names are each keyboard's own. */
  hints: { shift: 'Shift', ctrl: 'Ctrl', del: 'Del', digit: 'digit', place: 'place', note: 'note', notesMode: 'notes mode', fillNotes: 'fill notes', erase: 'erase', undo: 'undo', arrows: 'arrows move' },
  controls: { undo: 'Undo', erase: 'Erase', notes: 'Notes', fillNotes: 'Fill notes', technique: 'Technique' },
  numberPad: 'Number pad',
  difficultyMenu: 'Difficulty',
  board: {
    title: 'Sudoku board',
    /** A cell's name: its place, then what it holds. */
    place: (row: number, column: number) => `Row ${row}, column ${column}`,
    label: (place: string, state: string) => `${place}: ${state}`,
    given: 'given',
    complete: 'complete',
    incorrect: 'incorrect',
    empty: 'empty',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    /** The Language group's first option; `resolved` is the language it gives, in its own name. */
    system: (resolved: string) => `System (${resolved})`,
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    board: 'Board',
    highlightMatching: 'Highlight matching numbers',
    license: 'License',
  },
}

type Widen<T> = T extends string ? string : T extends (...args: infer A) => string ? (...args: A) => string : { [K in keyof T]: Widen<T[K]> }

export type Messages = Widen<typeof en>
