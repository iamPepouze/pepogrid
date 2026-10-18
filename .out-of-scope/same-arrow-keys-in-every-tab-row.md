# The same arrow keys in every tab row

PepoGrid's two tab rows answer the arrow keys differently on purpose, and we're keeping it that way.

- **Statistics**: `←` / `→` select the next difficulty at once (WAI-ARIA's *automatic activation*).
- **Key technique**: `←` / `→` only move focus between *Next step* and *Hardest*, and `Enter` or `Space` selects (WAI-ARIA's *manual activation*).

UX_STANDARDS.md U14 records both.

## Why this is out of scope

The first time in a game, choosing *Hardest* asks for confirmation, because seeing the puzzle's key technique is noted on the game's result. With automatic activation, an arrow press would open that dialog, so a player who only meant to move along the tab row would get a question they didn't ask for. Manual activation means the dialog shows only when the player actually picks *Hardest*.

Statistics has no such dialog. Each difficulty's figures show instantly and nothing is recorded, so selecting on the arrow keys saves a key press, and WAI-ARIA recommends that when a panel shows without delay.

Making both rows behave the same costs something either way:

- Manual activation in Statistics would add an `Enter` for every difficulty, with nothing gained.
- Automatic activation in the key technique would pop a dialog on an arrow press.
- Automatic activation everywhere except an unconfirmed *Hardest* would make one tab row behave two ways, which is worse for U4 than two rows that are each consistent.

Both are standard WAI-ARIA tab patterns, and each tab row follows its pattern fully. Reopen this only if the key technique loses its confirmation, or Statistics gains one.

## Prior requests

- #74: "Make the key technique's tabs and Statistics' tabs answer the arrow keys the same way"
