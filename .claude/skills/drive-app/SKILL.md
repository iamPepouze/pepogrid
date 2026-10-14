---
name: drive-app
description: "Launch PepoGrid's dev server and drive it in a real browser: tap cells and the pad, read the saved game, screenshot the board. Use to see a UI change working, or to check an animation."
---

## Steps

1. **Start** the dev server as a background job, on the port the helper expects:

   ```sh
   npm run dev -- --port 5199 --strictPort
   ```

   Then poll until it serves: `timeout 30 bash -c 'until curl -sf http://localhost:5199/pepogrid/ >/dev/null; do sleep 1; done'`.

2. **Drive** it with a short script in the scratchpad that imports [drive.mjs](drive.mjs) by its `file:///` URL (on Windows, Node rejects a bare `C:/` import path). `openGame()` returns `page`, `errors`, `save()`, `cell(i)`, `pad(d)` and `close()`. Play through the UI (click a cell, then a pad button), and read the solution from `save()` to know what to place:

   ```js
   import { openGame } from 'file:///C:/Users/adrie/Projects/pepogrid/.claude/skills/drive-app/drive.mjs'
   const app = await openGame()
   const g = await app.save()
   const i = g.puzzle.findIndex((v) => v === 0)
   await app.cell(i).click()
   await app.pad(g.solution[i]).click()
   await app.page.screenshot({ path: 'board.png', clip: { x: 0, y: 80, width: 400, height: 390 } })
   console.log(app.errors)
   await app.close()
   ```

   Run it with `node <script>`. `playwright-core` resolves from the repo's `node_modules` through `drive.mjs`, so the script can live anywhere. Screenshots go in the scratchpad.

3. **Look** at every screenshot with Read. Rendered is not the same as correct.

4. **Stop** the server by its port's PID. The background job's own PID is npm's wrapper, and killing it leaves Vite running:

   ```sh
   pid=$(netstat -ano | grep ':5199 .*LISTENING' | awk '{print $5}' | head -1); [ -n "$pid" ] && taskkill //PID $pid //T //F
   ```

   The background job then reports exit 1. That is the kill, not a failure.

## Animations

The owner's Windows has **Animation effects** off, so their browser reports `prefers-reduced-motion: reduce`, and the app skips motion on purpose. Check an animation twice: `openGame({ reducedMotion: 'no-preference' })` to see it play (screenshot a few frames ~150-300 ms apart), and `openGame({ reducedMotion: 'reduce' })` to see what the owner sees.

To assert one is running, list `document.getAnimations().map((a) => a.animationName)` in `page.evaluate`. Vue renames scoped keyframes (`glow` runs as `glow-c7ffcc10`), so match names with `startsWith`.
