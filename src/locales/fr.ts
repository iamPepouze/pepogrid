import type { Messages } from './en'

const FRENCH_PLURALS = new Intl.PluralRules('fr')

export const fr: Messages = {
  common: { cancel: 'Annuler', ok: 'OK' },
  difficulty: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', expert: 'Expert', master: 'Maître' },
  app: {
    tagline: 'Ta grille, ta détente.',
    update: 'Mettre à jour',
    install: 'Installer',
    statistics: 'Statistiques',
    newGame: 'Nouvelle partie',
    mistakes: 'Erreurs :',
    elapsedTime: 'Temps écoulé',
    ratingTitle: 'Note Sudoku Explainer',
    solved: 'Résolue !',
    // French counts 0 as singular.
    solvedSummary: (difficulty, time, mistakes) => `${difficulty} en ${time} avec ${mistakes} ${FRENCH_PLURALS.select(mistakes) === 'one' ? 'erreur' : 'erreurs'}.`,
    hardest: 'technique la plus dure :',
    playAgain: 'Rejouer',
    newGameTitle: (difficulty) => `Commencer une nouvelle partie ${difficulty} ?`,
    newGameMessage: (difficulty) => `Ta partie ${difficulty} en cours sera perdue.`,
    loadFailedTitle: (difficulty) => `Impossible de charger une nouvelle grille ${difficulty}`,
    loadFailedMessage: 'Vérifie ta connexion et réessaie.',
  },
  hints: { shift: 'Maj', ctrl: 'Ctrl', del: 'Suppr', digit: 'chiffre', place: 'placer', note: 'note', notesMode: 'mode notes', fillNotes: 'remplir les notes', erase: 'effacer', undo: 'annuler', arrows: 'flèches : déplacer' },
  controls: { on: 'OUI', off: 'NON', undo: 'Annuler', erase: 'Effacer', notes: 'Notes', fillNotes: 'Remplir les notes', technique: 'Technique' },
  numberPad: 'Pavé numérique',
  difficultyMenu: 'Difficulté',
  board: {
    title: 'Grille de sudoku',
    place: (row, column) => `Ligne ${row}, colonne ${column}`,
    // French puts a space before the colon.
    label: (place, state) => `${place} : ${state}`,
    given: 'donné',
    complete: 'complet',
    incorrect: 'incorrect',
    empty: 'vide',
  },
  settings: {
    title: 'Réglages',
    language: 'Langue',
    system: (resolved) => `Système (${resolved})`,
    theme: 'Thème',
    themeSystem: 'Système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    board: 'Grille',
    highlightMatching: 'Surligner les chiffres identiques',
    license: 'Licence',
  },
}
