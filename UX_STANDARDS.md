# UX standards

What a player gets from PepoGrid. Each rule names its source and gives an example from the app. `/code-review` checks changes against these rules, the `ux` skill critiques ideas and screens against them, and a spec's **UX decisions** section cites them.

The rules come from four places:

- **Usability**: Nielsen's [10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) (N1–N10).
- **Accessibility**: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA, cited by success criterion (e.g. 1.4.3).
- **Mobile**: Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) and Google's [Material Design](https://m3.material.io/).
- **Sudoku conventions**: what players expect after using other Sudoku apps (Jakob's law: users spend most of their time in other apps, so they expect yours to work the same way).

A breach of an **Accessibility** rule is a hard violation. Every other rule is a judgement call. A rule says what the player gets. Where a [CODING_STANDARDS.md](CODING_STANDARDS.md) rule already says how the code does it, the U-rule links to it instead of repeating it.

A change that sets or changes a UX convention updates this file in the same change. A review flags a new convention that the diff introduces without an entry here.

## Checking

- **Contrast** is checked by `npm run contrast` ([contrast.mjs](scripts/contrast.mjs)), in CI: it checks both themes' tokens in [style.css](src/style.css) for the pairs of colours its `PAIRS` lists, and a digit on the completion glow's wash at its peak. A change that draws a token on a new background adds the pair there, and one that draws over a translucent colour (a wash) checks the blend; a known failure is allowed there with its issue. A pair it lists as `stuck` can't be fixed by a new colour for either token, because each one's other pairs pull the opposite way, so its fix is a design call: split the token, or show the state by more than colour (a ring, a mark). Large text is at least 24px, or at least 18.66px when bold (600 or more). Board digits scale with the board, so they count as normal text: at 320px wide they are smallest.
- **Layout** is checked at the drive-app skill's three sizes: 320 and 400px wide with touch, and 1200×800 without. Dark mode is checked too when colours change.
- **Installed iOS app** behaviour is in [ios-installed-app.md](docs/ios-installed-app.md). Whatever only an iPhone or iPad shows becomes a `device-check:` line (CODING_STANDARDS.md T4).

## Usability (judgement calls)

- **U1 Visible status** (N1). Every action shows its result at once, and every state a control or view can be in is designed and visible: loading, disabled, active, empty, error, done. *Fill notes* greys out when it would change nothing, and the status bar counts mistakes as they happen.
- **U2 The player's words** (N2). Labels use the words Sudoku players use and the terms in [GLOSSARY.md](GLOSSARY.md), never internal names. *Notes*, *Key technique*, and technique names as the players of each language know them: translated where the language has a settled name (French *Singleton caché*), in English where its players use English (X-Wing). GLOSSARY.md gives each term's French and German word.
- **U3 A way back** (N3). Every change to the board can be undone, every view that stands in for the game has *Back*, and every dialog closes with Cancel, `Esc` or a tap outside. One Undo after *Fill notes* brings back the notes the player had.
- **U4 Consistency** (N4). The same thing looks and behaves the same everywhere. Statistics and the key technique share one look for their tab rows, cards and *Back* button, in the same places (CODING_STANDARDS.md C6).
- **U5 Error prevention** (N5). Before an action destroys something Undo can't bring back, the app asks first. A control that would do nothing is disabled. *New game* asks when the game in progress has a digit or a note, and a complete digit's pad button greys out.
- **U6 Recognition over recall** (N6). The screen shows the state, so the player doesn't have to remember it. The *Notes* button shows ON or OFF, and keyboard hints show on devices with a mouse.
- **U7 Shortcuts beside the visible way** (N7). Frequent actions get a keyboard shortcut or a touch gesture, and each one also has a visible control. `N` and the *Notes* button; long-press, `Shift` + digit and notes mode all add a note.
- **U8 Only what's needed now** (N8). Each screen shows what the player needs at that moment, and secondary detail waits behind a tap. A lesson's other sections start collapsed, and the tagline shows only on desktop-sized screens.
- **U9 Errors say what to do** (N9). A message says what happened and what the player can do next, in plain words. "Your next step needs a technique beyond XY-Wing" rather than an empty panel.
- **U10 Help where it's needed** (N10). Help sits next to the task it helps with. The key technique's lesson opens from the game and steps through a real example.

## Accessibility (hard violations)

- **U11 Text contrast** (1.4.3). Text has a contrast of at least 4.5:1 against its background, or 3:1 for large text, in both themes and on every background it can sit on. Disabled controls are exempt. A player's digit (`--user-digit`) on an empty cell is 5.75:1 in light. Accent-coloured text on a plain surface uses `--accent-text`, not `--accent`, which is a fill behind `--on-accent` text.
- **U12 Non-text contrast** (1.4.11). What a player needs to see to find a control or read its state has 3:1 against what's next to it: a selected tab, a pressed button, a focus ring, an icon that carries meaning. A button with a text label doesn't need a visible border. The selected tab is filled with `--accent`.
- **U13 Not by colour alone** (1.4.1). Information shown by colour is also shown another way: text, weight, shape or position. The *Notes* button's ON/OFF badge says what its fill colour shows.
- **U14 Keyboard** (2.1.1, 2.1.2, 2.4.3). Everything works from a keyboard, focus moves in reading order, and focus never gets stuck. Arrow keys move the selection on the board and between tabs. Statistics' tabs select on the arrow keys. The key technique's tabs only move focus, and open with `Enter` or `Space`, since *Hardest* may ask first. The Language radios in Settings only move focus on the arrow keys and pick with `Enter` or `Space`, since a pick reloads the app, and the picked radio leaves the Tab order while focus is on another, so one `Tab` leaves the group (Theme's radios pick on the arrow keys).
- **U15 Focus visible** (2.4.7, 2.4.11). The focused element shows a visible ring and is never hidden behind other content. After a dialog or view closes, focus goes back to what the player used (CODING_STANDARDS.md C8). Buttons get a 2px `--accent` outline.
- **U16 Names, roles and states** (4.1.2, 1.3.1, 2.5.3). Every control has an accessible name that contains its visible label, and exposes its role and state (`aria-pressed`, `aria-selected`, disabled). Icon-only buttons get an `aria-label`. A cell reads "Row 3, column 4: 7, incorrect".
- **U17 Status messages** (4.1.3). A change the player didn't move focus to, but needs to know about, is announced (`role="status"` or `aria-live`). The *Solved!* banner and a lesson's step caption.
- **U18 Target size** (2.5.8). Every pointer target is at least 24×24 CSS px, or has 24px of space around it. U21 asks for more on the game's main controls.
- **U19 Reflow and zoom** (1.4.10, 1.4.4, 1.3.4). At 320 CSS px wide, nothing scrolls sideways and no text is cut off or spills into its neighbour (drive-app's `clipped()`). Text can be zoomed to 200% without losing content (drive-app's `textScale: 2`). The app works in both orientations.
- **U20 Motion can be turned off** (2.3.3, 2.2.2). When the device asks for reduced motion, decorative animation stops (CODING_STANDARDS.md C3). 2.3.3 is level AAA, but this repo requires it. Anything that moves for more than 5 seconds can be paused. The completion glow is skipped under reduced motion.
- **U31 Language of the page** (3.1.1). `<html lang>` is the language the app is shown in, set before first paint, so a screen reader pronounces French as French. Picking a language in Settings reloads the app in it.

## Mobile (judgement calls)

- **U21 Comfortable targets** (Apple HIG: 44×44pt; Material: 48×48dp). The controls used during play (number pad, game controls, board cells where the grid allows) are at least 44px in their smaller dimension on phones. The game controls (*Undo*, *Erase*, *Notes*…) are at least 52px tall and 53px wide at 320px.
- **U22 Within thumb reach**. On phones, the controls used during play sit at the bottom, under the board. Rarely used ones (settings, statistics, new game) can sit in the header.
- **U23 Clear of system UI** (Apple HIG: layout and safe areas). Content and controls stay clear of the notch, status bar, home indicator and the iOS top-edge blur ([ios-installed-app.md](docs/ios-installed-app.md)). The installed app's header clears the status bar and the blur.
- **U24 Feedback on touch**. A tap shows a pressed state at once, and nothing depends on hover. Haptics only add to visible feedback, since iOS has none (CODING_STANDARDS.md C4). A number pad button tints while pressed.

## Sudoku conventions (judgement calls)

- **U25 Selection highlights**. The selected cell, marked by a 2px ring in `--accent-text`, is the strongest highlight, then the cells holding the same digit, then its row, column and box. Each can be told apart from the others. `--selected`, `--same-digit` and `--peer`, with *Highlight matching numbers* to turn off the digit tint.
- **U26 Givens look fixed**. Givens look different from the player's digits, and can't be changed. Givens are dark and bold, and the player's digits are blue.
- **U27 Notes in fixed spots**. A cell's notes sit in a 3×3 layout where each digit always has the same spot, and placing a digit clears it from the notes in its row, column and box.
- **U28 A number pad in order**. The pad shows 1–9 in order, and a digit that is complete stops being offered. A complete digit's button greys out and stops responding.
- **U29 Mistakes shown at once**. A wrong digit and a clash show as soon as they're placed, and showing them never blocks play. Wrong digits turn red, clashing cells are tinted, and the counter goes up.
- **U30 The clock counts play**. The timer runs only while the player can play. It pauses while the tab is hidden, or while Statistics or the key technique is open.
