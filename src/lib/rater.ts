/**
 * Puzzle rater emulating two reference tools. The bank scripts use it to
 * pre-filter candidate puzzles before the real tools rate them (scripts/bank),
 * and the app uses its SE techniques to find the player's next technique
 * (`nextTechnique`). Both only need the easier range:
 *
 * - SE: Sudoku Explainer 1.2.1. At each step the first hint found, trying
 *   techniques in SE's fixed order, is applied; the rating is the highest step
 *   rating. Emulated exactly up to XY-Wing (4.2). Anything SE would need after
 *   that rates at least 4.4, which is reported as `se: null`.
 * - HoDoKu 2.2: steps are tried in HoDoKu's default order and their base
 *   scores summed; the level is the hardest step's level, raised while the
 *   score exceeds that level's maximum. Emulated up to XYZ-Wing; a puzzle
 *   needing more is reported as `hodokuLevel: null`.
 *
 * Scan orders follow the reference implementations so the same steps are
 * chosen; scripts/bank/calibrate.ts measures agreement with the real tools.
 */
import type { HodokuLevel } from './difficulty'
import {
  ALL_DIGITS,
  BOXES,
  COLS,
  PEERS,
  ROWS,
  bit,
  candidatesAt,
  combinations,
  firstDigit,
  popcount,
  sees,
} from './grid'

class Board {
  readonly values: number[]
  readonly cand: number[]
  empties: number

  /** With `candidates`, starts from those masks instead of every digit the placed ones allow. */
  constructor(puzzle: readonly number[], candidates?: readonly number[]) {
    this.values = puzzle.slice()
    this.cand = candidates ? candidates.slice() : this.values.map((v, i) => (v ? 0 : candidatesAt(this.values, i)))
    this.empties = this.values.filter((v) => !v).length
  }

  place(i: number, d: number) {
    this.values[i] = d
    this.cand[i] = 0
    this.empties--
    for (const p of PEERS[i]) this.cand[p] &= ~bit(d)
  }

  /** Removes `mask` from cell `i`; true if anything was removed. */
  eliminate(i: number, mask: number): boolean {
    if (!(this.cand[i] & mask)) return false
    this.cand[i] &= ~mask
    return true
  }

  /** Bitmask of positions (indexes into `region`) where `d` is a candidate. */
  positions(region: readonly number[], d: number): number {
    let m = 0
    for (let k = 0; k < 9; k++) if (this.cand[region[k]] & bit(d)) m |= 1 << k
    return m
  }

  emptyCount(region: readonly number[]): number {
    let n = 0
    for (const i of region) if (!this.values[i]) n++
    return n
  }
}

const bitIndex = (mask: number) => 31 - Math.clz32(mask)

function cellsOf(region: readonly number[], mask: number): number[] {
  const cells: number[] = []
  for (let k = 0; k < 9; k++) if (mask & (1 << k)) cells.push(region[k])
  return cells
}

const COMBOS = [[], [], combinations(2, 9), combinations(3, 9), combinations(4, 9)]

/* ------------------------------------------------------------------ */
/* Sudoku Explainer 1.2.1                                              */
/* ------------------------------------------------------------------ */

// SE region type indexes: 0 = block, 1 = row, 2 = column.
const SE_REGIONS = [BOXES, ROWS, COLS]
/** SE scans region types in this order for singles and subsets. */
const SE_TYPE_ORDER = [0, 2, 1]

function seCrosses(t1: number, i1: number, t2: number, i2: number): boolean {
  if (t1 === t2) return i1 === i2
  const [bt, bi, lt, li] = t1 === 0 ? [t1, i1, t2, i2] : [t2, i2, t1, i1]
  if (bt !== 0) return true // row and column always cross
  return lt === 1 ? Math.floor(bi / 3) === Math.floor(li / 3) : bi % 3 === Math.floor(li / 3)
}

interface SeStep {
  rating: number
  name: string
}

function seHiddenSingle(b: Board): SeStep | null {
  for (const alone of [true, false]) {
    for (const t of SE_TYPE_ORDER) {
      for (const region of SE_REGIONS[t]) {
        for (let d = 1; d <= 9; d++) {
          const m = b.positions(region, d)
          if (popcount(m) !== 1) continue
          if ((b.emptyCount(region) === 1) !== alone) continue
          b.place(region[bitIndex(m)], d)
          return { rating: alone ? 1.0 : t === 0 ? 1.2 : 1.5, name: 'Hidden Single' }
        }
      }
    }
  }
  return null
}

