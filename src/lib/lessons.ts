/**
 * The key technique's lessons: one per technique family, with a section per technique and
 * examples drawn on real positions from the bank (src/data/lesson-positions.json, written by
 * scripts/bank/lesson-positions.ts). The prose and the steps are written here by hand.
 */
import positions from '../data/lesson-positions.json'
import { techniqueFamily } from './difficulty'
import { BOXES, COLS, PEERS, ROWS, bit } from './grid'

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

/** The technique a Sudoku Explainer summary is about: the text before its first colon (`X-Wing: Cells …`). */
export const summaryTechnique = (summary: string) => summary.split(':')[0].trim()

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
/** A row's or column's cells from its 1-based number, as the captions name them. */
const row = (n: number) => ROWS[n - 1]
const col = (n: number) => COLS[n - 1]

/** Every candidate of `digits` in `cells`, for steps that mark or strike a few digits across a few cells. */
const each = (cells: number[], digits: number[]): Candidate[] => cells.flatMap((i) => digits.map((d): Candidate => [i, d]))

const TOP_LEFT_BOX = BOXES[0]
const TOP_MIDDLE_BOX = BOXES[1]
const TOP_RIGHT_BOX = BOXES[2]
const MIDDLE_LEFT_BOX = BOXES[3]
const MIDDLE_RIGHT_BOX = BOXES[5]
const BOTTOM_MIDDLE_BOX = BOXES[7]
const NAKED_SINGLE_CELL = at(2, 8)
const X_WING_CELLS = [at(3, 4), at(6, 4), at(3, 7), at(6, 7)]
/** The cells that can hold the Swordfish lesson’s 9, column by column. */
const SWORDFISH_COLUMN_6 = [at(5, 6), at(8, 6)]
const SWORDFISH_COLUMN_7 = [at(1, 7), at(5, 7), at(8, 7)]
const SWORDFISH_CELLS = [...SWORDFISH_COLUMN_6, ...SWORDFISH_COLUMN_7, at(1, 8), at(8, 8)]
const XY_PIVOT = at(1, 2)
const XY_WINGS = [at(1, 4), at(3, 3)]
const CENTER_BOX = BOXES[4]
const BOTTOM_LEFT_BOX = BOXES[6]
/** Every cell, for steps about the whole grid, which fade nothing. */
const WHOLE_GRID = Array.from({ length: 81 }, (_, i) => i)
const XYZ_PIVOT = at(8, 6)
const XYZ_WINGS = [at(3, 6), at(8, 5)]
const NAKED_QUAD_CELLS = [at(7, 1), at(7, 2), at(7, 3), at(8, 3)]
/** Each uniqueness lesson’s rectangle or loop cells, in order round the pattern. */
const RECTANGLE_1_CELLS = [at(1, 2), at(1, 4), at(2, 4), at(2, 2)]
const RECTANGLE_2_CELLS = [at(3, 1), at(3, 3), at(7, 3), at(7, 1)]
const RECTANGLE_3_CELLS = [at(1, 2), at(1, 6), at(2, 6), at(2, 2)]
const RECTANGLE_4_CELLS = [at(5, 3), at(5, 9), at(6, 9), at(6, 3)]
const LOOP_1_CELLS = [at(2, 7), at(2, 8), at(4, 8), at(4, 4), at(6, 4), at(6, 7)]
const LOOP_2_CELLS = [at(3, 2), at(3, 3), at(4, 3), at(4, 1), at(7, 1), at(7, 2)]
const LOOP_3_CELLS = [at(1, 2), at(3, 2), at(3, 4), at(2, 4), at(2, 8), at(1, 8)]
const LOOP_4_CELLS = [at(7, 2), at(8, 2), at(8, 4), at(9, 4), at(9, 8), at(7, 8)]
const APE_CELLS = [at(3, 2), at(3, 3)]
/** The X-Cycle lesson’s cells, in the order its steps follow the 3s round the loop. */
const X_CYCLE_CELLS = [at(1, 6), at(3, 4), at(3, 2), at(2, 1), at(6, 1), at(6, 6)]

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
  {
    family: 'Naked Single',
    text: 'A cell’s peers are the 20 cells that share its row, column or box. A naked single is a cell whose peers already hold every digit but one.',
    sections: [
      {
        title: 'Naked Single',
        techniques: ['Naked Single'],
        text: 'Pick an empty cell and list the digits its peers hold. Each one is ruled out for the cell. When eight digits are ruled out, the ninth goes there: it is the cell’s only candidate, in plain sight.',
        examples: [
          {
            position: 'naked-single',
            steps: [
              {
                caption: 'Row 2, column 8 is empty. Which digits can it still hold? Look at its peers: its row, its column and its box.',
                focus: [NAKED_SINGLE_CELL, ...PEERS[NAKED_SINGLE_CELL]],
                highlight: [NAKED_SINGLE_CELL],
              },
              {
                caption: 'Row 2 already has a 2, a 3, a 5 and a 6, so the cell can’t hold any of them.',
                focus: [NAKED_SINGLE_CELL, ...PEERS[NAKED_SINGLE_CELL]],
                highlight: [NAKED_SINGLE_CELL],
                sources: [[at(2, 6), 2], [at(2, 9), 3], [at(2, 2), 5], [at(2, 5), 6]],
              },
              {
                caption: 'Column 8 adds a 1, a 4, a 7 and an 8. Its box has a 1, a 3 and a 5, all ruled out already.',
                focus: [NAKED_SINGLE_CELL, ...PEERS[NAKED_SINGLE_CELL]],
                highlight: [NAKED_SINGLE_CELL],
                sources: [[at(6, 8), 1], [at(5, 8), 4], [at(7, 8), 7], [at(4, 8), 8], [at(1, 7), 1], [at(2, 9), 3], [at(1, 8), 5]],
              },
              {
                caption: 'Every digit but 9 is ruled out, so the 9 goes there. That’s a naked single: the cell’s only candidate.',
                focus: [NAKED_SINGLE_CELL, ...PEERS[NAKED_SINGLE_CELL]],
                highlight: [NAKED_SINGLE_CELL],
                marks: [[NAKED_SINGLE_CELL, 9]],
                placement: [NAKED_SINGLE_CELL, 9],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Hidden subsets',
    text: 'When some digits a unit needs can only go in as many of its cells, those cells must hold exactly those digits, so their other candidates are ruled out. A direct hidden subset leaves a digit with one place to go.',
    sections: [
      {
        title: 'Direct Hidden Pair',
        techniques: ['Direct Hidden Pair'],
        text: 'Look for two digits that have the same two cells, and only those, in a row, column or box. Those cells must hold the pair, in some order, so any other candidate in them goes. Here that leaves another digit with a single place in the unit.',
        examples: [
          {
            position: 'direct-hidden-pair',
            steps: [
              {
                caption: 'Row 5 still needs a 1, a 2, a 4, a 5, a 6, a 7 and an 8. Where can its 1 and its 2 go?',
                focus: row(5),
              },
              {
                caption: 'Each is a candidate only in columns 2 and 3. Two digits, two cells: these cells must hold the 1 and the 2, in some order. That’s a hidden pair.',
                focus: row(5),
                highlight: [at(5, 2), at(5, 3)],
                marks: each([at(5, 2), at(5, 3)], [1, 2]),
              },
              {
                caption: 'With the 1 and the 2 taking both cells, nothing else fits there: their other candidates go.',
                focus: row(5),
                highlight: [at(5, 2), at(5, 3)],
                eliminations: [...each([at(5, 2)], [4, 5, 8]), ...each([at(5, 3)], [4, 7, 8])],
              },
              {
                caption: 'Row 5’s 8 now has only one place left, column 9, so the 8 goes there. The hidden pair led straight to a single: that makes it direct.',
                focus: row(5),
                highlight: [at(5, 9)],
                marks: [[at(5, 9), 8]],
                placement: [at(5, 9), 8],
              },
            ],
          },
        ],
      },
      {
        title: 'Direct Hidden Triplet',
        techniques: ['Direct Hidden Triplet'],
        text: 'Three digits whose only places in a unit are the same three cells form a hidden triplet. The three cells must hold those digits, so their other candidates go. Not every cell needs all three digits as candidates: what counts is that the digits have no other place.',
        examples: [
          {
            position: 'direct-hidden-triplet',
            steps: [
              {
                caption: 'Row 7 still needs a 1, a 2, a 3, a 4, an 8 and a 9. Where can its 3, its 4 and its 9 go?',
                focus: row(7),
              },
              {
                caption: 'All three are candidates only in columns 5, 6 and 7. Three digits, three cells: these cells must hold them, in some order. That’s a hidden triplet, though only one of the cells has all three.',
                focus: row(7),
                highlight: [at(7, 5), at(7, 6), at(7, 7)],
                marks: [...each([at(7, 5)], [3, 9]), ...each([at(7, 6)], [3, 4, 9]), ...each([at(7, 7)], [4, 9])],
              },
              {
                caption: 'With the 3, the 4 and the 9 taking those cells, nothing else fits there: their other candidates go.',
                focus: row(7),
                highlight: [at(7, 5), at(7, 6), at(7, 7)],
                eliminations: [...each([at(7, 5)], [1, 2, 8]), ...each([at(7, 6)], [2, 8]), ...each([at(7, 7)], [1, 2])],
              },
              {
                caption: 'Row 7’s 8 now has only one place left, column 1, so the 8 goes there. The hidden triplet led straight to a single: that makes it direct.',
                focus: row(7),
                highlight: [at(7, 1)],
                marks: [[at(7, 1), 8]],
                placement: [at(7, 1), 8],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Intersections',
    text: 'A box meets a row or column in three cells. When a box’s only places for a digit all lie in one row or column, that line’s copy of the digit must be in the box, so the rest of the line can’t hold it. That’s pointing. Claiming works the other way round: when a line’s only places for a digit all lie in one box, the rest of the box can’t hold it.',
    sections: [
      {
        title: 'Pointing',
        techniques: ['Pointing'],
        text: 'Pick a box and a digit it still needs. If every cell in the box with that candidate lies in the same row or column, the box points along that line: the digit is ruled out in the rest of the line, outside the box.',
        examples: [
          {
            position: 'pointing',
            steps: [
              {
                caption: 'The top-left box still needs a 6. Which of its cells can hold it?',
                focus: TOP_LEFT_BOX,
              },
              {
                caption: 'Only two, in rows 1 and 2, and both are in column 2. So whichever holds the box’s 6 is also column 2’s 6.',
                focus: [...TOP_LEFT_BOX, ...col(2)],
                highlight: [at(1, 2), at(2, 2)],
                marks: each([at(1, 2), at(2, 2)], [6]),
              },
              {
                caption: 'So no other cell in column 2 can be 6, and the 6 in row 4 goes. That’s pointing: the box points along the column.',
                focus: [...TOP_LEFT_BOX, ...col(2)],
                highlight: [at(1, 2), at(2, 2)],
                marks: each([at(1, 2), at(2, 2)], [6]),
                eliminations: [[at(4, 2), 6]],
              },
            ],
          },
        ],
      },
      {
        title: 'Direct Pointing',
        techniques: ['Direct Pointing'],
        text: 'Pointing is direct when the candidates it rules out leave a digit with one place to go in another unit, so it leads straight to a single.',
        examples: [
          {
            position: 'direct-pointing',
            steps: [
              {
                caption: 'The middle-left box still needs a 2, and every cell that can hold it is in row 4.',
                focus: MIDDLE_LEFT_BOX,
                highlight: [at(4, 1), at(4, 2), at(4, 3)],
                marks: each([at(4, 1), at(4, 2), at(4, 3)], [2]),
              },
              {
                caption: 'So row 4’s 2 is in that box, and no other cell in row 4 can be 2: the box points along the row.',
                focus: [...MIDDLE_LEFT_BOX, ...row(4)],
                highlight: [at(4, 1), at(4, 2), at(4, 3)],
                eliminations: each([at(4, 5), at(4, 6), at(4, 8)], [2]),
              },
              {
                caption: 'The middle-right box needs a 2 too. With row 4 ruled out, only row 5, column 8 can hold it, so the 2 goes there. The pointing led straight to a single: that makes it direct.',
                focus: MIDDLE_RIGHT_BOX,
                highlight: [at(5, 8)],
                marks: [[at(5, 8), 2]],
                placement: [at(5, 8), 2],
              },
            ],
          },
        ],
      },
      {
        title: 'Claiming',
        techniques: ['Claiming'],
        text: 'Pick a row or column and a digit it still needs. If every cell in the line with that candidate lies in the same box, the line claims the digit for that box: it is ruled out in the rest of the box, outside the line.',
        examples: [
          {
            position: 'claiming',
            steps: [
              {
                caption: 'Row 1 still needs a 4, a 5, a 6 and an 8. Which of its cells can hold the 8?',
                focus: row(1),
              },
              {
                caption: 'Only two, in columns 7 and 9, and both are in the top-right box. So whichever holds row 1’s 8 is also the box’s 8.',
                focus: [...row(1), ...TOP_RIGHT_BOX],
                highlight: [at(1, 7), at(1, 9)],
                marks: each([at(1, 7), at(1, 9)], [8]),
              },
              {
                caption: 'So no other cell in the box can be 8: the 8s in row 2, column 7 and row 3, column 9 go. That’s claiming: the row claims the 8 for the box.',
                focus: [...row(1), ...TOP_RIGHT_BOX],
                highlight: [at(1, 7), at(1, 9)],
                marks: each([at(1, 7), at(1, 9)], [8]),
                eliminations: [[at(2, 7), 8], [at(3, 9), 8]],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Subsets',
    text: 'A subset ties a few cells of a unit to as many digits. In a naked subset, the cells’ candidates are only those digits, so the digits fill the cells and the rest of the unit can’t hold them. In a hidden subset, the digits have no other place in the unit, so the cells hold them and their other candidates go.',
    sections: [
      {
        title: 'Naked Pair',
        techniques: ['Naked Pair'],
        text: 'Look for two cells in a row, column or box with the same two candidates and no others. One holds each digit, in some order, so no other cell of that unit can hold either.',
        examples: [
          {
            position: 'naked-pair',
            steps: [
              {
                caption: 'Column 8 has five empty cells. Look at rows 3 and 4: each can only hold a 5 or a 7.',
                focus: col(8),
                highlight: [at(3, 8), at(4, 8)],
                marks: each([at(3, 8), at(4, 8)], [5, 7]),
              },
              {
                caption: 'Two cells, two digits: one cell is the 5 and the other the 7, in some order. That’s a naked pair.',
                focus: col(8),
                highlight: [at(3, 8), at(4, 8)],
                marks: each([at(3, 8), at(4, 8)], [5, 7]),
              },
              {
                caption: 'With the 5 and the 7 taken, no other cell in column 8 can hold them: the 5 in row 5 and the 7s in rows 7 and 9 go.',
                focus: col(8),
                highlight: [at(3, 8), at(4, 8)],
                eliminations: [[at(5, 8), 5], [at(7, 8), 7], [at(9, 8), 7]],
              },
            ],
          },
        ],
      },
      {
        title: 'Naked Triplet',
        techniques: ['Naked Triplet'],
        text: 'Three cells of a unit whose candidates, together, are only three digits form a naked triplet. The three digits fill those cells, in some order, so no other cell of the unit can hold them. A cell needn’t have all three: cells with a 4 or a 5, a 5 or a 6, and a 4 or a 6 are a triplet too.',
        examples: [
          {
            position: 'naked-triplet',
            steps: [
              {
                caption: 'Column 8 has six empty cells. Look at rows 2, 4 and 5: each can only hold a 4, a 5 or a 6.',
                focus: col(8),
                highlight: [at(2, 8), at(4, 8), at(5, 8)],
                marks: each([at(2, 8), at(4, 8), at(5, 8)], [4, 5, 6]),
              },
              {
                caption: 'Three cells, three digits: the 4, the 5 and the 6 fill these cells, in some order. That’s a naked triplet.',
                focus: col(8),
                highlight: [at(2, 8), at(4, 8), at(5, 8)],
                marks: each([at(2, 8), at(4, 8), at(5, 8)], [4, 5, 6]),
              },
              {
                caption: 'With those three digits taken, no other cell in column 8 can hold them: the 4 and the 5 in row 3 go.',
                focus: col(8),
                highlight: [at(2, 8), at(4, 8), at(5, 8)],
                eliminations: each([at(3, 8)], [4, 5]),
              },
            ],
          },
        ],
      },
      {
        title: 'Naked Quad',
        techniques: ['Naked Quad'],
        text: 'Four cells of a unit whose candidates, together, are only four digits form a naked quad. The four digits fill those cells, in some order, so no other cell of the unit can hold them. As with a triplet, a cell needn’t have all four.',
        examples: [
          {
            position: 'naked-quad',
            steps: [
              {
                caption: 'The bottom-left box has nine empty cells. Look at row 7’s three and row 8, column 3: between them, they hold only a 1, a 2, a 5 or a 9.',
                focus: BOTTOM_LEFT_BOX,
                highlight: NAKED_QUAD_CELLS,
                marks: [...each([at(7, 1)], [1, 2]), ...each([at(7, 2)], [5, 9]), ...each([at(7, 3)], [1, 2, 5, 9]), ...each([at(8, 3)], [2, 9])],
              },
              {
                caption: 'Four cells, four digits: the 1, the 2, the 5 and the 9 fill these cells, in some order. That’s a naked quad.',
                focus: BOTTOM_LEFT_BOX,
                highlight: NAKED_QUAD_CELLS,
                marks: [...each([at(7, 1)], [1, 2]), ...each([at(7, 2)], [5, 9]), ...each([at(7, 3)], [1, 2, 5, 9]), ...each([at(8, 3)], [2, 9])],
              },
              {
                caption: 'With those four digits taken, no other cell in the box can hold them: the 9 in row 8, column 2 and the 1 and the 2 in row 9, column 3 go.',
                focus: BOTTOM_LEFT_BOX,
                highlight: NAKED_QUAD_CELLS,
                eliminations: [[at(8, 2), 9], ...each([at(9, 3)], [1, 2])],
              },
            ],
          },
        ],
      },
      {
        title: 'Hidden Pair',
        techniques: ['Hidden Pair'],
        text: 'Look for two digits a unit needs whose only places in it are the same two cells. Those cells must hold the pair, in some order, so any other candidate in them goes. The pair was hiding among those candidates.',
        examples: [
          {
            position: 'hidden-pair',
            steps: [
              {
                caption: 'The bottom-middle box still needs a 2, a 3, a 5, a 6, a 7, an 8 and a 9. Where can its 8 and its 9 go?',
                focus: BOTTOM_MIDDLE_BOX,
              },
              {
                caption: 'Each is a candidate only in row 9, columns 5 and 6. Two digits, two cells: these cells must hold the 8 and the 9, in some order. That’s a hidden pair.',
                focus: BOTTOM_MIDDLE_BOX,
                highlight: [at(9, 5), at(9, 6)],
                marks: each([at(9, 5), at(9, 6)], [8, 9]),
              },
              {
                caption: 'With the 8 and the 9 taking both cells, nothing else fits there: the 3 in column 5 and the 5 in column 6 go.',
                focus: BOTTOM_MIDDLE_BOX,
                highlight: [at(9, 5), at(9, 6)],
                eliminations: [[at(9, 5), 3], [at(9, 6), 5]],
              },
            ],
          },
        ],
      },
      {
        title: 'Hidden Triplet',
        techniques: ['Hidden Triplet'],
        text: 'Three digits whose only places in a unit are the same three cells form a hidden triplet. The three cells must hold those digits, so their other candidates go. Not every cell needs all three digits as candidates: what counts is that the digits have no other place.',
        examples: [
          {
            position: 'hidden-triplet',
            steps: [
              {
                caption: 'The middle-right box still needs every digit but 2. Where can its 1, its 8 and its 9 go?',
                focus: MIDDLE_RIGHT_BOX,
              },
              {
                caption: 'All three are candidates only in row 5, column 9 and row 6, columns 8 and 9. Three digits, three cells: these cells must hold them, in some order. That’s a hidden triplet, though row 5, column 9 has no 9.',
                focus: MIDDLE_RIGHT_BOX,
                highlight: [at(5, 9), at(6, 8), at(6, 9)],
                marks: [...each([at(5, 9)], [1, 8]), ...each([at(6, 8), at(6, 9)], [1, 8, 9])],
              },
              {
                caption: 'With the 1, the 8 and the 9 taking those cells, nothing else fits there: the 6 and the 7 in row 5, column 9 go.',
                focus: MIDDLE_RIGHT_BOX,
                highlight: [at(5, 9), at(6, 8), at(6, 9)],
                eliminations: each([at(5, 9)], [6, 7]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Fish',
    text: 'A fish works on one digit. When the digit’s only places in a few columns all lie in as many rows, those columns put their copies of the digit in those rows, so no other cell of the rows can hold it. The same goes with rows and columns swapped.',
    sections: [
      {
        title: 'X-Wing',
        techniques: ['X-Wing'],
        text: 'Pick a digit and find two columns where it has only two places each, in the same two rows. Each column’s copy is in one of those rows, and the two copies can’t share a row, so they take both rows. No other cell of those rows can hold the digit.',
        examples: [
          {
            position: 'x-wing',
            steps: [
              {
                caption: 'Column 4 still needs an 8, and only two of its cells can hold it: in rows 3 and 6.',
                focus: col(4),
                highlight: [at(3, 4), at(6, 4)],
                marks: each([at(3, 4), at(6, 4)], [8]),
              },
              {
                caption: 'Column 7 needs an 8 too, and it can also only go in rows 3 or 6.',
                focus: [...col(4), ...col(7)],
                highlight: X_WING_CELLS,
                marks: each(X_WING_CELLS, [8]),
              },
              {
                caption: 'The two 8s can’t share a row, so one is in row 3 and the other in row 6. Either way, rows 3 and 6 get their 8 in columns 4 and 7. That’s an X-Wing.',
                focus: [...col(4), ...col(7), ...row(3), ...row(6)],
                highlight: X_WING_CELLS,
                marks: each(X_WING_CELLS, [8]),
              },
              {
                caption: 'So no other cell of rows 3 and 6 can be 8: the 8s in columns 6, 8 and 9 go.',
                focus: [...col(4), ...col(7), ...row(3), ...row(6)],
                highlight: X_WING_CELLS,
                marks: each(X_WING_CELLS, [8]),
                eliminations: [...each([at(3, 6), at(3, 9)], [8]), ...each([at(6, 6), at(6, 8), at(6, 9)], [8])],
              },
            ],
          },
        ],
      },
      {
        title: 'Swordfish',
        techniques: ['Swordfish'],
        text: 'A swordfish is an X-Wing with three columns and three rows. The digit’s places in three columns all lie in the same three rows, so the columns’ copies take one row each and no other cell of those rows can hold it. A column may have only two of the three places.',
        examples: [
          {
            position: 'swordfish',
            steps: [
              {
                caption: 'Column 6 still needs a 9, and only rows 5 and 8 can hold it.',
                focus: col(6),
                highlight: SWORDFISH_COLUMN_6,
                marks: each(SWORDFISH_COLUMN_6, [9]),
              },
              {
                caption: 'Column 7’s 9 can go in rows 1, 5 or 8.',
                focus: [...col(6), ...col(7)],
                highlight: [...SWORDFISH_COLUMN_6, ...SWORDFISH_COLUMN_7],
                marks: each([...SWORDFISH_COLUMN_6, ...SWORDFISH_COLUMN_7], [9]),
              },
              {
                caption: 'And column 8’s 9 only in rows 1 or 8. Three columns, and all their places for a 9 lie in rows 1, 5 and 8.',
                focus: [...col(6), ...col(7), ...col(8)],
                highlight: SWORDFISH_CELLS,
                marks: each(SWORDFISH_CELLS, [9]),
              },
              {
                caption: 'The three 9s can’t share a row, so they take one row each: rows 1, 5 and 8 get their 9 in these columns. That’s a Swordfish.',
                focus: [...col(6), ...col(7), ...col(8), ...row(1), ...row(5), ...row(8)],
                highlight: SWORDFISH_CELLS,
                marks: each(SWORDFISH_CELLS, [9]),
              },
              {
                caption: 'So no other cell of rows 1, 5 and 8 can be 9: the 9s in columns 4, 5 and 9 go.',
                focus: [...col(6), ...col(7), ...col(8), ...row(1), ...row(5), ...row(8)],
                highlight: SWORDFISH_CELLS,
                marks: each(SWORDFISH_CELLS, [9]),
                eliminations: each([at(1, 9), at(5, 4), at(5, 5), at(5, 9), at(8, 9)], [9]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Wings',
    text: 'A wing is a pivot cell and two wings: peers of the pivot with two candidates each, sharing one digit. Whatever the pivot holds, that digit ends up in one of the pattern’s cells, so a cell that is a peer of every cell that could hold it can’t.',
    sections: [
      {
        title: 'XY-Wing',
        techniques: ['XY-Wing'],
        text: 'The pivot has two candidates, X and Y. One wing has X and Z, the other Y and Z. If the pivot is X, the first wing is left with Z; if it is Y, the second one is. Either way a wing holds Z, so Z goes from every cell that is a peer of both wings.',
        examples: [
          {
            position: 'xy-wing',
            steps: [
              {
                caption: 'Row 1, column 2 can only hold a 1 or a 7. It is the pivot.',
                focus: [XY_PIVOT, ...XY_WINGS],
                highlight: [XY_PIVOT],
                marks: each([XY_PIVOT], [1, 7]),
              },
              {
                caption: 'If the pivot is 1, row 1, column 4, in the same row, can’t be 1, so it is left with its 2.',
                focus: [XY_PIVOT, ...XY_WINGS],
                highlight: [XY_PIVOT, at(1, 4)],
                marks: [[XY_PIVOT, 1], [at(1, 4), 2]],
              },
              {
                caption: 'If the pivot is 7 instead, row 3, column 3, in the same box, can’t be 7, so it is left with its 2.',
                focus: [XY_PIVOT, ...XY_WINGS],
                highlight: [XY_PIVOT, at(3, 3)],
                marks: [[XY_PIVOT, 7], [at(3, 3), 2]],
              },
              {
                caption: 'Either way, one of the two wings is a 2. That’s an XY-Wing: a pivot and two wings.',
                focus: [XY_PIVOT, ...XY_WINGS],
                highlight: [XY_PIVOT, ...XY_WINGS],
                marks: each(XY_WINGS, [2]),
              },
              {
                caption: 'Row 3, column 5 is a peer of both wings: it shares row 3 with one and the top-middle box with the other. Whichever wing is the 2, this cell can’t be, so its 2 goes.',
                focus: [XY_PIVOT, ...row(3), ...TOP_MIDDLE_BOX],
                highlight: XY_WINGS,
                marks: each(XY_WINGS, [2]),
                eliminations: [[at(3, 5), 2]],
              },
            ],
          },
        ],
      },
      {
        title: 'XYZ-Wing',
        techniques: ['XYZ-Wing'],
        text: 'An XYZ-Wing is an XY-Wing whose pivot can also hold the shared digit: the pivot has X, Y and Z, one wing X and Z, the other Y and Z. Whatever the pivot holds, Z ends up in the pivot or a wing, so Z goes from every cell that is a peer of all three.',
        examples: [
          {
            position: 'xyz-wing',
            steps: [
              {
                caption: 'Row 8, column 6 can hold a 6, an 8 or a 9. It is the pivot.',
                focus: [XYZ_PIVOT, ...XYZ_WINGS],
                highlight: [XYZ_PIVOT],
                marks: each([XYZ_PIVOT], [6, 8, 9]),
              },
              {
                caption: 'If the pivot is 6, row 3, column 6, in the same column, can’t be 6, so it is left with its 8.',
                focus: [XYZ_PIVOT, ...XYZ_WINGS],
                highlight: [XYZ_PIVOT, at(3, 6)],
                marks: [[XYZ_PIVOT, 6], [at(3, 6), 8]],
              },
              {
                caption: 'If the pivot is 9, row 8, column 5, in the same row, can’t be 9, so it is left with its 8.',
                focus: [XYZ_PIVOT, ...XYZ_WINGS],
                highlight: [XYZ_PIVOT, at(8, 5)],
                marks: [[XYZ_PIVOT, 9], [at(8, 5), 8]],
              },
              {
                caption: 'And if the pivot is neither, it is the 8 itself. Either way, one of the three cells is an 8. That’s an XYZ-Wing.',
                focus: [XYZ_PIVOT, ...XYZ_WINGS],
                highlight: [XYZ_PIVOT, ...XYZ_WINGS],
                marks: each([XYZ_PIVOT, ...XYZ_WINGS], [8]),
              },
              {
                caption: 'Row 7, column 6 is a peer of all three: it shares column 6 with the pivot and one wing, and the bottom-middle box with the pivot and the other. Whichever of them is the 8, this cell can’t be, so its 8 goes.',
                focus: [...col(6), ...BOTTOM_MIDDLE_BOX],
                highlight: [XYZ_PIVOT, ...XYZ_WINGS],
                marks: each([XYZ_PIVOT, ...XYZ_WINGS], [8]),
                eliminations: [[at(7, 6), 8]],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Uniqueness',
    text: 'A puzzle has exactly one solution. When some cells could only hold two digits, in either of two orders, with every row, column and box they touch holding both digits either way, nothing could tell the two orders apart: the puzzle would have two solutions. So whatever would complete such a pattern can’t happen.',
    sections: [
      {
        title: 'Unique Rectangle type 1',
        techniques: ['Unique Rectangle type 1'],
        text: 'Look for four cells at the corners of a rectangle, in two rows, two columns and two boxes, where three corners hold only the same two candidates. If the fourth held only those two as well, the digits could swap round the corners. So the fourth corner can’t hold either of them.',
        examples: [
          {
            position: 'unique-rectangle-1',
            steps: [
              {
                caption: 'Rows 1 and 2, columns 2 and 4: these cells are the corners of a rectangle in two boxes. Three of them can only hold a 2 or a 4.',
                focus: [...TOP_LEFT_BOX, ...TOP_MIDDLE_BOX],
                highlight: RECTANGLE_1_CELLS,
                marks: each([at(1, 2), at(1, 4), at(2, 4)], [2, 4]),
              },
              {
                caption: 'If row 2, column 2 held only a 2 or a 4 too, the 2s and the 4s would sit diagonally, one way or the other. Each row, column and box would hold one of each either way, so the puzzle would have two solutions.',
                focus: [...TOP_LEFT_BOX, ...TOP_MIDDLE_BOX],
                highlight: RECTANGLE_1_CELLS,
                marks: each(RECTANGLE_1_CELLS, [2, 4]),
              },
              {
                caption: 'It has only one, so row 2, column 2 can’t be 2 or 4: both go, leaving its 3. That’s a unique rectangle, type 1.',
                focus: [...TOP_LEFT_BOX, ...TOP_MIDDLE_BOX],
                highlight: RECTANGLE_1_CELLS,
                eliminations: each([at(2, 2)], [2, 4]),
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Rectangle type 2',
        techniques: ['Unique Rectangle type 2'],
        text: 'Two corners of the rectangle hold only the pair. The other two, sharing a unit, hold the pair and the same extra candidate. One of them must be that extra digit, or the pair could swap round the corners, so it goes from every cell that is a peer of both.',
        examples: [
          {
            position: 'unique-rectangle-2',
            steps: [
              {
                caption: 'Rows 3 and 7, columns 1 and 3: these cells are the corners of a rectangle in two boxes. All four can hold a 2 or a 6, and the two in row 3 nothing else.',
                focus: [...TOP_LEFT_BOX, ...BOTTOM_LEFT_BOX],
                highlight: RECTANGLE_2_CELLS,
                marks: each(RECTANGLE_2_CELLS, [2, 6]),
              },
              {
                caption: 'The two in row 7 can also hold a 1. If neither were 1, all four would be left with the 2 and the 6, which could swap: two solutions. So one of them is the 1.',
                focus: [...TOP_LEFT_BOX, ...BOTTOM_LEFT_BOX],
                highlight: [at(7, 1), at(7, 3)],
                marks: each([at(7, 1), at(7, 3)], [1]),
              },
              {
                caption: 'Whichever it is, a cell that is a peer of both can’t be 1: the 1s in row 7, columns 4 and 7, and in row 8, column 3 go. That’s a unique rectangle, type 2.',
                focus: [...TOP_LEFT_BOX, ...BOTTOM_LEFT_BOX, ...row(7)],
                highlight: [at(7, 1), at(7, 3)],
                marks: each([at(7, 1), at(7, 3)], [1]),
                eliminations: [[at(7, 4), 1], [at(7, 7), 1], [at(8, 3), 1]],
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Rectangle type 3',
        techniques: ['Unique Rectangle type 3'],
        text: 'Two corners of the rectangle hold only the pair. The other two, sharing a unit, have extra candidates, and one of them must hold an extra digit, or the pair could swap. In their shared unit, that cell is taken: the extras act like one cell holding only them, which can form a subset with other cells of the unit, and the pair’s digits have one place fewer, which can make a hidden subset.',
        examples: [
          {
            position: 'unique-rectangle-3',
            steps: [
              {
                caption: 'Rows 1 and 2, columns 2 and 6: these cells are the corners of a rectangle in two boxes. All four can hold a 3 or a 5, and the two in column 6 nothing else.',
                focus: [...TOP_LEFT_BOX, ...TOP_MIDDLE_BOX],
                highlight: RECTANGLE_3_CELLS,
                marks: each(RECTANGLE_3_CELLS, [3, 5]),
              },
              {
                caption: 'The two in column 2 have more: a 1 and a 7 in row 1, a 6 in row 2. One of them must hold one of those, or the 3s and the 5s could swap round the corners.',
                focus: [...TOP_LEFT_BOX, ...TOP_MIDDLE_BOX],
                highlight: [at(1, 2), at(2, 2)],
                marks: [...each([at(1, 2)], [1, 7]), [at(2, 2), 6]],
              },
              {
                caption: 'Now the top-left box’s 3 and 5: both can only go in column 2, rows 1 to 3. One of the first two cells is taken, so the 3 and the 5 take the other one and row 3: a hidden pair.',
                focus: TOP_LEFT_BOX,
                highlight: [at(1, 2), at(2, 2), at(3, 2)],
                marks: each([at(1, 2), at(2, 2), at(3, 2)], [3, 5]),
              },
              {
                caption: 'So row 3, column 2 is a 3 or a 5, and its 7 goes. That’s a unique rectangle, type 3.',
                focus: TOP_LEFT_BOX,
                highlight: [at(1, 2), at(2, 2), at(3, 2)],
                eliminations: [[at(3, 2), 7]],
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Rectangle type 4',
        techniques: ['Unique Rectangle type 4'],
        text: 'Two corners of the rectangle hold only the pair. The other two, sharing a unit, hold more. When one digit of the pair has no other place in that unit, one of the two cells holds it, so neither can hold the pair’s other digit: that would complete the rectangle.',
        examples: [
          {
            position: 'unique-rectangle-4',
            steps: [
              {
                caption: 'Rows 5 and 6, columns 3 and 9: these cells are the corners of a rectangle in two boxes. All four can hold a 3 or a 5, and the two in row 6 nothing else.',
                focus: [...MIDDLE_LEFT_BOX, ...MIDDLE_RIGHT_BOX],
                highlight: RECTANGLE_4_CELLS,
                marks: each(RECTANGLE_4_CELLS, [3, 5]),
              },
              {
                caption: 'Row 5’s 3 can only go in its two corners, columns 3 and 9, so one of them is the 3.',
                focus: [...MIDDLE_LEFT_BOX, ...MIDDLE_RIGHT_BOX, ...row(5)],
                highlight: [at(5, 3), at(5, 9)],
                marks: each([at(5, 3), at(5, 9)], [3]),
              },
              {
                caption: 'If the other were 5, all four corners would hold only 3s and 5s, which could swap: two solutions. So neither can be 5, and both 5s go. That’s a unique rectangle, type 4.',
                focus: [...MIDDLE_LEFT_BOX, ...MIDDLE_RIGHT_BOX, ...row(5)],
                highlight: [at(5, 3), at(5, 9)],
                marks: each([at(5, 3), at(5, 9)], [3]),
                eliminations: each([at(5, 3), at(5, 9)], [5]),
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Loop type 1',
        techniques: ['Unique Loop 6 type 1', 'Unique Loop 8 type 1', 'Unique Loop 10 type 1'],
        text: 'A unique loop is a rectangle with more corners: a closed path of 6, 8 or 10 cells where each row, column and box it touches holds exactly two of them. When every cell but one holds only the same two candidates, the digits could alternate round the loop either way, so the last cell can’t hold either.',
        examples: [
          {
            position: 'unique-loop-1',
            steps: [
              {
                caption: 'These six cells form a closed loop through rows 2, 4 and 6. Each row, column and box it touches holds two of them.',
                focus: LOOP_1_CELLS,
                highlight: LOOP_1_CELLS,
              },
              {
                caption: 'Five of them can only hold a 4 or a 7. Row 2, column 8 can also hold a 9.',
                focus: LOOP_1_CELLS,
                highlight: LOOP_1_CELLS,
                marks: each([at(2, 7), at(4, 8), at(4, 4), at(6, 4), at(6, 7)], [4, 7]),
              },
              {
                caption: 'If row 2, column 8 held only a 4 or a 7 too, the digits would alternate round the loop, 4, 7, 4, 7, one way or the other. Each row, column and box would hold one of each either way, so the puzzle would have two solutions.',
                focus: LOOP_1_CELLS,
                highlight: LOOP_1_CELLS,
                marks: each(LOOP_1_CELLS, [4, 7]),
              },
              {
                caption: 'It has only one, so row 2, column 8 can’t be 4 or 7: both go, leaving its 9. That’s a unique loop, type 1.',
                focus: LOOP_1_CELLS,
                highlight: LOOP_1_CELLS,
                eliminations: each([at(2, 8)], [4, 7]),
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Loop type 2',
        techniques: ['Unique Loop 6 type 2', 'Unique Loop 8 type 2', 'Unique Loop 10 type 2'],
        text: 'As with a rectangle of type 2, the loop’s cells hold the pair, and some of them the same extra candidate. One of those must be the extra digit, or the pair could alternate round the loop, so it goes from every cell that is a peer of all of them. Loops of 8 and 10 cells work the same way.',
        examples: [
          {
            position: 'unique-loop-2',
            steps: [
              {
                caption: 'These six cells form a closed loop through rows 3, 4 and 7, each row, column and box it touches holding two of them. All six can hold a 3 or a 6.',
                focus: LOOP_2_CELLS,
                highlight: LOOP_2_CELLS,
                marks: each(LOOP_2_CELLS, [3, 6]),
              },
              {
                caption: 'Two of them, row 4, column 3 and row 7, column 2, can also hold a 7. If neither were 7, the 3s and the 6s could alternate round the loop either way: two solutions. So one of them is the 7.',
                focus: LOOP_2_CELLS,
                highlight: [at(4, 3), at(7, 2)],
                marks: each([at(4, 3), at(7, 2)], [7]),
              },
              {
                caption: 'Whichever it is, a cell that is a peer of both can’t be 7: the 7s in row 5, column 2 and in row 7, column 3 go. That’s a unique loop, type 2.',
                focus: [...LOOP_2_CELLS, at(5, 2), at(7, 3)],
                highlight: [at(4, 3), at(7, 2)],
                marks: each([at(4, 3), at(7, 2)], [7]),
                eliminations: each([at(5, 2), at(7, 3)], [7]),
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Loop type 3',
        techniques: ['Unique Loop 6 type 3', 'Unique Loop 8 type 3'],
        text: 'As with a rectangle of type 3, two cells of the loop that share a unit have extra candidates, and one of them must hold an extra digit. In their shared unit, that cell is taken, which can make a subset with other cells of the unit. Loops of 8 cells work the same way.',
        examples: [
          {
            position: 'unique-loop-3',
            steps: [
              {
                caption: 'These six cells form a closed loop through rows 1 to 3, each row, column and box it touches holding two of them. All six can hold a 2 or a 7, and four of them nothing else.',
                focus: LOOP_3_CELLS,
                highlight: LOOP_3_CELLS,
                marks: each(LOOP_3_CELLS, [2, 7]),
              },
              {
                caption: 'Column 8’s two can also hold a 3 or a 9. One of them must hold one of those, or the 2s and the 7s could alternate round the loop either way.',
                focus: LOOP_3_CELLS,
                highlight: [at(1, 8), at(2, 8)],
                marks: each([at(1, 8), at(2, 8)], [3, 9]),
              },
              {
                caption: 'Now column 8’s 2 and 7: they can only go in rows 1, 2 and 8. One of the first two cells is taken, so the 2 and the 7 take the other one and row 8: a hidden pair.',
                focus: col(8),
                highlight: [at(1, 8), at(2, 8), at(8, 8)],
                marks: [...each([at(1, 8), at(2, 8)], [2, 7]), [at(8, 8), 7]],
              },
              {
                caption: 'So row 8, column 8 is a 2 or a 7. It has no 2, so it is the 7, and its 3 and 4 go. That’s a unique loop, type 3.',
                focus: col(8),
                highlight: [at(1, 8), at(2, 8), at(8, 8)],
                marks: [[at(8, 8), 7]],
                eliminations: each([at(8, 8)], [3, 4]),
              },
            ],
          },
        ],
      },
      {
        title: 'Unique Loop type 4',
        techniques: ['Unique Loop 6 type 4'],
        text: 'As with a rectangle of type 4, two cells of the loop that share a unit hold more than the pair. When one digit of the pair has no other place in that unit, one of the two holds it, so neither can hold the pair’s other digit. Loops of 8 and 10 cells work the same way.',
        examples: [
          {
            position: 'unique-loop-4',
            steps: [
              {
                caption: 'These six cells form a closed loop through rows 7 to 9, each row, column and box it touches holding two of them. All six can hold a 7 or a 9, and four of them nothing else.',
                focus: LOOP_4_CELLS,
                highlight: LOOP_4_CELLS,
                marks: each(LOOP_4_CELLS, [7, 9]),
              },
              {
                caption: 'Column 8’s 9 can only go in two of them, rows 7 and 9, so one of those is the 9.',
                focus: [...LOOP_4_CELLS, ...col(8)],
                highlight: [at(7, 8), at(9, 8)],
                marks: each([at(7, 8), at(9, 8)], [9]),
              },
              {
                caption: 'If the other were 7, every cell of the loop would hold only 7s and 9s, which could alternate either way: two solutions. So neither can be 7, and both 7s go. That’s a unique loop, type 4.',
                focus: [...LOOP_4_CELLS, ...col(8)],
                highlight: [at(7, 8), at(9, 8)],
                marks: each([at(7, 8), at(9, 8)], [9]),
                eliminations: each([at(7, 8), at(9, 8)], [7]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'BUG',
    text: 'A BUG, or bivalue universal grave, is a grid where every empty cell has exactly two candidates and every candidate has exactly two places in each of its units. Such a grid has no solution or several, never exactly one. So when a few extra candidates are all that stand between the grid and a BUG, one of them must be true.',
    sections: [
      {
        title: 'BUG type 1',
        techniques: ['BUG type 1'],
        text: 'Every empty cell has two candidates but one, which has three. Its extra digit is the one with three places in the cell’s units. Without it the grid would be a BUG, so the cell must be that digit.',
        examples: [
          {
            position: 'bug-1',
            steps: [
              {
                caption: 'Every empty cell here has exactly two candidates, except row 1, column 2, which has three: a 1, an 8 and a 9.',
                focus: WHOLE_GRID,
                highlight: [at(1, 2)],
                marks: each([at(1, 2)], [1, 8, 9]),
              },
              {
                caption: 'Look at its 9. Row 1, column 2 and the top-left box each have three places for a 9, one too many. Every other candidate has exactly two places in each of its units.',
                focus: [...row(1), ...col(2), ...TOP_LEFT_BOX],
                highlight: [at(1, 2), at(1, 3), at(1, 8), at(2, 2), at(7, 2)],
                marks: each([at(1, 2), at(1, 3), at(1, 8), at(2, 2), at(7, 2)], [9]),
              },
              {
                caption: 'Without that 9, the grid would be a BUG, with no solution or several. The puzzle has exactly one, so the 9 must stay: row 1, column 2 is the 9, and its 1 and its 8 go. That’s BUG type 1.',
                focus: WHOLE_GRID,
                highlight: [at(1, 2)],
                marks: [[at(1, 2), 9]],
                eliminations: each([at(1, 2)], [1, 8]),
              },
            ],
          },
        ],
      },
      {
        title: 'BUG type 2',
        techniques: ['BUG type 2'],
        text: 'A few cells have a third candidate, and it is the same digit in each. Without it the grid would be a BUG, so one of those cells holds the digit, and it goes from every cell that is a peer of all of them.',
        examples: [
          {
            position: 'bug-2',
            steps: [
              {
                caption: 'Every empty cell here has exactly two candidates, except two in row 4: column 4, with a 2, a 3 and an 8, and column 6, with a 1, a 3 and a 5.',
                focus: WHOLE_GRID,
                highlight: [at(4, 4), at(4, 6)],
                marks: [...each([at(4, 4)], [2, 3, 8]), ...each([at(4, 6)], [1, 3, 5])],
              },
              {
                caption: 'Both have a 3 too many: row 4 has four places for a 3, where every other candidate has two in each of its units. Without those two 3s, the grid would be a BUG, with no solution or several.',
                focus: row(4),
                highlight: [at(4, 3), at(4, 4), at(4, 6), at(4, 9)],
                marks: each([at(4, 3), at(4, 4), at(4, 6), at(4, 9)], [3]),
              },
              {
                caption: 'So one of the two is a 3. Whichever it is, a cell that is a peer of both can’t be: the 3s in row 4, columns 3 and 9, in row 5, column 6 and in row 6, column 4 go. That’s BUG type 2.',
                focus: [...row(4), ...CENTER_BOX],
                highlight: [at(4, 4), at(4, 6)],
                marks: each([at(4, 4), at(4, 6)], [3]),
                eliminations: each([at(4, 3), at(4, 9), at(5, 6), at(6, 4)], [3]),
              },
            ],
          },
        ],
      },
      {
        title: 'BUG type 3',
        techniques: ['BUG type 3'],
        text: 'A few cells of one unit have a third candidate, not always the same digit. Without them the grid would be a BUG, so one of those cells holds its extra digit. Together they act like one cell holding only the extras, which can form a naked subset with other cells of the unit.',
        examples: [
          {
            position: 'bug-3',
            steps: [
              {
                caption: 'Every empty cell here has exactly two candidates, except two in row 4: column 3, with a 1, a 3 and a 9, and column 6, with a 5, an 8 and a 9.',
                focus: WHOLE_GRID,
                highlight: [at(4, 3), at(4, 6)],
                marks: [...each([at(4, 3)], [1, 3, 9]), ...each([at(4, 6)], [5, 8, 9])],
              },
              {
                caption: 'Column 3 has three places for a 3, one too many, and column 6 three for a 9. Every other candidate has two places in each of its units. Without that 3 and that 9, the grid would be a BUG, with no solution or several.',
                focus: [...col(3), ...col(6)],
                highlight: [at(2, 3), at(4, 3), at(7, 3), at(4, 6), at(5, 6), at(6, 6)],
                marks: [...each([at(2, 3), at(4, 3), at(7, 3)], [3]), ...each([at(4, 6), at(5, 6), at(6, 6)], [9])],
              },
              {
                caption: 'So row 4, column 3 is the 3, or row 4, column 6 is the 9. Together, they act like one cell of row 4 that holds a 3 or a 9.',
                focus: row(4),
                highlight: [at(4, 3), at(4, 6)],
                marks: [[at(4, 3), 3], [at(4, 6), 9]],
              },
              {
                caption: 'Row 4, column 1 holds a 3 or a 4, and column 9 a 4 or a 9. With that one cell, that’s three places for three digits, the 3, the 4 and the 9: a naked triplet in row 4.',
                focus: row(4),
                highlight: [at(4, 1), at(4, 3), at(4, 6), at(4, 9)],
                marks: [[at(4, 3), 3], [at(4, 6), 9], ...each([at(4, 1)], [3, 4]), ...each([at(4, 9)], [4, 9])],
              },
              {
                caption: 'So no cell of row 4 outside the triplet can hold them: the 3 in column 2 goes. That’s BUG type 3.',
                focus: row(4),
                highlight: [at(4, 1), at(4, 3), at(4, 6), at(4, 9)],
                eliminations: [[at(4, 2), 3]],
              },
            ],
          },
        ],
      },
      {
        title: 'BUG type 4',
        techniques: ['BUG type 4'],
        text: 'Two cells that share a unit have a third candidate each. Without the extras the grid would be a BUG, so one of the two holds its extra digit. When a digit both cells share has no other place in the unit, the other cell holds it, so each cell is left with its extra digit and that shared one.',
        examples: [
          {
            position: 'bug-4',
            steps: [
              {
                caption: 'Every empty cell here has exactly two candidates, except two in column 1: row 7, with a 1, a 4 and a 5, and row 8, with a 1, a 5 and a 7.',
                focus: WHOLE_GRID,
                highlight: [at(7, 1), at(8, 1)],
                marks: [...each([at(7, 1)], [1, 4, 5]), ...each([at(8, 1)], [1, 5, 7])],
              },
              {
                caption: 'Row 7 has three places for a 5, one too many, and column 1 three for a 7. Every other candidate has two places in each of its units. Without the 5 in row 7, column 1 and the 7 in row 8, column 1, the grid would be a BUG, so one of them is true.',
                focus: [...row(7), ...col(1)],
                highlight: [at(7, 1), at(7, 5), at(7, 7), at(1, 1), at(5, 1), at(8, 1)],
                marks: [...each([at(7, 1), at(7, 5), at(7, 7)], [5]), ...each([at(1, 1), at(5, 1), at(8, 1)], [7])],
              },
              {
                caption: 'The bottom-left box’s 1 can only go in these two cells. So whichever of them holds its extra digit, the other is the 1.',
                focus: BOTTOM_LEFT_BOX,
                highlight: [at(7, 1), at(8, 1)],
                marks: [[at(7, 1), 5], [at(8, 1), 7], ...each([at(7, 1), at(8, 1)], [1])],
              },
              {
                caption: 'So row 7, column 1 is a 1 or a 5, and row 8, column 1 a 1 or a 7: the 4 in one and the 5 in the other go. That’s BUG type 4.',
                focus: BOTTOM_LEFT_BOX,
                highlight: [at(7, 1), at(8, 1)],
                marks: [[at(7, 1), 5], [at(8, 1), 7], ...each([at(7, 1), at(8, 1)], [1])],
                eliminations: [[at(7, 1), 4], [at(8, 1), 5]],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Exclusion',
    text: 'Exclusion tries the digits a few cells that share a unit could hold together. A combination is ruled out when it repeats a digit, or when it would leave a cell that is a peer of all of them with no candidate. A candidate that appears in no combination left goes.',
    sections: [
      {
        title: 'Aligned Pair Exclusion',
        techniques: ['Aligned Pair Exclusion'],
        text: 'Take two cells that share a unit and list the pairs of digits they could hold. Rule out a pair when another cell that is a peer of both holds only those two digits: it would be left empty. When every pair with a given candidate of one cell is ruled out, that candidate goes.',
        examples: [
          {
            position: 'aligned-pair-exclusion',
            steps: [
              {
                caption: 'Row 3, columns 2 and 3 share a row and a box, so they can’t hold the same digit. Suppose column 2 were a 2: column 3 would then be a 5, a 6 or a 7. Try each.',
                focus: [...row(3), ...TOP_LEFT_BOX],
                highlight: APE_CELLS,
                marks: [[at(3, 2), 2], ...each([at(3, 3)], [5, 6, 7])],
              },
              {
                caption: 'A 2 and a 5 can’t be: row 3, column 8 holds only a 2 or a 5, and it shares row 3 with both cells. It would be left with nothing.',
                focus: [...row(3), ...TOP_LEFT_BOX],
                highlight: [...APE_CELLS, at(3, 8)],
                marks: [[at(3, 2), 2], [at(3, 3), 5], ...each([at(3, 8)], [2, 5])],
              },
              {
                caption: 'A 2 and a 6 can’t be either: row 3, column 4 holds only a 2 or a 6.',
                focus: [...row(3), ...TOP_LEFT_BOX],
                highlight: [...APE_CELLS, at(3, 4)],
                marks: [[at(3, 2), 2], [at(3, 3), 6], ...each([at(3, 4)], [2, 6])],
              },
              {
                caption: 'Nor a 2 and a 7: row 2, column 2 holds only a 2 or a 7, and it shares the top-left box with both cells.',
                focus: [...row(3), ...TOP_LEFT_BOX],
                highlight: [...APE_CELLS, at(2, 2)],
                marks: [[at(3, 2), 2], [at(3, 3), 7], ...each([at(2, 2)], [2, 7])],
              },
              {
                caption: 'Every pair with a 2 in row 3, column 2 is ruled out, so its 2 goes. That’s an aligned pair exclusion.',
                focus: [...row(3), ...TOP_LEFT_BOX],
                highlight: APE_CELLS,
                eliminations: [[at(3, 2), 2]],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    family: 'Cycles',
    text: 'A cycle follows digits round a closed loop of cells, one link at a time: if this cell holds the digit, that one can’t, or if this one can’t, that one must. When the loop closes with every link working both ways, its cells take the digits in one of exactly two ways. Whatever holds in both goes for the rest of the grid.',
    sections: [
      {
        title: 'Bidirectional X-Cycle',
        techniques: ['Bidirectional X-Cycle'],
        text: 'An X-Cycle follows one digit. Its links alternate: two cells of a unit where the digit has only those two places, so one must hold it, then two cells of a unit that can’t both hold it. Round the loop, the digit takes every other cell, one way or the other. In each unit of a “can’t both” link, one of the two cells is the digit either way, so the rest of the unit can’t be.',
        examples: [
          {
            position: 'bidirectional-x-cycle',
            steps: [
              {
                caption: 'Follow the 3s round a loop. Suppose row 1, column 6 is a 3. Then row 3, column 4, in the same box, can’t be.',
                focus: [...X_CYCLE_CELLS, ...TOP_MIDDLE_BOX],
                highlight: X_CYCLE_CELLS.slice(0, 2),
                marks: [[at(1, 6), 3]],
              },
              {
                caption: 'Row 3’s 3 has only two places, columns 2 and 4, so it is in column 2.',
                focus: [...X_CYCLE_CELLS, ...row(3)],
                highlight: X_CYCLE_CELLS.slice(0, 3),
                marks: [[at(1, 6), 3], [at(3, 2), 3]],
              },
              {
                caption: 'Then row 2, column 1, in the same box as row 3, column 2, can’t be 3.',
                focus: [...X_CYCLE_CELLS, ...TOP_LEFT_BOX],
                highlight: X_CYCLE_CELLS.slice(0, 4),
                marks: [[at(1, 6), 3], [at(3, 2), 3]],
              },
              {
                caption: 'Column 1’s 3 has only two places, rows 2 and 6, so it is in row 6.',
                focus: [...X_CYCLE_CELLS, ...col(1)],
                highlight: X_CYCLE_CELLS.slice(0, 5),
                marks: [[at(1, 6), 3], [at(3, 2), 3], [at(6, 1), 3]],
              },
              {
                caption: 'Then row 6, column 6, in the same row, can’t be 3.',
                focus: [...X_CYCLE_CELLS, ...row(6)],
                highlight: X_CYCLE_CELLS,
                marks: [[at(1, 6), 3], [at(3, 2), 3], [at(6, 1), 3]],
              },
              {
                caption: 'Column 6’s 3 has only two places, rows 1 and 6, so it is in row 1: back where the loop started, and it holds.',
                focus: [...X_CYCLE_CELLS, ...col(6)],
                highlight: X_CYCLE_CELLS,
                marks: [[at(1, 6), 3], [at(3, 2), 3], [at(6, 1), 3]],
              },
              {
                caption: 'Suppose instead row 1, column 6 isn’t a 3: every link flips, and the other three cells take the 3s. Either way, the 3s take every other cell of the loop. That’s a bidirectional X-Cycle.',
                focus: X_CYCLE_CELLS,
                highlight: X_CYCLE_CELLS,
                marks: [[at(3, 4), 3], [at(2, 1), 3], [at(6, 6), 3]],
              },
              {
                caption: 'The top-middle box, the top-left box and row 6 each hold two cells of the loop that can’t both be 3, and one of them is the 3 either way. So the rest of those units can’t be 3: their other 3s go.',
                focus: [...X_CYCLE_CELLS, ...TOP_MIDDLE_BOX, ...TOP_LEFT_BOX, ...row(6)],
                highlight: X_CYCLE_CELLS,
                marks: each(X_CYCLE_CELLS, [3]),
                eliminations: each([at(1, 2), at(1, 4), at(2, 2), at(2, 4), at(2, 5), at(6, 2), at(6, 5), at(6, 9)], [3]),
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
    summary: p.summary,
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
