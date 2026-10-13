/**
 * Measures how closely the built-in rater (src/lib/rater.ts) agrees with the
 * real tools, and refreshes the rated sample used by the unit tests.
 *   npx tsx scripts/bank/calibrate.ts [count=2000]
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { rateHodoku, rateSE } from '../../src/lib/rater'
import { countSolutions, dig, randomSolution } from '../../src/lib/sudoku'
import { ROOT, hodoku, serate } from './tools'

const count = Number(process.argv[2] ?? 2000)

// A spread of difficulties: dig unique puzzles down to a random clue count.
const corpus = new Set<string>()
while (corpus.size < count) {
  const min = 20 + Math.floor(Math.random() * 21)
  corpus.add(dig(randomSolution(), (p) => countSolutions(p, 2) === 1, min).join(''))
}
const puzzles = [...corpus]
console.log(`Rating ${puzzles.length} puzzles with the real tools...`)
const se = await serate(puzzles, 'cal')
const hd = await hodoku(puzzles, 'cal')

let seChecked = 0
let seAgree = 0
let hdChecked = 0
let hdLevelAgree = 0
const scoreDiffs: number[] = []
const mismatches: string[] = []
const sample: unknown[] = []

for (const p of puzzles) {
  const grid = [...p].map(Number)
  const realSe = se.get(p)
  const realHd = hd.get(p)
  if (!realSe || !realHd) continue
  const ours = rateSE(grid)
  const oursHd = rateHodoku(grid)

  // SE: exact below 4.4, and "beyond" (null) at or above it.
  seChecked++
  const seOk = realSe.se <= 4.2 ? ours.se === realSe.se : ours.se === null
  if (seOk) seAgree++
  else mismatches.push(`SE  ${p} real ${realSe.se} (${realSe.hardest}) ours ${ours.se} (${ours.hardest})`)

  if (oursHd.level !== null) {
    hdChecked++
    if (oursHd.level === realHd.level) hdLevelAgree++
    else mismatches.push(`HD  ${p} real ${realHd.level} ${realHd.score} ours ${oursHd.level} ${oursHd.score}`)
    scoreDiffs.push(oursHd.score! - realHd.score)
    if (oursHd.score !== realHd.score) mismatches.push(`HDS ${p} real ${realHd.score} ours ${oursHd.score} (SE ${realSe.se} ${realSe.hardest})`)
  }
  if (sample.length < 300) sample.push({ p, se: realSe.se, hs: realHd.score, hl: realHd.level })
}

const abs = scoreDiffs.map(Math.abs).sort((a, b) => a - b)
const pct = (q: number) => abs[Math.min(abs.length - 1, Math.floor(q * abs.length))] ?? 0
console.log(`SE agreement:          ${seAgree}/${seChecked} (${((100 * seAgree) / seChecked).toFixed(2)}%)`)
console.log(`HoDoKu level agreement: ${hdLevelAgree}/${hdChecked} (${((100 * hdLevelAgree) / hdChecked).toFixed(2)}%)`)
console.log(`HoDoKu |score diff|: exact ${abs.filter((d) => d === 0).length}/${abs.length}, p50 ${pct(0.5)}, p95 ${pct(0.95)}, max ${pct(1)}`)
writeFileSync(join(ROOT, 'tools/work/calibration-mismatches.txt'), mismatches.join('\n') + '\n')
writeFileSync(join(ROOT, 'src/lib/__fixtures__/rated-sample.json'), JSON.stringify(sample, null, 0).replace(/},{/g, '},\n{') + '\n')
console.log(`${mismatches.length} mismatches written to tools/work/calibration-mismatches.txt`)

// Distribution of the real SE ratings in the corpus, and where score errors occur.
const bySe = new Map<number, number>()
for (const r of se.values()) bySe.set(Math.floor(r.se), (bySe.get(Math.floor(r.se)) ?? 0) + 1)
console.log('SE distribution:', [...bySe.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}.x:${v}`).join(' '))