const SE_LOCKING_PAIRS = [
  [0, 2],
  [0, 1],
  [2, 0],
  [1, 0],
]

function seLocking(b: Board, direct: boolean): SeStep | null {
  for (const [t1, t2] of SE_LOCKING_PAIRS) {
    for (let d = 1; d <= 9; d++) {
      for (let i1 = 0; i1 < 9; i1++) {
        const r1 = SE_REGIONS[t1][i1]
        const m1 = b.positions(r1, d)
        if (popcount(m1) < 2) continue
        for (let i2 = 0; i2 < 9; i2++) {
          if (!seCrosses(t1, i1, t2, i2)) continue
          const r2 = SE_REGIONS[t2][i2]
          if (!cellsOf(r1, m1).every((c) => r2.includes(c))) continue
          if (direct) {
            // The elimination leaves a hidden single in a parallel region.
            for (let i3 = 0; i3 < 9; i3++) {
              if (i3 === i1 || !seCrosses(t1, i3, t2, i2)) continue
              const r3 = SE_REGIONS[t1][i3]
              const m3 = b.positions(r3, d)
              if (popcount(m3) <= 1) continue
              const remaining = cellsOf(r3, m3).filter((c) => !r2.includes(c))
              if (remaining.length === 1) {
                b.place(remaining[0], d)
                return t1 === 0
                  ? { rating: 1.7, name: 'Direct Pointing' }
                  : { rating: 1.9, name: 'Direct Claiming' }
              }
            }
          } else {
            let removed = false
            for (const c of r2) if (!r1.includes(c) && b.eliminate(c, bit(d))) removed = true
            if (removed) return t2 !== 0 ? { rating: 2.6, name: 'Pointing' } : { rating: 2.8, name: 'Claiming' }
          }
        }
      }
    }
  }
  return null
}

const SET_NAMES = ['', '', 'Pair', 'Triplet', 'Quad']

function seHiddenSet(b: Board, degree: number, direct: boolean): SeStep | null {
  for (const t of SE_TYPE_ORDER) {
    for (const region of SE_REGIONS[t]) {
      const empty = b.emptyCount(region)
      if (!(empty > degree * 2 || (direct && empty > degree))) continue
      for (const combo of COMBOS[degree]) {
        const digits = combo.map((k) => k + 1)
        let union = 0
        let ok = true
        for (const d of digits) {
          const m = b.positions(region, d)
          if (popcount(m) <= 1) {
            ok = false
            break
          }
          union |= m
        }
        if (!ok || popcount(union) !== degree) continue
        const valueMask = digits.reduce((m, d) => m | bit(d), 0)
        if (direct) {
          for (let v = 1; v <= 9; v++) {
            if (valueMask & bit(v)) continue
            const m = b.positions(region, v)
            if (popcount(m) <= 1) continue
            const rest = m & ~union
            if (popcount(rest) === 1) {
              b.place(region[bitIndex(rest)], v)
              return { rating: degree === 2 ? 2.0 : 2.5, name: `Direct Hidden ${SET_NAMES[degree]}` }
            }
          }
        } else {
          let removed = false
          for (const c of cellsOf(region, union)) if (b.eliminate(c, ~valueMask & 0x3fe)) removed = true
          if (removed) return { rating: degree === 2 ? 3.4 : 4.0, name: `Hidden ${SET_NAMES[degree]}` }
        }
      }
    }
  }
  return null
}

function seNakedSingle(b: Board): SeStep | null {
  for (let i = 0; i < 81; i++) {
    if (!b.values[i] && popcount(b.cand[i]) === 1) {
      b.place(i, firstDigit(b.cand[i]))
      return { rating: 2.3, name: 'Naked Single' }
    }
  }
  return null
}

function seNakedSet(b: Board, degree: number): SeStep | null {
  for (const t of SE_TYPE_ORDER) {
    for (const region of SE_REGIONS[t]) {
      if (b.emptyCount(region) < degree * 2) continue
      for (const combo of COMBOS[degree]) {
        let union = 0
        let ok = true
        for (const k of combo) {
          const c = b.cand[region[k]]
          if (popcount(c) <= 1) {
            ok = false
            break
          }
          union |= c
        }
        if (!ok || popcount(union) !== degree) continue
        let removed = false
        for (let k = 0; k < 9; k++) if (!combo.includes(k) && b.eliminate(region[k], union)) removed = true
        if (removed) return { rating: degree === 2 ? 3.0 : 3.6, name: `Naked ${SET_NAMES[degree]}` }
      }
    }
  }
  return null
}

