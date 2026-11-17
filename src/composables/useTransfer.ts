/**
 * The transfer code between PepoGrid's old and new address (spec #112): reading the stores into a code, copying
 * it to the clipboard, reading one back and bringing it over. The code's format is src/lib/transfer.ts's;
 * this wraps the clipboard and the stores for the components.
 */
import type { Difficulty } from '../lib/difficulty'
import { SCHEMA_VERSION } from '../lib/schema'
import { createTransferCode, mergeTransfer, readTransferCode, type TransferFailure, type TransferSnapshot } from '../lib/transfer'
import { useGameStore } from '../stores/game'
import { useResultsStore, type GameResult } from '../stores/results'
import { useSettingsStore } from '../stores/settings'

/**
 * True on the build the Pages deploy uploads, the only one that sets VITE_PEPOGRID_PAGES (ci.yml). That build
 * shows the move screen instead of dealing games; dev, tests and the Server image behave as the new address.
 */
export const isPagesBuild = () => import.meta.env.VITE_PEPOGRID_PAGES === 'true'

/** Why a paste gave nothing to bring over: the code's own failures, or a clipboard that can't be read. */
export type PasteFailure = TransferFailure | 'unreadable'

/** A transfer code from the stores' current state. Reads only: nothing on this address changes. */
export function createCodeFromStores(): Promise<string> {
  const snapshot: TransferSnapshot<GameResult> = {
    schema: SCHEMA_VERSION,
    settings: useSettingsStore().snapshot(),
    game: useGameStore().inProgress(),
    results: JSON.parse(JSON.stringify(useResultsStore().results)),
  }
  return createTransferCode(snapshot)
}

/**
 * Copies the transfer code to the clipboard; false when the browser refuses. iOS wants the write to start
 * inside the tap, and compressing the code is asynchronous, so the clipboard gets a promise of the text.
 */
export async function copyTransferCode(): Promise<boolean> {
  try {
    const code = createCodeFromStores()
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': code.then((text) => new Blob([text], { type: 'text/plain' })) })])
    } else {
      await navigator.clipboard.writeText(await code)
    }
    return true
  } catch {
    return false
  }
}

/** Reads the clipboard as a transfer code. */
export async function pasteTransferCode(): Promise<{ snapshot: TransferSnapshot<GameResult>; failure?: undefined } | { snapshot?: undefined; failure: PasteFailure }> {
  let text: string
  try {
    text = await navigator.clipboard.readText()
  } catch {
    return { failure: 'unreadable' }
  }
  return readTransferCode<GameResult>(text, SCHEMA_VERSION)
}

/** The difficulty of the game a snapshot carries, or null; the transfer code has checked it is one. */
const difficultyOf = (snapshot: TransferSnapshot<GameResult>) => (snapshot.game as { difficulty: Difficulty } | null)?.difficulty ?? null

/** What bringing a snapshot over would do, for the dialog to list before anything changes. */
export function summaryOf(snapshot: TransferSnapshot<GameResult>) {
  const game = useGameStore()
  return {
    results: snapshot.results.length,
    gameDifficulty: difficultyOf(snapshot),
    /** The difficulty of the game on the board when the incoming game replaces it and it is recorded as abandoned, otherwise null. */
    abandonedDifficulty: snapshot.game !== null && game.wouldAbandon ? game.difficulty : null,
    /** The preferences the player ends up with. */
    settings: useSettingsStore().adopted(snapshot.settings as Record<string, unknown>),
  }
}

/** What came over, for the dialog to say afterwards. */
export interface BroughtOver {
  /** Results that weren't already here. */
  newResults: number
  /** The difficulty of the game now on the board, null when the code brought none or one the app can't resume. */
  gameDifficulty: Difficulty | null
  languageChanged: boolean
}

/**
 * Brings a snapshot over: takes over its game, which records the game on the board as abandoned when it has a placed
 * digit, then merges the results (keeping that record) and takes over the settings.
 */
export function bringOver(snapshot: TransferSnapshot<GameResult>): BroughtOver {
  const game = useGameStore()
  const settings = useSettingsStore()
  const results = useResultsStore()
  const language = settings.language
  const adopted = snapshot.game !== null && game.adopt(snapshot.game as Record<string, unknown>)
  const known = new Set(results.results.map((r) => r.id))
  results.results = mergeTransfer({ settings: {}, game: null, results: results.results }, snapshot).results
  settings.adopt(snapshot.settings as Record<string, unknown>)
  return {
    newResults: snapshot.results.filter((r) => !known.has(r.id)).length,
    gameDifficulty: adopted ? difficultyOf(snapshot) : null,
    languageChanged: settings.language !== language,
  }
}
