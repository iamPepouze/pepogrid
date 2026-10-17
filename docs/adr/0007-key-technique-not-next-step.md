# The key technique names the puzzle's hardest technique, not the next step

When stuck, the player can reveal the puzzle's key technique: its hardest technique, already stored with every bank puzzle, explained through its technique family. It does not look at the player's grid to find the next move. A next-step finder would need a runtime solver covering every technique up to forcing chains and Nishio. Our TypeScript rater stops at XY-Wing, and ADR 0002 keeps solving and rating out of the app. A hybrid (next step up to Hard, hardest technique above) was rejected because it would give one button two behaviours. The feature is not called "hint", so players don't expect a next move.

## Consequences

- A player stuck on an easier step than the hardest one gets no direct help from it.
- Switching to next-step help later means building a runtime step solver.