const FISH_NAMES = ['', '', 'X-Wing', 'Swordfish', 'Jellyfish']

function seFish(b: Board, degree: number): SeStep | null {
  const occurrences = new Array(10).fill(0)
  for (const v of b.values) occurrences[v]++
  // Base columns with cover rows, then base rows with cover columns.
  for (const [base, cover] of [
    [COLS, ROWS],
    [ROWS, COLS],
  ]) {
    for (const combo of COMBOS[degree]) {
      for (let d = 1; d <= 9; d++) {
        if (occurrences[d] + degree * 2 > 9) continue
        let union = 0
        let ok = true
        for (const k of combo) {
          const m = b.positions(base[k], d)
          if (popcount(m) <= 1) {
            ok = false
            break
          }
          union |= m
        }
        if (!ok || popcount(union) !== degree) continue
        let removed = false
        for (let j = 0; j < 9; j++) {
          if (!(union & (1 << j))) continue
          for (let k = 0; k < 9; k++) if (!combo.includes(k) && b.eliminate(cover[j][k], bit(d))) removed = true
        }
        if (removed) return { rating: degree === 2 ? 3.2 : 3.8, name: FISH_NAMES[degree] }
      }
    }
  }
  return null
}

function seXYWing(b: Board): SeStep | null {
  for (let i = 0; i < 81; i++) {
    const xy = b.cand[i]
    if (popcount(xy) !== 2) continue
    for (const xz of PEERS[i]) {
      const xzc = b.cand[xz]
      if (popcount(xzc) !== 2 || popcount(xy & ~xzc) !== 1) continue
      for (const yz of PEERS[i]) {
        const yzc = b.cand[yz]
        if (popcount(yzc) !== 2) continue
        if (popcount(xy | xzc | yzc) !== 3 || (xy & xzc & yzc) !== 0) continue
        const z = xzc & yzc
        let removed = false
        for (let v = 0; v < 81; v++) {
          if (v === i || v === xz || v === yz) continue
          if (sees(v, xz) && sees(v, yz) && b.eliminate(v, z)) removed = true
        }
        if (removed) return { rating: 4.2, name: 'XY-Wing' }
      }
    }
  }
  return null
}

const SE_TECHNIQUES: ((b: Board) => SeStep | null)[] = [
  seHiddenSingle,
  (b) => seLocking(b, true),
  (b) => seHiddenSet(b, 2, true),
  seNakedSingle,
  (b) => seHiddenSet(b, 3, true),
  (b) => seLocking(b, false),
  (b) => seNakedSet(b, 2),
  (b) => seFish(b, 2),
  (b) => seHiddenSet(b, 2, false),
  (b) => seNakedSet(b, 3),
  (b) => seFish(b, 3),
  (b) => seHiddenSet(b, 3, false),
  seXYWing,
]

export interface SeResult {
  /** SE rating, or null when SE would need something beyond XY-Wing (rating >= 4.4). */
  se: number | null
  /** Name of the first technique with the highest rating. */
  hardest: string
}

/**
 * Sudoku Explainer 1.2.1 rating. With `limit`, stops early (returning
 * `se: null`) as soon as a step rates above it.
 */
export function rateSE(puzzle: readonly number[], limit = Infinity): SeResult {
  const b = new Board(puzzle)
  let se = 0
  let hardest = ''
  while (b.empties > 0) {
    let step: SeStep | null = null
    for (const technique of SE_TECHNIQUES) {
      step = technique(b)
      if (step) break
    }
    if (!step || step.rating > limit) return { se: null, hardest: '' }
    if (step.rating > se) {
      se = step.rating
      hardest = step.name
    }
  }
  return { se, hardest }
}

/** The easiest technique that makes progress from a position, by its SE name, or `beyond` when SE would need more than XY-Wing. */
export type NextTechnique = { kind: 'technique'; technique: string } | { kind: 'beyond' }

/**
 * The next technique from the player's digits and notes: the first of SE's techniques, in its
 * order, that places a digit or removes a candidate. A cell with notes holds those notes that
 * its peers allow; a cell without notes holds every digit its peers allow.
 */
export function nextTechnique(values: readonly number[], notes: readonly number[]): NextTechnique {
  const candidates = values.map((v, i) => (v ? 0 : candidatesAt(values, i) & (notes[i] || ALL_DIGITS)))
  const b = new Board(values, candidates)
  for (const technique of SE_TECHNIQUES) {
    const step = technique(b)
    if (step) return { kind: 'technique', technique: step.name }
  }
  return { kind: 'beyond' }
}

