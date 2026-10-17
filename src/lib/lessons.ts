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
    text: 'A wing is a pivot cell and two wings: peers of the pivot with two candidates each. Whatever the pivot holds, one of the wings ends up with the digit they share, so a cell that is a peer of both wings can’t hold it.',
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
