---
name: drive-app
description: "Drive PepoGrid in a real browser. Use to see a UI change working, or to check focus or an animation."
---

## Steps

1. **Start** the dev server as a background job, on the port in [drive.mjs](drive.mjs) (`PORT`):

   ```sh
   npm run dev -- --port 5199 --strictPort
   ```

   Poll until it answers: `timeout 30 bash -c 'until curl -sf http://localhost:5199/pepogrid/ >/dev/null; do sleep 1; done'`.

2. **Drive** it from a script in the scratchpad that imports `drive.mjs` by the repo root's absolute path as a `file:///` URL. On Windows, Node rejects a bare `C:/` import path. Its `openGame()` documents what it returns. Play through the UI (click a cell, then a pad button), using `save()` to know what to place:

   ```js
   import { openGame } from 'file:///<repo root>/.claude/skills/drive-app/drive.mjs'
   const out = process.argv[2] // the scratchpad
   const app = await openGame()
   const g = await app.save()
   const i = g.puzzle.findIndex((v) => v === 0)
   await app.cell(i).click()
   await app.pad(g.solution[i]).click()
   await app.page.screenshot({ path: `${out}/board.png`, clip: { x: 0, y: 80, width: 400, height: 390 } })
   console.log(app.errors)
   await app.close()
   ```

   `playwright-core` resolves through `drive.mjs`, so the script runs from anywhere. Without `touch: true`, the page sees a mouse at every width, so a phone-sized viewport alone still renders the desktop styles. For a layout change, open the game at each width it affects, once with `touch: true` and once without.

   The step is done when the script has printed `app.errors` (an empty list), and `app.clipped()` (an empty list) for a layout change, and saved a screenshot of every state the change touches.

3. **Look** at every screenshot with Read. Rendered is not the same as correct. `app.close()` prints each one it saved; the step is done when every printed path has been opened.

4. **Stop** the server by its port's PID. The background job's own PID is npm's wrapper, and killing it leaves Vite running:

   ```sh
   pid=$(netstat -ano | grep ':5199 .*LISTENING' | awk '{print $5}' | head -1); [ -n "$pid" ] && taskkill //PID $pid //T //F
   ```

   The background job then reports exit 1. That is the kill, not a failure.

## Animations

The owner's Windows has **Animation effects** off, so their browser reports `prefers-reduced-motion: reduce`, and the app skips motion on purpose. Check an animation twice: `openGame({ reducedMotion: 'no-preference' })` to see it play (screenshot a few frames ~150-300 ms apart), and `openGame({ reducedMotion: 'reduce' })` to see what the owner sees.

To assert one is running, list `document.getAnimations().map((a) => a.animationName)` in `page.evaluate`. Vue suffixes scoped keyframe names with a hash (`glow` runs as `glow-<hash>`), so match with `startsWith`.

## Focus

Read where focus is with `document.activeElement` in `page.evaluate`, after each step that should move it (open, cancel, confirm). The browser is Chromium, which focuses a button on click; Safari doesn't, so a Safari tap is checked in the component tests, which click without focusing first.