/* ------------------------------------------------------------------ */
/* HoDoKu 2.2                                                          */
/* ------------------------------------------------------------------ */

// HoDoKu unit ("constraint") order: rows, columns, blocks.
const H_UNITS = [...ROWS, ...COLS, ...BOXES]
const CONSTRAINTS: readonly number[][] = Array.from({ length: 81 }, (_, i) => [
  Math.floor(i / 9),
  9 + (i % 9),
  18 + Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3),
])
const unitsOfCell = (i: number) => CONSTRAINTS[i]

/** HoDoKu's FIFO of pending singles (SudokuSinglesQueue). */
class SinglesQueue {
  cells: number[] = []
  digits: number[] = []
  get = 0
  put = 0

  add(i: number, d: number) {
    this.cells[this.put] = i
    this.digits[this.put++] = d
  }

  /** Takes the next entry's slot, or -1; resets when drained, as HoDoKu does. */
  take(): number {
    if (this.get >= this.put) return -1
    const slot = this.get++
    if (this.get >= this.put) this.get = this.put = 0
    return slot
  }

  deleteHidden(constraint: number, d: number) {
    for (let k = this.get; k < this.put; k++) {
      if (this.digits[k] === d && CONSTRAINTS[this.cells[k]].includes(constraint)) {
        this.cells.splice(k, 1)
        this.digits.splice(k, 1)
        this.put--
        return
      }
    }
  }
}

/**
 * Board with HoDoKu's bookkeeping: per-unit candidate counts ("free") and the
 * naked/hidden single queues, updated exactly as Sudoku2 does. Which single
 * HoDoKu takes next depends on these queues, and with it the score.
 */
class HodokuBoard extends Board {
  readonly free: number[][] = Array.from({ length: 27 }, () => new Array(10).fill(9))
  readonly ns = new SinglesQueue()
  readonly hs = new SinglesQueue()

  constructor(puzzle: readonly number[]) {
    super(new Array(81).fill(0))
    this.cand.fill(0x3fe)
    // HoDoKu loads a puzzle by setting each given in reading order.
    puzzle.forEach((d, i) => {
      if (d) this.place(i, d)
    })
  }

  private addHidden(constraint: number, d: number) {
    for (const c of H_UNITS[constraint]) {
      if (this.cand[c] & bit(d)) {
        this.hs.add(c, d)
        return
      }
    }
  }

  private deleteCandidate(i: number, d: number) {
    if (!(this.cand[i] & bit(d))) return
    this.cand[i] &= ~bit(d)
    if (popcount(this.cand[i]) === 1) this.ns.add(i, firstDigit(this.cand[i]))
    for (const c of CONSTRAINTS[i]) {
      const free = --this.free[c][d]
      if (free === 1) this.addHidden(c, d)
      else if (free === 0) this.hs.deleteHidden(c, d)
    }
  }

  override place(i: number, d: number) {
    const cands = this.cand[i]
    this.values[i] = d
    this.cand[i] = 0
    this.empties--
    for (const p of PEERS[i]) this.deleteCandidate(p, d)
    for (let c = 1; c <= 9; c++) {
      if (!(cands & bit(c))) continue
      for (const u of CONSTRAINTS[i]) {
        if (--this.free[u][c] === 1 && c !== d) this.addHidden(u, c)
      }
    }
  }

  override eliminate(i: number, mask: number): boolean {
    const hits = this.cand[i] & mask
    if (!hits) return false
    for (let d = 1; d <= 9; d++) if (hits & bit(d)) this.deleteCandidate(i, d)
    return true
  }
}

function hFullHouse(b: HodokuBoard): boolean {
  for (let k = b.ns.get; k < b.ns.put; k++) {
    const i = b.ns.cells[k]
    const d = b.ns.digits[k]
    if (b.values[i]) continue
    for (const c of CONSTRAINTS[i]) {
      let alone = true
      for (let j = 1; j <= 9; j++) {
        if (j !== d && b.free[c][j] !== 0) {
          alone = false
          break
        }
      }
      if (alone) {
        b.place(i, d)
        return true
      }
    }
  }
  return false
}

function hNakedSingle(b: HodokuBoard): boolean {
  for (let k = b.ns.take(); k !== -1; k = b.ns.take()) {
    const i = b.ns.cells[k]
    if (!b.values[i]) {
      b.place(i, b.ns.digits[k])
      return true
    }
  }
  return false
}

