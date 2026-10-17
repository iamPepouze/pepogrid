/**
 * Finds a real position for a key technique lesson: the state of a bank puzzle just before
 * Sudoku Explainer 1.2.1 applies `technique`, as SukakuExplainer reports it. Saves it to
 * src/data/lesson-positions.json under `id`, where the lessons in src/lib/lessons.ts read it,
 * and prints the step's summary so the lesson's captions can follow it.
 *   node scripts/bank/setup-tools.mjs   (once)
 *   npx tsx scripts/bank/lesson-positions.ts <technique> <id> [skip=0]
 * `skip` passes over that many matching steps first, to try another position.
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { DIFFICULTIES } from '../../src/lib/difficulty'
import type { LessonPosition } from '../../src/lib/lessons'
import { JAVA, ROOT, SE121_TECHS, TOOLS, WORK } from './tools'

const run = promisify(execFile)

/** Puzzles rated per Java start: enough to amortise the start, few enough to stop soon after a match. */
const BATCH = 50

const [technique, id, skipArg = '0'] = process.argv.slice(2)
if (!technique || !id) throw new Error('usage: npx tsx scripts/bank/lesson-positions.ts <technique> <id> [skip=0]')
let skip = Number(skipArg)

const OUTPUT = join(ROOT, 'src/data/lesson-positions.json')

/** Bank puzzles whose hardest technique is `technique`, easiest difficulty first. */
function puzzlesFor(technique: string): string[] {
  return DIFFICULTIES.flatMap((tier) => {
    const bank = JSON.parse(readFileSync(join(ROOT, `src/data/bank-${tier}.json`), 'utf8')) as [string, number, number, string][]
    return bank.filter((e) => e[3] === technique).map((e) => e[0])
  })
}

/** Lines serate prints: `P <puzzle>` per puzzle, then `B <candidates>` / `A <technique>|<summary>|<grid>` around each step. */
async function steps(puzzles: string[]): Promise<string[]> {
  const input = join(WORK, 'lesson-positions.txt')
  writeFileSync(input, puzzles.join('\n') + '\n')
  const { stdout } = await run(
    JAVA,
    ['-Xrs', '-Xmx512m', '-cp', join(TOOLS, 'SukakuExplainer.jar'), 'diuf.sudoku.test.serate', `--techs=${SE121_TECHS}`,
      '--format=', '--start=P %g', '--before=B %m %i', '--after=A %R|%s', `--input=${input}`],
    { maxBuffer: 1 << 28 },
  )
  return stdout.split(/\r?\n/)
}

/** `%m` gives nine characters per cell, each digit or '.', so a cell's candidates are its digits. */
const candidatesOf = (m: string) => Array.from({ length: 81 }, (_, i) => m.slice(i * 9, i * 9 + 9).replaceAll('.', ''))

const puzzles = puzzlesFor(technique)
if (!puzzles.length) throw new Error(`no bank puzzle has ${technique} as its hardest technique`)

let found: LessonPosition | undefined
for (let k = 0; k < puzzles.length && !found; k += BATCH) {
  let puzzle = ''
  let before = ''
  for (const line of await steps(puzzles.slice(k, k + BATCH))) {
    if (line.startsWith('P ')) puzzle = line.slice(2).trim()
    else if (line.startsWith('B ')) before = line.slice(2).trim()
    else if (line.startsWith('A ')) {
      const [name, summary] = line.slice(2).split('|')
      if (name.trim() !== technique || skip-- > 0) continue
      const [m, grid] = before.split(' ')
      const candidates = candidatesOf(m)
      const values = grid.replaceAll('.', '0')
      // Filled cells keep no candidates, so the lesson draws their digit instead.
      found = { technique, summary: summary.trim(), puzzle, values, candidates: candidates.map((c, i) => (values[i] === '0' ? c : '')) }
      break
    }
  }
}
if (!found) throw new Error(`no ${technique} step found`)

const positions = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : {}
positions[id] = found
writeFileSync(OUTPUT, JSON.stringify(positions, null, 2) + '\n')
console.log(`${id}: ${found.summary}`)
