/**
 * Runs the reference rating tools (see setup-tools.mjs) on batches of puzzles,
 * in parallel processes.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import type { HodokuLevel } from '../../src/lib/difficulty'

const run = promisify(execFile)

export const ROOT = resolve(import.meta.dirname, '../..')
export const TOOLS = join(ROOT, 'tools')
export const WORK = join(TOOLS, 'work')
mkdirSync(WORK, { recursive: true })

/**
 * Classic Sudoku Explainer 1.2.1 technique set for SukakuExplainer's serate
 * (--techs flags, one per technique in serate's order). Excludes the fork's
 * additions: Turbot Fish, WXYZ/VWXYZ/UVWXYZ/TUVWXYZ-Wings, strong-link fish,
 * generalized subsets and variant-only techniques.
 */
export const SE121_TECHS = '1111000011010111011011011011000010100010111111'

function findJava(): string {
  const home = process.env.JAVA_HOME
  if (home && existsSync(join(home, 'bin', 'java.exe'))) return join(home, 'bin', 'java.exe')
  if (home && existsSync(join(home, 'bin', 'java'))) return join(home, 'bin', 'java')
  const msDir = 'C:/Program Files/Microsoft'
  if (existsSync(msDir)) {
    // Newest first, so an upgraded JDK wins over older ones left installed.
    const jdk = readdirSync(msDir)
      .filter((d) => d.startsWith('jdk-'))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0]
    if (jdk) return join(msDir, jdk, 'bin', 'java.exe')
  }
  return 'java'
}

export const JAVA = findJava()

/** Java processes run at once; each needs a few hundred MB, so stay well below the core count. */
export const PARALLELISM = Math.max(1, Math.min(availableParallelism() - 2, 12))

export interface SeRating {
  se: number
  hardest: string
}

export interface HodokuRating {
  score: number
  level: HodokuLevel
}

function chunk<T>(items: T[], parts: number): T[][] {
  const size = Math.ceil(items.length / parts)
  return Array.from({ length: Math.ceil(items.length / size) }, (_, k) => items.slice(k * size, (k + 1) * size))
}

/** Rates puzzles (81-char strings) with SukakuExplainer in SE 1.2.1 mode. */
export async function serate(puzzles: string[], tag: string): Promise<Map<string, SeRating>> {
  const results = new Map<string, SeRating>()
  await Promise.all(
    chunk(puzzles, PARALLELISM).map(async (part, k) => {
      const input = join(WORK, `${tag}-se-${k}.txt`)
      const output = join(WORK, `${tag}-se-${k}.out.txt`)
      writeFileSync(input, part.join('\n') + '\n')
      await run(
        JAVA,
        [
          '-Xrs',
          '-Xmx512m',
          '-cp',
          join(TOOLS, 'SukakuExplainer.jar'),
          'diuf.sudoku.test.serate',
          `--techs=${SE121_TECHS}`,
          '--format=%g|%r|%R',
          `--input=${input}`,
          `--output=${output}`,
          '--threads=1',
        ],
        { maxBuffer: 1 << 26 },
      )
      for (const line of readFileSync(output, 'utf8').split(/\r?\n/)) {
        const [puzzle, rating, name] = line.split('|')
        if (puzzle?.length === 81) results.set(puzzle.replace(/\./g, '0'), { se: Number(rating), hardest: name })
      }
    }),
  )
  return results
}

const LEVELS: Record<string, HodokuLevel> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  Unfair: 'unfair',
  Extreme: 'extreme',
}

/** Rates puzzles with HoDoKu's batch solver. */
export async function hodoku(puzzles: string[], tag: string): Promise<Map<string, HodokuRating>> {
  const results = new Map<string, HodokuRating>()
  await Promise.all(
    chunk(puzzles, PARALLELISM).map(async (part, k) => {
      const input = join(WORK, `${tag}-hd-${k}.txt`)
      const output = join(WORK, `${tag}-hd-${k}.out.txt`)
      writeFileSync(input, part.join('\r\n') + '\r\n')
      await run(JAVA, ['-Xmx256m', '-Djava.awt.headless=true', '-jar', join(TOOLS, 'hodoku.jar'), '/bs', input, '/o', output], {
        cwd: WORK,
        maxBuffer: 1 << 26,
      })
      for (const line of readFileSync(output, 'utf8').split(/\r?\n/)) {
        const m = /#(\d+)\s+(\w+)\s+\((\d+)\)/.exec(line)
        if (!m) continue
        const puzzle = part[Number(m[1]) - 1]
        if (puzzle && LEVELS[m[2]]) results.set(puzzle, { score: Number(m[3]), level: LEVELS[m[2]] })
      }
    }),
  )
  return results
}