function hHiddenSingle(b: HodokuBoard): boolean {
  for (let k = b.hs.take(); k !== -1; k = b.hs.take()) {
    const i = b.hs.cells[k]
    const d = b.hs.digits[k]
    if (b.values[i]) continue
    // HoDoKu only checks the first pending entry for an empty cell.
    if (CONSTRAINTS[i].some((c) => b.free[c][d] === 1)) {
      b.place(i, d)
      return true
    }
    return false
  }
  return false
}

/**
 * Naked subsets. `locked`: only subsets confined to a block and a line that
 * eliminate in both (HoDoKu's Locked Pair/Triple); otherwise only the others.
 */
function hNakedSubset(b: Board, n: number, locked: boolean): boolean {
  const entities = locked ? [BOXES] : [BOXES, ROWS, COLS]
  for (const units of entities) {
    for (const unit of units) {
      const cells = unit.filter((i) => b.cand[i] && popcount(b.cand[i]) <= n)
      if (cells.length < n) continue
      for (const combo of combinations(n, cells.length)) {
        const subset = combo.map((k) => cells[k])
        const union = subset.reduce((m, i) => m | b.cand[i], 0)
        if (popcount(union) !== n) continue
        const shared = [0, 1, 2].filter((t) => subset.every((i) => unitsOfCell(i)[t] === unitsOfCell(subset[0])[t]))
        const block = unitsOfCell(subset[0])[2]
        const deletions: [number, number][] = []
        let foundConstraints = 0
        for (const t of shared) {
          let found = false
          for (const c of H_UNITS[unitsOfCell(subset[0])[t]]) {
            if (subset.includes(c) || !(b.cand[c] & union)) continue
            deletions.push([c, union])
            if (t === 2 || unitsOfCell(c)[2] !== block) found = true
          }
          if (found) foundConstraints++
        }
        if (!deletions.length) continue
        const isLocked = n < 4 && foundConstraints > 1 && shared.includes(2) && (shared.includes(0) || shared.includes(1))
        if (isLocked !== locked) continue
        for (const [c, m] of deletions) b.eliminate(c, m)
        return true
      }
    }
  }
  return false
}

function hHiddenSubset(b: Board, n: number): boolean {
  for (const units of [BOXES, ROWS, COLS]) {
    for (const unit of units) {
      const digits: number[] = []
      for (let d = 1; d <= 9; d++) {
        const c = popcount(b.positions(unit, d))
        if (c > 0 && c <= n) digits.push(d)
      }
      if (digits.length < n) continue
      for (const combo of combinations(n, digits.length)) {
        const set = combo.map((k) => digits[k])
        const union = set.reduce((m, d) => m | b.positions(unit, d), 0)
        if (popcount(union) !== n) continue
        const valueMask = set.reduce((m, d) => m | bit(d), 0)
        let removed = false
        for (const c of cellsOf(unit, union)) if (b.eliminate(c, ~valueMask & 0x3fe)) removed = true
        if (removed) return true
      }
    }
  }
  return false
}

/** Locked Candidates type 1 (pointing) or type 2 (claiming). */
function hLockedCandidates(b: Board, pointing: boolean): boolean {
  for (let d = 1; d <= 9; d++) {
    if (pointing) {
      for (const box of BOXES) {
        const cells = cellsOf(box, b.positions(box, d))
        if (cells.length < 2) continue
        for (const line of [ROWS[Math.floor(cells[0] / 9)], COLS[cells[0] % 9]]) {
          if (!cells.every((c) => line.includes(c))) continue
          let removed = false
          for (const c of line) if (!box.includes(c) && b.eliminate(c, bit(d))) removed = true
          if (removed) return true
        }
      }
    } else {
      for (const line of [...ROWS, ...COLS]) {
        const cells = cellsOf(line, b.positions(line, d))
        if (cells.length < 2) continue
        const box = BOXES.find((bx) => cells.every((c) => bx.includes(c)))
        if (!box) continue
        let removed = false
        for (const c of box) if (!line.includes(c) && b.eliminate(c, bit(d))) removed = true
        if (removed) return true
      }
    }
  }
  return false
}

