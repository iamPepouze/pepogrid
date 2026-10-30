# PepoGrid

A mobile-first sudoku game whose puzzles are graded by two community-standard ratings and served so that consecutive games exercise different solving techniques.

Each term players see gives the word French and German players get for it.

## Board

**Grid**:
The 9×9 playing area of 81 cells.
_Avoid_: Board
_French_: Grille · _German_: Gitter

**Cell**:
One of the 81 squares of the grid, holding a digit, notes, or nothing.
_Avoid_: Square, box
_French_: Case · _German_: Zelle

**Unit**:
A row, column or 3×3 box: nine cells that must hold each digit exactly once.
_Avoid_: House, region
_French_: Unité (ligne, colonne, bloc) · _German_: Einheit (Zeile, Spalte, Block)

**Peer**:
A cell sharing at least one unit with a given cell; every cell has 20 peers.
_French_: Voisine · _German_: Nachbarzelle

**Given**:
A digit printed in the puzzle at the start, which the player cannot change.
_Avoid_: Clue, hint
_French_: Chiffre donné · _German_: Vorgabe

**Puzzle**:
The set of givens a game starts from; it always has exactly one solution.
_Avoid_: Board, grid, sudoku
_French_: Grille, the same word as for the grid, as French players say · _German_: Rätsel

**Solution**:
The single complete grid consistent with a puzzle's givens.
_Avoid_: Answer
_French_: Solution · _German_: Lösung

**Candidate**:
A digit still logically possible in an empty cell; the ratings reason in candidates.
_Avoid_: Note, pencil mark
_French_: Candidat · _German_: Kandidat

**Note**:
A small digit the player writes in a cell as a reminder; notes are the player's guess at the candidates, not the candidates themselves.
_Avoid_: Pencil mark, candidate
_French_: Note · _German_: Notiz

**Mistake**:
A placed digit that differs from the solution; it is shown as wrong and counted, but never ends the game. A cell's notes that leave out its solution digit are a mistake too, but only the next technique says so: they are neither shown as wrong nor counted.
_Avoid_: Error
_French_: Erreur · _German_: Fehler

## Play

**Game**:
One attempt at one puzzle, from start until it is solved or abandoned.
_French_: Partie · _German_: Spiel

**Notes mode**:
The input mode in which entering a digit toggles a note instead of placing it.
_French_: Mode notes · _German_: Notizmodus

**Fill notes**:
The one-off action that sets every empty cell's notes to the digits none of its peers holds, mistakes included, replacing the notes the player wrote.
_Avoid_: Auto notes, auto candidates
_French_: Remplir les notes · _German_: Notizen füllen

**Solved**:
The outcome of a game whose grid has been filled to match the solution.
_Avoid_: Completed, won, finished
_French_: Résolue · _German_: Gelöst

**Abandoned**:
The outcome of a game replaced by a new one while at least one digit the player placed, right or wrong, is on the board; notes alone do not count, and neither do digits all erased or undone before replacing.
_Avoid_: Quit, lost
_French_: Abandonnée · _German_: Abgebrochen

**Result**:
The stored record of a solved or abandoned game: difficulty, ratings, time and mistakes.
_Avoid_: Score, history entry
_French_: Résultat · _German_: Ergebnis

**Statistics**:
Figures drawn from the stored results, per difficulty and overall; ratings, times and mistakes count solved games only.
_Avoid_: Stats page, history
_French_: Statistiques · _German_: Statistik

**Solve rate**:
Solved results as a share of all results at a difficulty; games replaced before a digit was placed are not results, so they do not count.
_Avoid_: Win rate
_French_: Taux de réussite · _German_: Lösungsquote

**Streak**:
A run of consecutive solved results at one difficulty, broken by an abandoned one.
_Avoid_: Winning streak
_French_: Série · _German_: Serie

**Flawless**:
A solved result with no mistakes.
_Avoid_: Perfect game, clean solve
_French_: Sans faute · _German_: Fehlerfrei

