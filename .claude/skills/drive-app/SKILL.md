---
name: drive-app
model: sonnet
description: "Drive PepoGrid in a real browser. Use to see a UI change working, or to check focus, an animation or an update."
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

   `playwright-core` resolves through `drive.mjs`, so the script runs from anywhere. Without `touch: true`, the page sees a mouse at every width, so a phone-sized viewport alone still renders the desktop styles. For a layout change, open the game three times: at 320 and 400 px wide with `touch: true` (the narrowest phone and a typical one), and at 1200 × 800 without. Then open 320 and 400 again with `textScale: 2`, UX_STANDARDS.md U19's 200% text. Seed the widest content the view can hold: the longest one-word name, two-digit counts, every optional note shown. A colour change also runs once with `colorScheme: 'dark'`. A rule for the installed iOS app never applies in Chromium: [ios-installed-app.md](../../../docs/ios-installed-app.md) says what can still be checked here. A view that shows saved data takes it through `storage`, so the first load already has it; build stored results with `drive.mjs`'s `result(fields)`. A state a fresh puzzle rarely shows (a given next technique, "beyond XY-Wing", a lesson with collapsed sections) comes from `app.position(name)`, which loads a lesson position as the game in progress.

   The step is done when the script has printed `app.errors` (an empty list), and `app.clipped()` (an empty list, or only entries an open issue already tracks, named with it in the `drive-app:` line) for a layout change at all five opens (320, 400 and 1200, then 320 and 400 at `textScale: 2`), and saved a screenshot of every state the change touches. A re-run after a follow-up fix screenshots only the states that fix touches, clipped to the element.

3. **Look** at every screenshot with Read. Rendered is not the same as correct. Screenshots of one state can be tiled first with `drive.mjs`'s `sheet(paths, out, columns)`, so one Read shows them all; opening the sheet counts as opening each of them. Tiles keep their aspect ratio at one column width, so tile screenshots of the same viewport width (400px in light and dark, say), or they come out at different zoom levels. `app.close()` prints each one it saved; the step is done when every printed path has been opened and the branch file's spec has a `drive-app: <states checked>, <date>` line, so the reviewer, who sees only the diff, knows the check ran.

4. **Stop** the server by its port's PID. The background job's own PID is npm's wrapper, and killing it leaves Vite running:

   ```sh
   pid=$(netstat -ano | grep ':5199 .*LISTENING' | awk '{print $5}' | head -1); [ -n "$pid" ] && taskkill //PID $pid //T //F
   ```

   The background job then reports exit 1. That is the kill, not a failure.

## Animations

The owner's Windows has **Animation effects** off, so their browser reports `prefers-reduced-motion: reduce`, and the app skips motion on purpose. Check an animation twice: `openGame({ reducedMotion: 'no-preference' })` to see it play (screenshot a few frames ~150-300 ms apart), and `openGame({ reducedMotion: 'reduce' })` to see what the owner sees.

To assert one is running, list `document.getAnimations().map((a) => a.animationName)` in `page.evaluate`. Vue suffixes scoped keyframe names with a hash (`glow` runs as `glow-<hash>`), so match with `startsWith`.

## Focus

Log `await app.focused()` after each step that should move focus (open, cancel, confirm). The browser is Chromium, which focuses a button on click; Safari doesn't, so a Safari tap is checked in the component tests, which click without focusing first.

## Updates

The dev server never registers the service worker, so an update check replaces steps 1 and 4 with `drive.mjs`'s `preview()`, after `npm run build`. Its `stop()` ends the server, with no `taskkill`.

1. `let server = await preview()`, then `openGame()`, and wait for `navigator.serviceWorker.ready` in `page.evaluate`.
2. Choose the visit. For a returning player, `page.reload()` first so a worker controls the page. A first visit skips it. Check both: the update reloads differently in each ([ios-installed-app.md](../../../docs/ios-installed-app.md), Updates).
3. `server = await deploy(server)` changes `dist/sw.js`. `resume(page)` then stands in for the app coming back from the background.
4. The Update button appears in the header. After the tap, `page.waitForEvent('load')`, and compare `save()` before and after: the game is kept.

`deploy()` leaves `dist/sw.js` changed. The next `npm run build` restores it.
