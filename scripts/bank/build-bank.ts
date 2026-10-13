/**
 * Builds the puzzle bank: src/data/bank-<tier>.json for every tier.
 * Candidates are generated in parallel, rated by the real tools (SE 1.2.1 via
 * SukakuExplainer, and HoDoKu), and kept only where the tier rule holds.
 * Progress is saved in tools/work so an interrupted run resumes.
 *   node scripts/bank/setup-tools.mjs   (once)
 *   npx tsx scripts/bank/build-bank.ts [perTier=1000] [tier...]
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { DIFFICULTIES, TIERS, tierOf, type Difficulty } from '../../src/lib/difficulty'
import { rateSE } from '../../src/lib/rater'
import { PARALLELISM, ROOT, WORK, hodoku, serate } from './tools'

const run = promisify(execFile)

/** [puzzle (81 digits, 0 = empty), SE rating, HoDoKu score, hardest technique] */
export type BankEntry = [string, number, number, string]

const perTier = Number(process.argv[2] ?? 1000)
const onlyTiers = process.argv.slice(3) as Difficulty[]
const tiers = onlyTiers.length ? onlyTiers : [...DIFFICULTIES]

const PROGRESS = join(WORK, 'bank-progress.json')
const bank: Record<Difficulty, BankEntry[]> = existsSync(PROGRESS)
  ? JSON.parse(readFileSync(PROGRESS, 'utf8'))
  : { easy: [], medium: [], hard: [], expert: [], master: [] }
const seen = new Set(Object.values(bank).flatMap((entries) => entries.map((e) => e[0])))

/**
 * Maximum share of a tier one hardest technique may take, to keep the mix
 * varied. Without it, Hard is about 95% XY-Wing.
 */
const CAPS: Partial<Record<Difficulty, Record<string, number>>> = {
  hard: { 'XY-Wing': 0.5 },
}

const capOf = (tier: Difficulty, technique: string) => Math.round((CAPS[tier]?.[technique] ?? 1) * perTier)
const countOf = (tier: Difficulty, technique: string) => bank[tier].filter((e) => e[3] === technique).length
const atCap = (tier: Difficulty, technique: string) => countOf(tier, technique) >= capOf(tier, technique)

// Trim entries over a cap (e.g. after the cap was introduced), keeping the earliest.
for (const tier of DIFFICULTIES) {
  const kept: Record<string, number> = {}
  bank[tier] = bank[tier].filter((e) => (kept[e[3]] = (kept[e[3]] ?? 0) + 1) <= capOf(tier, e[3]))
}

const missing = (tier: Difficulty) => Math.max(0, perTier - bank[tier].length)

/** Drops candidates whose hardest technique is already at its cap (SE is emulated exactly up to 4.2). */
function underCap(tier: Difficulty, puzzles: string[]): string[] {
  if (!CAPS[tier]) return puzzles
  return puzzles.filter((p) => {
    const { hardest } = rateSE([...p].map(Number))
    return !hardest || !atCap(tier, hardest)
  })
}

/** Runs candidate generators for `tier` in parallel processes. */
async function candidates(tier: Difficulty, count: number): Promise<string[]> {
  const procs = Math.min(PARALLELISM, count)
  const each = Math.ceil(count / procs)
  const files = Array.from({ length: procs }, (_, k) => join(WORK, `cand-${tier}-${k}.txt`))
  await Promise.all(
    files.map((file) =>
      run(process.execPath, ['--import', 'tsx', join(ROOT, 'scripts/bank/candidates.ts'), tier, String(each), file], {
        cwd: ROOT,
      }),
    ),
  )
  return files.flatMap((f) => readFileSync(f, 'utf8').split('\n').filter((l) => l.length === 81))
}

/** The bank's real-tool ratings for `puzzles`, filed into whichever tiers still need them. */
async function rateAndFile(puzzles: string[], tag: string) {
  const fresh = [...new Set(puzzles)].filter((p) => !seen.has(p))
  const se = await serate(fresh, tag)
  const hd = await hodoku(fresh, tag)
  const counts: Partial<Record<Difficulty | 'none', number>> = {}
  for (const p of fresh) {
    const s = se.get(p)
    const h = hd.get(p)
    if (!s || !h) continue
    const tier = tierOf({ se: s.se, hodokuLevel: h.level }) ?? 'none'
    counts[tier] = (counts[tier] ?? 0) + 1
    if (tier !== 'none' && tiers.includes(tier) && missing(tier) > 0 && !atCap(tier, s.hardest)) {
      bank[tier].push([p, s.se, h.score, s.hardest])
      seen.add(p)
    }
  }
  writeFileSync(PROGRESS, JSON.stringify(bank))
  return counts
}

for (const tier of tiers.filter((t) => TIERS[t].se[0] <= 4.2)) {
  while (missing(tier) > 0) {
    const batch = underCap(tier, await candidates(tier, Math.ceil(missing(tier) * 1.2) + PARALLELISM))
    const counts = await rateAndFile(batch, tier)
    console.log(`${tier}: ${bank[tier].length}/${perTier}  (batch ${batch.length}: ${JSON.stringify(counts)})`)
  }
}

// Expert and Master share one candidate stream: minimal puzzles rated above SE 4.2.
const hard = tiers.filter((t) => TIERS[t].se[0] > 4.2)
while (hard.some((t) => missing(t) > 0)) {
  const batch = await candidates('master', 50 * PARALLELISM)
  const counts = await rateAndFile(batch, 'harder')
  console.log(hard.map((t) => `${t}: ${bank[t].length}/${perTier}`).join('  '), ` (batch ${batch.length}: ${JSON.stringify(counts)})`)
}

for (const tier of tiers) {
  const file = join(ROOT, 'src/data', `bank-${tier}.json`)
  const entries = bank[tier].slice(0, perTier)
  writeFileSync(file, '[\n' + entries.map((e) => JSON.stringify(e)).join(',\n') + '\n]\n')
  console.log(`Wrote ${entries.length} ${tier} puzzles to ${file}`)
}
