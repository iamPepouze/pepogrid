---
status: accepted
---

# The key technique also shows the next step's technique, in its own tab

ADR 0007 kept the key technique to the puzzle's hardest technique, but a player stuck early gets no help from a technique they won't need for many steps. The view now has two tabs: **Next step** names the next technique, the easiest of Sudoku Explainer's techniques that makes progress from the player's digits and notes, and **Hardest** is the key technique as before. ADR 0007 rejected a hybrid because one button would behave two ways. Here each tab always does one thing, asks its own confirmation the first time in a game, and has its own record on the result (`nextStepsShown`, `keyTechniqueRevealed`), so seeing the next step never reveals the hardest technique.

The app now ships a step finder: the TypeScript rater's SE techniques, tried in SE's order from a candidate board built from the player's notes. It stops at XY-Wing, and says so when the next step needs more, which can happen only at Expert and Master. This doesn't conflict with ADR 0002: the app finds one step at a time but still never rates or generates a puzzle.

## Consequences

- The rater is in the app bundle, so a change to its SE techniques changes what Next step names as well as the bank's pre-filter.
- Next step names a technique, never a cell or a digit, and porting SE's techniques beyond XY-Wing would be a separate decision.
