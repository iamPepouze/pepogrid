/**
 * Finds a real position for a key technique lesson: the state of a bank puzzle just before
 * Sudoku Explainer 1.2.1 applies `technique`, as SukakuExplainer reports it. Saves it to
 * src/data/lesson-positions.json under `id`, where the lessons in src/lib/lessons.ts read it,
 * and prints what to write the lesson from: the step's summary, Sudoku Explainer's explanation,
 * and the digits the step places and the candidates it removes.
 *   node scripts/bank/setup-tools.mjs   (once)
 *   npx tsx scripts/bank/lesson-positions.ts <technique> <id> [skip=0]
 * `skip` passes over that many matching steps first, to try another position.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadBank } from '../../src/lib/bank'
import { DIFFICULTIES } from '../../src/lib/difficulty'
import { PEERS, colOf, rowOf } from '../../src/lib/grid'
import { type LessonPosition, summaryTechnique } from '../../src/lib/lessons'
import { ROOT, WORK, runSerate } from './tools'

/** Puzzles rated per Java start: enough to amortise the start, few enough to stop soon after a match. */
const BATCH = 50

const [technique, id, skipArg = '0'] = process.argv.slice(2)
if (!technique || !id) throw new Error('usage: npx tsx scripts/bank/lesson-positions.ts <technique> <id> [skip=0]')
let skip = Number(skipArg)

const OUTPUT = join(ROOT, 'src/data/lesson-positions.json')

/** Bank puzzles whose hardest technique is `technique`, easiest difficulty first. */
async function puzzlesFor(technique: string): Promise<string[]> {
  const banks = await Promise.all(DIFFICULTIES.map(loadBank))
  return banks.flat().filter((e) => e[3] === technique).map((e) => e[0])
}

/**
 * Lines serate prints: `P <puzzle>` per puzzle, then `B <candidates> <grid>` before and `A <summary>`
 * after each step. The summary opens with the step's own technique (`X-Wing: Cells …`); `%R` would
 * give the hardest technique so far, which matches every step after the first match too.
 */
async function steps(puzzles: string[]): Promise<string[]> {
  const input = join(WORK, 'lesson-positions.txt')
  writeFileSync(input, puzzles.join('\n') + '\n')
  const stdout = await runSerate(['--format=', '--start=P %g', '--before=B %m %i', '--after=A %s', `--input=${input}`])
  return stdout.split(/\r?\n/)
}

/** `%m` gives nine characters per cell, each digit or '.', so a cell's candidates are its digits. */
const candidatesOf = (m: string) => Array.from({ length: 81 }, (_, i) => m.slice(i * 9, i * 9 + 9).replaceAll('.', ''))

/** A position as serate's `%m %i` prints it: each cell's candidates (a filled cell shows its digit) and the grid, 0 for empty. */
function parsePosition(line: string) {
  const [m, grid] = line.split(' ')
  return { candidates: candidatesOf(m), values: grid.replaceAll('.', '0') }
}

/** Separates the steps in serate's output; no explanation contains it. */
const STEP_MARK = '@@step@@'

const puzzles = await puzzlesFor(technique)
if (!puzzles.length) throw new Error(`no bank puzzle has ${technique} as its hardest technique`)

/**
 * Sudoku Explainer's own explanation of step `index` (from 0) of `puzzle`, as plain text: the
 * reasoning in words, which names the pattern's cells only for some techniques. Its HTML spans
 * lines, so it gets a run of its own.
 */
async function explanation(puzzle: string, index: number): Promise<string> {
  const stdout = await runSerate(['--format=', `--after=${STEP_MARK}%h`, puzzle])
  const html = stdout.split(STEP_MARK)[index + 1] ?? ''
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

let found: LessonPosition | undefined
/** The matching step's index within its puzzle's solve. */
let stepIndex = -1
/** The position before the step after the match (`%m %i`), to tell what the match changed; empty when it was the last. */
let next = ''
for (let k = 0; k < puzzles.length && !found; k += BATCH) {
  let puzzle = ''
  let before = ''
  for (const line of await steps(puzzles.slice(k, k + BATCH))) {
    if (line.startsWith('P ')) {
      if (found) break
      puzzle = line.slice(2).trim()
      stepIndex = -1
    } else if (line.startsWith('B ')) {
      before = line.slice(2).trim()
      if (found) {
        next = before
        break
      }
    } else if (line.startsWith('A ') && !found) {
      stepIndex++
      const summary = line.slice(2)
      if (summaryTechnique(summary) !== technique || skip-- > 0) continue
      const { candidates, values } = parsePosition(before)
      // Filled cells keep no candidates, so the lesson draws their digit instead.
      found = { technique, summary: summary.trim(), puzzle, values, candidates: candidates.map((c, i) => (values[i] === '0' ? c : '')) }
    }
  }
}
if (!found) throw new Error(`no ${technique} step found`)

/**
 * What the step did: the digits it placed (`r2c4=3`) and the candidates it removed (`r1c2-8`), as a
 * lesson step's `placement` and `eliminations`. A placed digit's removal from its peers is left out:
 * the lesson grid applies that itself.
 */
function changes(position: LessonPosition, after: string) {
  const { candidates, values } = parsePosition(after)
  const cell = (i: number) => `r${rowOf(i) + 1}c${colOf(i) + 1}`
  const empty = (i: number) => position.values[i] === '0'
  const placedAt = position.candidates.flatMap((_, i) => (empty(i) && values[i] !== '0' ? [i] : []))
  const clearedByPlacement = (i: number, d: string) => placedAt.some((p) => values[p] === d && PEERS[p].includes(i))
  const removed = position.candidates.flatMap((digits, i) => {
    if (!empty(i) || values[i] !== '0') return []
    const gone = [...digits].filter((d) => !candidates[i].includes(d) && !clearedByPlacement(i, d))
    return gone.length ? [`${cell(i)}-${gone.join('')}`] : []
  })
  return { placed: placedAt.map((i) => `${cell(i)}=${values[i]}`), removed }
}

const positions = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : {}
positions[id] = found
writeFileSync(OUTPUT, JSON.stringify(positions, null, 2) + '\n')
console.log(`${id}: ${found.summary}`)
console.log(await explanation(found.puzzle, stepIndex))
if (next) {
  const { placed, removed } = changes(found, next)
  console.log(`Places: ${placed.join(', ') || 'nothing'}`)
  console.log(`Removes: ${removed.join(', ') || 'nothing'}`)
}