function hFish(b: Board, n: number): boolean {
  for (const [base, cover] of [
    [ROWS, COLS],
    [COLS, ROWS],
  ]) {
    for (let d = 1; d <= 9; d++) {
      const lines = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((k) => {
        const c = popcount(b.positions(base[k], d))
        return c >= 2 && c <= n
      })
      for (const combo of combinations(n, lines.length)) {
        const set = combo.map((k) => lines[k])
        const union = set.reduce((m, k) => m | b.positions(base[k], d), 0)
        if (popcount(union) !== n) continue
        let removed = false
        for (let j = 0; j < 9; j++) {
          if (!(union & (1 << j))) continue
          for (let k = 0; k < 9; k++) if (!set.includes(k) && b.eliminate(cover[j][k], bit(d))) removed = true
        }
        if (removed) return true
      }
    }
  }
  return false
}

/** Removes `mask` from every cell (not in `exclude`) that sees all of `cells`. */
function eliminateSeeingAll(b: Board, cells: number[], mask: number, exclude: number[] = cells): boolean {
  let removed = false
  for (let v = 0; v < 81; v++) {
    if (exclude.includes(v) || !(b.cand[v] & mask)) continue
    if (cells.every((c) => sees(v, c)) && b.eliminate(v, mask)) removed = true
  }
  return removed
}

function hRemotePair(b: Board): boolean {
  const bivalue = [...Array(81).keys()].filter((i) => popcount(b.cand[i]) === 2)
  for (const pair of new Set(bivalue.map((i) => b.cand[i]))) {
    const cells = bivalue.filter((i) => b.cand[i] === pair)
    if (cells.length < 4) continue
    // 2-colour each connected chain of these cells.
    const colour = new Map<number, number>()
    for (const start of cells) {
      if (colour.has(start)) continue
      const comp: number[] = []
      const queue = [start]
      colour.set(start, 0)
      while (queue.length) {
        const c = queue.shift()!
        comp.push(c)
        for (const o of cells) {
          if (!colour.has(o) && sees(c, o)) {
            colour.set(o, 1 - colour.get(c)!)
            queue.push(o)
          }
        }
      }
      if (comp.length < 4) continue
      for (const a of comp) {
        for (const z of comp) {
          if (a >= z || colour.get(a) === colour.get(z) || sees(a, z)) continue
          if (eliminateSeeingAll(b, [a, z], pair, comp)) return true
        }
      }
    }
  }
  return false
}

function hBugPlusOne(b: Board): boolean {
  let tri = -1
  for (let i = 0; i < 81; i++) {
    if (b.values[i]) continue
    const n = popcount(b.cand[i])
    if (n === 2) continue
    if (n !== 3 || tri !== -1) return false
    tri = i
  }
  if (tri === -1) return false
  for (let d = 1; d <= 9; d++) {
    if (!(b.cand[tri] & bit(d))) continue
    if (popcount(b.positions(ROWS[Math.floor(tri / 9)], d)) === 3) {
      b.eliminate(tri, b.cand[tri] & ~bit(d))
      return true
    }
  }
  return false
}

/** Conjugate pairs (strong links) for digit d: unit index and its two cells. */
function strongLinks(b: Board, d: number, units: readonly number[][]): [number, number][] {
  const links: [number, number][] = []
  for (const unit of units) {
    const m = b.positions(unit, d)
    if (popcount(m) === 2) {
      const [x, y] = cellsOf(unit, m)
      links.push([x, y])
    }
  }
  return links
}

function hSkyscraper(b: Board): boolean {
  for (const [lines, alongCol] of [
    [ROWS, true],
    [COLS, false],
  ] as const) {
    for (let d = 1; d <= 9; d++) {
      const links = strongLinks(b, d, lines)
      const cross = (i: number) => (alongCol ? i % 9 : Math.floor(i / 9))
      for (let i = 0; i < links.length; i++) {
        for (let j = i + 1; j < links.length; j++) {
          const [a0, a1] = links[i]
          const [b0, b1] = links[j]
          let other: [number, number] | null = null
          if (cross(a0) === cross(b0)) other = [a1, b1]
          else if (cross(a1) === cross(b1)) other = [a0, b0]
          if (!other || cross(other[0]) === cross(other[1])) continue
          if (eliminateSeeingAll(b, other, bit(d), [a0, a1, b0, b1])) return true
        }
      }
    }
  }
  return false
}

