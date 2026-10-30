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
  controls: { on: 'ON', off: 'OFF', undo: 'Undo', erase: 'Erase', notes: 'Notes', fillNotes: 'Fill notes', technique: 'Technique' },
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
  statistics: {
    back: 'Back',
    title: 'Statistics',
    allDifficulties: 'All difficulties',
    /** `n` is the cap on stored games. */
    cap: (n: number) => `Based on your latest ${n} games.`,
    played: 'Played',
    solved: 'Solved',
    abandoned: 'Abandoned',
    solveRate: 'Solve rate',
    empty: (difficulty: string) => `No ${difficulty} games yet.`,
    solvedGames: 'Solved games',
    bestTime: 'Best time',
    averageTime: 'Average time',
    averageMistakes: 'Average mistakes',
    flawless: 'Flawless',
    keyRevealed: 'Key technique revealed',
    nextStepUsed: 'Next step used',
    streaks: 'Streaks',
    current: 'Current',
    best: 'Best',
    ratings: 'Ratings',
    se: 'SE',
    hodoku: 'HoDoKu',
    /** `percent` is already formatted. */
    abandonedAverage: (percent: string) => `Abandoned at ${percent} on average`,
    techniqueFamilies: 'Technique families',
    /** A family's name by its internal English name, which the stored results keep. */
    families: {
      Singles: 'Singles',
      'Naked Single': 'Naked Single',
      'Hidden subsets': 'Hidden subsets',
      Intersections: 'Intersections',
      Fish: 'Fish',
      Subsets: 'Subsets',
      Wings: 'Wings',
      'Wings & subsets': 'Wings & subsets',
      Uniqueness: 'Uniqueness',
      BUG: 'BUG',
      Exclusion: 'Exclusion',
      'Forcing chains': 'Forcing chains',
      Cycles: 'Cycles',
      Other: 'Other',
    },
    revealedKey: (n: number) => `${n} revealed the key technique`,
    usedNextStep: (n: number) => `${n} used the next step`,
    recentGames: 'Recent games',
    recentSolved: 'Solved',
    recentAbandoned: (percent: string) => `Abandoned at ${percent}`,
    mistakes: (n: number) => `${n} ${n === 1 ? 'mistake' : 'mistakes'}`,
    /** A recent game's rating; `se` is already formatted. */
    recentSe: (se: string) => `SE ${se}`,
    reset: 'Reset statistics',
    resetTitle: 'Reset statistics?',
    resetMessage: 'Every solved and abandoned game will be forgotten. This can’t be undone.',
    resetConfirm: 'Reset',
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