**Key technique**:
The in-game view with two tabs: Next step names the next technique, and Hardest reveals the puzzle's hardest technique. Each teaches its technique's family through step-by-step examples, and the result records how often the next step was shown and whether the hardest technique was revealed. It never points at a cell.
_Avoid_: Hint, tip, help
_French_: Technique clé, with tabs Prochaine étape and La plus dure · _German_: Schlüsseltechnik, with tabs Nächster Schritt and Schwierigste

**Next technique**:
The easiest technique that makes progress from the player's current digits and notes, tried in Sudoku Explainer's order up to XY-Wing. A grid with a wrong digit, or notes missing a cell's solution digit, has a mistake instead.
_Avoid_: Hint
_French_: Prochaine technique · _German_: Nächste Technik

**Lesson**:
The key technique's explanation of one technique family, with a section per technique and examples stepped through on real positions.
_Avoid_: Guide, tutorial
_French_: Leçon · _German_: Lektion

**Matching-number highlight**:
An optional tint on every cell holding the digit of the selected cell.
_French_: Surligner les chiffres identiques · _German_: Gleiche Ziffern hervorheben

**Complete digit**:
A digit that sits in all nine cells where the solution has it; a wrong extra copy elsewhere does not change this. Not to be confused with a solved game.
_Avoid_: Finished digit, used-up digit
_French_: Chiffre complet · _German_: Vollständige Ziffer

**Complete unit**:
A unit whose nine cells all hold the digits the solution has there; a full unit containing a mistake is not complete. Its cells are locked like givens, and only undo can reopen them.
_Avoid_: Finished unit, solved unit
_French_: Unité complète · _German_: Vollständige Einheit

## Difficulty

**Difficulty**:
One of Easy, Medium, Hard, Expert or Master, chosen by the player and assigned to each puzzle by the difficulty rule.
_Avoid_: Tier, level
_French_: Difficulté: Facile, Moyen, Difficile, Expert, Maître · _German_: Schwierigkeit: Leicht, Mittel, Schwer, Experte, Meister

**SE rating**:
The puzzle's rating on the classic Sudoku Explainer 1.2.1 scale, set by the hardest technique a solve needs.
_Avoid_: SER, SE score
_French_: Note SE · _German_: SE-Wertung. Statistics heads the SE and HoDoKu figures together *Évaluations* / *Wertungen*, since *Notes* is the pencil marks.

**HoDoKu level**:
HoDoKu's own grade for a puzzle: Easy, Medium, Hard, Unfair or Extreme. "Level" is reserved for this.
_Avoid_: Difficulty
_French_ and _German_: kept as HoDoKu's own English grades

**HoDoKu score**:
HoDoKu's sum of the weights of every step in its solve; a high score can raise the HoDoKu level.
_French_: Score HoDoKu · _German_: HoDoKu-Punkte

**Hardest technique**:
The technique behind a puzzle's SE rating.
_Avoid_: Hardest step
_French_: Technique la plus dure · _German_: Schwierigste Technik. Technique names follow what each language's players say: Hidden/Naked Single *Singleton caché* / *Singleton nu*, *Versteckter Single* / *Nackter Single*; Hidden/Naked Pair, Triplet, Quad *Paire cachée*, *Triplet nu*, *Quadruplet nu*…, *Verstecktes Paar*, *Nacktes Tripel*, *Nacktes Quadrupel*…, with "Direct" as *directe* / *Direktes*. Patterns players call by their English name (X-Wing, Swordfish, XY-Wing, Unique Rectangle, BUG, chains, cycles) stay English.

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
_French_: Famille de techniques · _German_: Technikfamilie

**Rotation**:
Choosing each new game from the technique family played least recently at that difficulty. Easy does not rotate.

**Cycle**:
One pass of the rotation through every technique family that still has unplayed puzzles. Not to be confused with the Cycles technique family.

## Technique families

French: Singletons, Singleton nu, Sous-ensembles cachés, Intersections, Poissons, Sous-ensembles, Wings, Wings et sous-ensembles, Unicité, BUG, Exclusion, Chaînes forcées, Cycles.
German: Singles, Nackter Single, Versteckte Teilmengen, Schnittmengen, Fische, Teilmengen, Wings, Wings & Teilmengen, Eindeutigkeit, BUG, Ausschluss, Forcing Chains, Zyklen.

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