function hTwoStringKite(b: Board): boolean {
  const box = (i: number) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)
  for (let d = 1; d <= 9; d++) {
    const rowLinks = strongLinks(b, d, ROWS)
    const colLinks = strongLinks(b, d, COLS)
    for (const [r0, r1] of rowLinks) {
      for (const [c0, c1] of colLinks) {
        for (const [rIn, rOut] of [
          [r0, r1],
          [r1, r0],
        ]) {
          for (const [cIn, cOut] of [
            [c0, c1],
            [c1, c0],
          ]) {
            if (box(rIn) !== box(cIn)) continue
            if (new Set([r0, r1, c0, c1]).size < 4) continue
            const crossCell = Math.floor(cOut / 9) * 9 + (rOut % 9)
            if (b.eliminate(crossCell, bit(d))) return true
          }
        }
      }
    }
  }
  return false
}

/** Turbot Fish: X-chain strong - weak - strong over any units. */
function hTurbotFish(b: Board): boolean {
  for (let d = 1; d <= 9; d++) {
    const links = strongLinks(b, d, [...ROWS, ...COLS, ...BOXES])
    for (const l1 of links) {
      for (const l2 of links) {
        if (l1 === l2) continue
        for (const [a, mid1] of [l1, [l1[1], l1[0]] as [number, number]]) {
          for (const [mid2, z] of [l2, [l2[1], l2[0]] as [number, number]]) {
            if (mid1 === mid2 || !sees(mid1, mid2) || a === z || new Set([a, mid1, mid2, z]).size < 4) continue
            if (eliminateSeeingAll(b, [a, z], bit(d), [a, mid1, mid2, z])) return true
          }
        }
      }
    }
  }
  return false
}

function hEmptyRectangle(b: Board): boolean {
  for (let d = 1; d <= 9; d++) {
    for (let bx = 0; bx < 9; bx++) {
      const cells = cellsOf(BOXES[bx], b.positions(BOXES[bx], d))
      if (cells.length < 2) continue
      const boxRows = [0, 1, 2].map((k) => Math.floor(bx / 3) * 3 + k)
      const boxCols = [0, 1, 2].map((k) => (bx % 3) * 3 + k)
      for (const r of boxRows) {
        for (const c of boxCols) {
          if (!cells.every((i) => Math.floor(i / 9) === r || i % 9 === c)) continue
          if (cells.every((i) => Math.floor(i / 9) === r) || cells.every((i) => i % 9 === c)) continue
          // Conjugate pair in a column outside the box with one end on row r.
          for (const [x, y] of strongLinks(b, d, COLS)) {
            if (boxCols.includes(x % 9)) continue
            for (const [onRow, far] of [
              [x, y],
              [y, x],
            ]) {
              if (Math.floor(onRow / 9) !== r || boxRows.includes(Math.floor(far / 9))) continue
              if (b.eliminate(Math.floor(far / 9) * 9 + c, bit(d))) return true
            }
          }
          // Conjugate pair in a row outside the box with one end on column c.
          for (const [x, y] of strongLinks(b, d, ROWS)) {
            if (boxRows.includes(Math.floor(x / 9))) continue
            for (const [onCol, far] of [
              [x, y],
              [y, x],
            ]) {
              if (onCol % 9 !== c || boxCols.includes(far % 9)) continue
              if (b.eliminate(r * 9 + (far % 9), bit(d))) return true
            }
          }
        }
      }
    }
  }
  return false
}

function hWWing(b: Board): boolean {
  const bivalue = [...Array(81).keys()].filter((i) => popcount(b.cand[i]) === 2)
  const units = [...ROWS, ...COLS, ...BOXES]
  for (let i = 0; i < bivalue.length; i++) {
    for (let j = i + 1; j < bivalue.length; j++) {
      const p = bivalue[i]
      const q = bivalue[j]
      if (b.cand[p] !== b.cand[q] || sees(p, q)) continue
      const pair = b.cand[p]
      for (const x of [firstDigit(pair), bitIndex(pair)]) {
        const y = pair & ~bit(x)
        for (const [s, t] of strongLinks(b, x, units)) {
          if (s === p || s === q || t === p || t === q) continue
          const linked = (sees(s, p) && sees(t, q)) || (sees(s, q) && sees(t, p))
          if (linked && eliminateSeeingAll(b, [p, q], y)) return true
        }
      }
    }
  }
  return false
}

