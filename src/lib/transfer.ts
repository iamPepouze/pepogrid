/**
 * The transfer code: the text a player copies on PepoGrid's old address and pastes on its new one,
 * carrying their settings, game in progress and results. Pure, so it takes the stores' state as plain
 * data and never touches the clipboard or storage: the components do that (ADR 0006, spec #112).
 *
 * A code is a prefix, a format version, then the snapshot as deflated, base64-encoded JSON.
 */
import { DIFFICULTIES } from './difficulty'
import { MAX_RESULTS } from './statistics'

/** The code's format version, separate from the schema number, so a later format can be told apart. */
export const TRANSFER_FORMAT = 1
/** Starts every transfer code, so pasted text that isn't one is recognised at a glance. */
const PREFIX = 'pepogrid-transfer'
const COMPRESSION = 'deflate'

/** What a result needs for the merge. */
export interface TransferResult {
  id: string
  /** ISO timestamp. */
  endedAt: string
}

/** The persisted state of the stores, plus the schema number it was saved under. `game` is null when no game is in progress. */
export interface TransferSnapshot<R extends TransferResult = TransferResult> {
  schema: number
  settings: object
  game: object | null
  results: R[]
}

/** Why a text isn't a transfer code this app can read. */
export type TransferFailure = 'not-a-code' | 'newer'

export type TransferRead<R extends TransferResult = TransferResult> = { snapshot: TransferSnapshot<R>; failure?: undefined } | { snapshot?: undefined; failure: TransferFailure }

/** The state the merge works on: the snapshot without its schema number. */
export type TransferState<R extends TransferResult = TransferResult> = Omit<TransferSnapshot<R>, 'schema'>

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isGrid = (value: unknown) => Array.isArray(value) && value.length === 81 && value.every((v) => Number.isInteger(v))
const isResult = (value: unknown) => isObject(value) && typeof value.id === 'string' && typeof value.endedAt === 'string'
/** A game the stores could resume, as far as the code can tell: the store checks the rest. */
const isGame = (value: unknown) =>
  isObject(value) && DIFFICULTIES.includes(value.difficulty as never) && isObject(value.rating) && ['puzzle', 'solution', 'values', 'notes'].every((key) => isGrid(value[key]))

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
  const writer = stream.writable.getWriter()
  // Not awaited before reading: the write waits for the reader, which only starts below.
  writer.write(bytes).catch(() => {})
  writer.close().catch(() => {})
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

const fromBase64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

/** The transfer code for a snapshot. */
export async function createTransferCode(snapshot: TransferSnapshot): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(snapshot))
  const packed = await pipe(json, new CompressionStream(COMPRESSION))
  return `${PREFIX}:${TRANSFER_FORMAT}:${toBase64(packed)}`
}

/**
 * Reads any text as a transfer code, for an app whose schema number is `appSchema`. A snapshot saved
 * under an older schema goes through the app's launch rule: its settings survive, its game and results are dropped.
 */
export async function readTransferCode<R extends TransferResult = TransferResult>(text: string, appSchema: number): Promise<TransferRead<R>> {
  const [prefix, format, body, ...rest] = text.trim().split(':')
  if (prefix !== PREFIX || !body || rest.length || !/^\d+$/.test(format ?? '')) return { failure: 'not-a-code' }
  if (Number(format) > TRANSFER_FORMAT) return { failure: 'newer' }
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(await pipe(fromBase64(body), new DecompressionStream(COMPRESSION))))
  } catch {
    // Truncated or altered text: not base64, not deflate, or not JSON.
    return { failure: 'not-a-code' }
  }
  if (!isObject(parsed) || !Number.isInteger(parsed.schema) || !isObject(parsed.settings) || !Array.isArray(parsed.results)) return { failure: 'not-a-code' }
  const schema = parsed.schema as number
  if (schema > appSchema) return { failure: 'newer' }
  if (schema < appSchema) return { snapshot: { schema, settings: parsed.settings, game: null, results: [] } }
  if ((parsed.game !== null && !isGame(parsed.game)) || !parsed.results.every(isResult)) return { failure: 'not-a-code' }
  return { snapshot: { schema, settings: parsed.settings, game: parsed.game as object | null, results: parsed.results as R[] } }
}

/**
 * The state to keep after bringing `incoming` over `current`. Results join by `id`, are ordered by end time
 * and cut to the newest MAX_RESULTS. The incoming settings and game replace the current ones, but a snapshot
 * with no game leaves the current game alone.
 */
export function mergeTransfer<R extends TransferResult>(current: TransferState<R>, incoming: TransferSnapshot<R>): TransferState<R> {
  const byId = new Map<string, R>()
  for (const result of [...current.results, ...incoming.results]) byId.set(result.id, result)
  const results = [...byId.values()].sort((a, b) => (a.endedAt < b.endedAt ? -1 : a.endedAt > b.endedAt ? 1 : 0))
  return { settings: incoming.settings, game: incoming.game ?? current.game, results: results.slice(-MAX_RESULTS) }
}
