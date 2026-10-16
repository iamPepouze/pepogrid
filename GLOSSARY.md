# PepoGrid

A mobile-first sudoku game whose puzzles are graded by two community-standard ratings and served so that consecutive games exercise different solving techniques.

## Board

**Grid**:
The 9×9 playing area of 81 cells.
_Avoid_: Board

**Cell**:
One of the 81 squares of the grid, holding a digit, notes, or nothing.
_Avoid_: Square, box

**Unit**:
A row, column or 3×3 box: nine cells that must hold each digit exactly once.
_Avoid_: House, region

**Peer**:
A cell sharing at least one unit with a given cell; every cell has 20 peers.

**Given**:
A digit printed in the puzzle at the start, which the player cannot change.
_Avoid_: Clue, hint

**Puzzle**:
The set of givens a game starts from; it always has exactly one solution.
_Avoid_: Board, grid, sudoku

**Solution**:
The single complete grid consistent with a puzzle's givens.
_Avoid_: Answer

**Candidate**:
A digit still logically possible in an empty cell; the ratings reason in candidates.
_Avoid_: Note, pencil mark

**Note**:
A small digit the player writes in a cell as a reminder; notes are the player's guess at the candidates, not the candidates themselves.
_Avoid_: Pencil mark, candidate

**Mistake**:
A placed digit that differs from the solution; it is shown as wrong and counted, but never ends the game.
_Avoid_: Error

## Play

**Game**:
One attempt at one puzzle, from start until it is solved or abandoned.

**Notes mode**:
The input mode in which entering a digit toggles a note instead of placing it.

**Fill notes**:
The one-off action that sets every empty cell's notes to the digits none of its peers holds, mistakes included, replacing the notes the player wrote.
_Avoid_: Auto notes, auto candidates

**Solved**:
The outcome of a game whose grid has been filled to match the solution.
_Avoid_: Completed, won, finished

**Abandoned**:
The outcome of a game replaced by a new one after the player had placed at least one digit, right or wrong; notes alone do not count.
_Avoid_: Quit, lost

**Result**:
The stored record of a solved or abandoned game: difficulty, ratings, time and mistakes.
_Avoid_: Score, history entry

**Statistics**:
Figures drawn from the stored results, per difficulty and overall; ratings, times and mistakes count solved games only.
_Avoid_: Stats page, history

**Solve rate**:
Solved results as a share of all results at a difficulty; games replaced before a digit was placed are not results, so they do not count.
_Avoid_: Win rate

**Streak**:
A run of consecutive solved results at one difficulty, broken by an abandoned one.
_Avoid_: Winning streak

**Matching-number highlight**:
An optional tint on every cell holding the digit of the selected cell.

**Complete digit**:
A digit that sits in all nine cells where the solution has it; a wrong extra copy elsewhere does not change this. Not to be confused with a solved game.
_Avoid_: Finished digit, used-up digit

**Complete unit**:
A unit whose nine cells all hold the digits the solution has there; a full unit containing a mistake is not complete. Its cells are locked like givens, and only undo can reopen them.
_Avoid_: Finished unit, solved unit

## Difficulty

**Difficulty**:
One of Easy, Medium, Hard, Expert or Master, chosen by the player and assigned to each puzzle by the difficulty rule.
_Avoid_: Tier, level

**SE rating**:
The puzzle's rating on the classic Sudoku Explainer 1.2.1 scale, set by the hardest technique a solve needs.
_Avoid_: SER, SE score

**HoDoKu level**:
HoDoKu's own grade for a puzzle: Easy, Medium, Hard, Unfair or Extreme. "Level" is reserved for this.
_Avoid_: Difficulty

**HoDoKu score**:
HoDoKu's sum of the weights of every step in its solve; a high score can raise the HoDoKu level.

**Hardest technique**:
The technique behind a puzzle's SE rating.
_Avoid_: Hardest step

**Difficulty rule**:
The SE rating picks a puzzle's difficulty, and its HoDoKu level must match that difficulty, or the puzzle is unusable.

## Variety

**Bank**:
The fixed collection of pre-rated puzzles for one difficulty.
_Avoid_: Pool, set, library

**Isomorph**:
A puzzle obtained from another by relabelling digits, reordering rows or columns within their bands, or transposing; it has the same ratings.
_Avoid_: Transform, variant

**Technique family**:
A group of related hardest techniques, used to vary what consecutive games of a difficulty hinge on.
_Avoid_: Category, technique group

**Rotation**:
Choosing each new game from the technique family played least recently at that difficulty. Easy does not rotate.

**Cycle**:
One pass of the rotation through every technique family that still has unplayed puzzles. Not to be confused with the Cycles technique family.

## Technique families

**Singles**:
Puzzles needing only hidden singles; the whole of Easy.

**Naked Single**:
Puzzles whose hardest step is a naked single, which the SE scale rates above direct techniques.

**Hidden subsets**:
Direct hidden pairs and triplets: a hidden subset that immediately yields a single.

**Intersections**:
Pointing and claiming, direct or not: a digit confined to where a box meets a line.

**Fish**:
X-Wing, Swordfish and Jellyfish.

**Subsets**:
Naked and hidden pairs, triplets and quads.

**Wings**:
XY-Wing, XYZ-Wing and similar bent-pivot patterns.

**Wings & subsets**:
Wings, Fish and Subsets merged into one family at Expert, where each alone is rare.

**Uniqueness**:
Unique Rectangles and Unique Loops, which rely on the puzzle having exactly one solution.

**BUG**:
Bivalue Universal Grave patterns, which also rely on uniqueness.

**Exclusion**:
Aligned Pair and Aligned Triplet Exclusion.

**Forcing chains**:
Chains that follow both outcomes of a choice to a contradiction or agreement, including Nishio.

**Cycles**:
Bidirectional cycles and Turbot Fish: closed loops of strong and weak links. Not to be confused with the rotation's Cycle.
