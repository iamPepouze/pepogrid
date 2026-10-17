/**
 * The key technique's lessons: one per technique family, with a section per technique and
 * examples drawn on real positions from the bank (src/data/lesson-positions.json, written by
 * scripts/bank/lesson-positions.ts). The prose and the steps are written here by hand.
 */
import positions from '../data/lesson-positions.json'
import { techniqueFamily } from './difficulty'
import { BOXES, PEERS, bit } from './grid'

/** A real position for a lesson, as scripts/bank/lesson-positions.ts saves it. */
export interface LessonPosition {
  /** The SE technique applied next. */
  technique: string
  /** Sudoku Explainer's one-line account of the step. */
  summary: string
  /** The bank puzzle's givens, 81 digits with 0 for empty. */
  puzzle: string
  /** The grid just before the step, givens and placed digits, 0 for empty. */
  values: string
  /** Each empty cell's candidates as digits, empty for a filled cell. */
  candidates: string[]
}

/** A digit in a cell: a candidate, or a digit placed there. */
export type CellDigit = [cell: number, digit: number]

/** A candidate: a digit still possible in an empty cell. */
export type Candidate = CellDigit

export interface LessonStep {
  caption: string
  /** Cells the step is about, shown at full strength; the rest fade. */
  focus: number[]
  /** Cells the reasoning turns on, drawn shaded. */
  highlight?: number[]
  /**
   * Placed digits the caption rests on ("row 1 already has a 3"), drawn shaded like `highlight`.
   * The tests check each cell holds its digit, so a caption naming the wrong cell fails them.
   */
  sources?: CellDigit[]
  /** Candidates the step points at, drawn in the accent colour. */
  marks?: Candidate[]
  /** Candidates the step rules out; later steps no longer show them. */
  eliminations?: Candidate[]
  /** The digit the step places; later steps show it as placed. */
  placement?: Candidate
}

export interface LessonExample {
  /** Key of its position in src/data/lesson-positions.json. */
  position: keyof typeof positions
  steps: LessonStep[]
}

export interface LessonSection {
  title: string
  /** The SE techniques this section teaches. */
  techniques: readonly string[]
  text: string
  examples: LessonExample[]
}

export interface Lesson {
  /** The technique family it teaches, as `techniqueFamily` names it. */
  family: string
  text: string
  sections: LessonSection[]
}

/** Cell index from a 1-based row and column, as the captions name them, so each step reads like its caption. */
const at = (row: number, col: number) => (row - 1) * 9 + col - 1

const TOP_MIDDLE_BOX = BOXES[1]

export const LESSONS: readonly Lesson[] = [
  {
    family: 'Singles',
    text: 'Every row, column and box needs each digit once. A single is a digit with only one place left to go.',
    sections: [
      {
        title: 'Hidden Single',
        techniques: ['Hidden Single'],
        text: 'Pick a box, row or column and a digit it still needs. Rule out every empty cell that already sees that digit in its row, column or box. When only one cell is left, the digit goes there, even if that cell has other candidates: the digit was hiding among them.',
        examples: [
          {
            position: 'hidden-single',
            steps: [
              {
                caption: 'The top-middle box still needs a 3. Four of its cells are empty: which of them can hold it?',
                focus: TOP_MIDDLE_BOX,
              },
              {
                caption: 'Row 1 already has a 3, at its far left, so the box’s empty cell in row 1 can’t be 3.',
                focus: [...TOP_MIDDLE_BOX, at(1, 1)],
                highlight: [at(1, 5)],
                sources: [[at(1, 1), 3]],
              },
              {
                caption: 'Columns 5 and 6 each have a 3 lower down, so the box’s cells in those columns, in row 2, can’t be 3 either.',
                focus: [...TOP_MIDDLE_BOX, at(6, 5), at(7, 6)],
                highlight: [at(2, 5), at(2, 6)],
                sources: [[at(6, 5), 3], [at(7, 6), 3]],
              },
              {
                caption: 'Only row 2, column 4 is left, so the 3 goes there, though that cell could also hold a 6. That’s a hidden single.',
                focus: TOP_MIDDLE_BOX,
                highlight: [at(2, 4)],
                marks: [[at(2, 4), 3]],
                placement: [at(2, 4), 3],
              },
            ],
          },
        ],
      },
    ],
  },
]

/** The lesson and section that teach `technique`, or null while it has none. */
export function lessonFor(technique: string): { lesson: Lesson; section: LessonSection } | null {
  const lesson = LESSONS.find((l) => l.family === techniqueFamily(technique))
  const section = lesson?.sections.find((s) => s.techniques.includes(technique))
  return lesson && section ? { lesson, section } : null
}

/** An example's position as grids: digits (0 for empty) and candidate masks. */
export function positionOf(example: LessonExample) {
  const p = positions[example.position] as LessonPosition
  return {
    technique: p.technique,
    puzzle: p.puzzle,
    values: [...p.values].map(Number),
    candidates: p.candidates.map((digits) => [...digits].reduce((mask, d) => mask | bit(Number(d)), 0)),
  }
}

/** How a lesson grid draws one cell at one step. */
export interface LessonCell {
  /** The digit in the cell, 0 when empty. */
  digit: number
  /** True when this step places the digit. */
  placed: boolean
  /** Bitmask of the cell's candidates at this step, the ones it marks or strikes included. */
  candidates: number
  /** Bitmask of the candidates this step points at. */
  marked: number
  /** Bitmask of the candidates this step rules out. */
  struck: number
  faded: boolean
  highlighted: boolean
}

/**
 * The grid of `example` at step `index`: earlier steps' placements and eliminations applied, this step's
 * marked, struck or placed. A cell this step fills keeps its candidates, so its marks still check against them.
 */
export function gridAt(example: LessonExample, index: number): LessonCell[] {
  const { values, candidates } = positionOf(example)
  for (const step of example.steps.slice(0, index)) {
    for (const [i, d] of step.eliminations ?? []) candidates[i] &= ~bit(d)
    if (step.placement) {
      const [i, d] = step.placement
      values[i] = d
      candidates[i] = 0
      for (const p of PEERS[i]) candidates[p] &= ~bit(d)
    }
  }
  const step = example.steps[index]
  const focus = new Set(step.focus)
  const highlight = new Set([...(step.highlight ?? []), ...(step.sources ?? []).map(([i]) => i)])
  return values.map((digit, i) => {
    const placed = step.placement?.[0] === i
    const masks = (list: Candidate[] = []) => list.reduce((m, [cell, d]) => (cell === i ? m | bit(d) : m), 0)
    return {
      digit: placed ? step.placement![1] : digit,
      placed,
      candidates: candidates[i],
      marked: masks(step.marks),
      struck: masks(step.eliminations),
      faded: !focus.has(i),
      highlighted: highlight.has(i),
    }
  })
}
