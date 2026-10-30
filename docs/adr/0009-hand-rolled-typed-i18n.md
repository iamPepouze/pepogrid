---
status: accepted
---

# Translations are a hand-written typed module, not vue-i18n

The app speaks English, French and German. Each language is one typed message object, lessons included, and TypeScript fails the build when French or German lacks a key that English has, so a missing translation never reaches a player. vue-i18n would add 15–20 kB gzipped, and it only reports a missing key at runtime unless its types are written by hand. With three languages and a short UI, its ICU message syntax isn't worth that: plurals go through `Intl.PluralRules`, and numbers and dates through `Intl` with the app's language.

## Consequences

- Lessons are written once as structured objects in `lessons.ts`, with their cells, marks and eliminations; each language adds only the words (text, section text, captions) in the same order, so a translation can't change which cells a step points at. A family a language lacks shows in English under a note. Moving to a message-catalogue library later would mean rewriting every caption.
- Changing language reloads the app instead of swapping words live. Nothing is lost, since the game, its timer and its undo history are persisted, but an open view closes.