function hXYWing(b: Board): boolean {
  for (let pivot = 0; pivot < 81; pivot++) {
    const xy = b.cand[pivot]
    if (popcount(xy) !== 2) continue
    for (const p1 of PEERS[pivot]) {
      for (const p2 of PEERS[pivot]) {
        if (p1 >= p2) continue
        const c1 = b.cand[p1]
        const c2 = b.cand[p2]
        if (popcount(c1) !== 2 || popcount(c2) !== 2) continue
        if (popcount(xy | c1 | c2) !== 3 || (xy & c1 & c2) || popcount(c1 & c2) !== 1) continue
        if (popcount(xy & c1) !== 1 || popcount(xy & c2) !== 1) continue
        if (eliminateSeeingAll(b, [p1, p2], c1 & c2, [pivot, p1, p2])) return true
      }
    }
  }
  return false
}

function hXYZWing(b: Board): boolean {
  for (let pivot = 0; pivot < 81; pivot++) {
    const xyz = b.cand[pivot]
    if (popcount(xyz) !== 3) continue
    for (const p1 of PEERS[pivot]) {
      for (const p2 of PEERS[pivot]) {
        if (p1 >= p2) continue
        const c1 = b.cand[p1]
        const c2 = b.cand[p2]
        if (popcount(c1) !== 2 || popcount(c2) !== 2 || c1 === c2) continue
        if ((c1 | c2) !== xyz || popcount(c1 & c2) !== 1) continue
        if (eliminateSeeingAll(b, [pivot, p1, p2], c1 & c2)) return true
      }
    }
  }
  return false
}

const LEVEL_ORDER: HodokuLevel[] = ['easy', 'medium', 'hard', 'unfair', 'extreme']
const LEVEL_MAX_SCORE: Record<HodokuLevel, number> = {
  easy: 800,
  medium: 1000,
  hard: 1600,
  unfair: 1800,
  extreme: Infinity,
}

interface HodokuTechnique {
  score: number
  level: HodokuLevel
  find: (b: HodokuBoard) => boolean
}

/** HoDoKu 2.2 default solver steps, in its solving order, up to XYZ-Wing. */
const H_TECHNIQUES: HodokuTechnique[] = [
  { score: 4, level: 'easy', find: hFullHouse },
  { score: 4, level: 'easy', find: hNakedSingle },
  { score: 14, level: 'easy', find: hHiddenSingle },
  { score: 40, level: 'medium', find: (b) => hNakedSubset(b, 2, true) },
  { score: 60, level: 'medium', find: (b) => hNakedSubset(b, 3, true) },
  { score: 50, level: 'medium', find: (b) => hLockedCandidates(b, true) },
  { score: 50, level: 'medium', find: (b) => hLockedCandidates(b, false) },
  { score: 60, level: 'medium', find: (b) => hNakedSubset(b, 2, false) },
  { score: 80, level: 'medium', find: (b) => hNakedSubset(b, 3, false) },
  { score: 70, level: 'medium', find: (b) => hHiddenSubset(b, 2) },
  { score: 100, level: 'medium', find: (b) => hHiddenSubset(b, 3) },
  { score: 120, level: 'hard', find: (b) => hNakedSubset(b, 4, false) },
  { score: 150, level: 'hard', find: (b) => hHiddenSubset(b, 4) },
  { score: 140, level: 'hard', find: (b) => hFish(b, 2) },
  { score: 150, level: 'hard', find: (b) => hFish(b, 3) },
  { score: 160, level: 'hard', find: (b) => hFish(b, 4) },
  { score: 110, level: 'hard', find: hRemotePair },
  { score: 100, level: 'hard', find: hBugPlusOne },
  { score: 130, level: 'hard', find: hSkyscraper },
  { score: 150, level: 'hard', find: hTwoStringKite },
  { score: 120, level: 'hard', find: hTurbotFish },
  { score: 120, level: 'hard', find: hEmptyRectangle },
  { score: 150, level: 'hard', find: hWWing },
  { score: 160, level: 'hard', find: hXYWing },
  { score: 180, level: 'hard', find: hXYZWing },
]

export interface HodokuResult {
  /** Total score, or null when a technique beyond XYZ-Wing is needed. */
  score: number | null
  level: HodokuLevel | null
}

export function rateHodoku(puzzle: readonly number[]): HodokuResult {
  const b = new HodokuBoard(puzzle)
  let score = 0
  let level = 0
  while (b.empties > 0) {
    const technique = H_TECHNIQUES.find((t) => t.find(b))
    if (!technique) return { score: null, level: null }
    score += technique.score
    level = Math.max(level, LEVEL_ORDER.indexOf(technique.level))
  }
  while (score > LEVEL_MAX_SCORE[LEVEL_ORDER[level]]) level++
  return { score, level: LEVEL_ORDER[level] }
}
