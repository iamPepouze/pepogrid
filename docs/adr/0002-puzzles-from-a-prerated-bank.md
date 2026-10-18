# Every difficulty draws from a pre-rated bank, not live generation

_Since ADR 0008, the app also ships the TypeScript rater's SE techniques, to find the player's next technique. It still never rates or generates a puzzle at runtime._

Each difficulty serves puzzles from a bank of 1000, rated offline by the real tools (SukakuExplainer for SE, HoDoKu), and each game shows a random isomorph of an unplayed bank puzzle. Live generation with our TypeScript rater was built first, but Hard took about 5 s at the 95th percentile against a 200 ms budget, and Expert and Master can't be rated live at all. The TypeScript rater now only pre-filters candidates when building the bank.

## Consequences

- Changing a difficulty's rules means rebuilding its bank (`scripts/bank/build-bank.ts`), which needs Java and can take hours.
- The app works fully offline and never generates or rates puzzles at runtime.
