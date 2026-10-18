// Opens PepoGrid in the system Edge (playwright-core, no browser download) on the
// dev server the drive-app skill starts, with a game loaded and ready to play. For service worker
// checks, `preview()`, `deploy()` and `resume()` serve a build and stand in for a deploy.
import { spawn } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

/** The repo root; `globalThis.URL`, since this module's own `URL` is the app's address. */
const root = fileURLToPath(new globalThis.URL('../../../', import.meta.url))

/** The dev server port the skill starts Vite on: `npm run dev -- --port 5199 --strictPort`. */
export const PORT = 5199
export const URL = `http://localhost:${PORT}/pepogrid/`

let resultCount = 0

/**
 * A stored result (`GameResult` in src/stores/results.ts) with plausible defaults that `fields`
 * override, for seeding `pepogrid.results`. Each call gets a fresh id and ends a minute after the last.
 * @param {Record<string, unknown>} fields
 */
export function result(fields = {}) {
  const n = resultCount++
  const grid = '0'.repeat(81)
  const outcome = fields.outcome ?? 'completed'
  return {
    id: `seed-${n}`, difficulty: 'easy', outcome,
    startedAt: new Date(Date.UTC(2026, 9, 1, 9, n)).toISOString(), endedAt: new Date(Date.UTC(2026, 9, 1, 10, n)).toISOString(),
    elapsed: 600, mistakes: 0, progress: outcome === 'completed' ? 100 : 40, puzzle: grid, solution: grid, finalBoard: grid,
    se: 1.2, hodokuScore: 100, hodokuLevel: 'easy', hardest: 'Hidden Single', ...fields,
  }
}

/** The saved game (`pepogrid.game`, see src/stores/game.ts), or null before one exists. */
const readSave = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pepogrid.game') ?? 'null'))

/**
 * `touch` emulates a phone (no hover, coarse pointer), which gets the touch layout; without it the
 * page sees a mouse at any viewport size. `colorScheme` is the device theme the default *System*
 * setting follows. `storage` seeds localStorage, keyed as the stores persist
 * (`pepogrid.results`: `{ results: [...] }` built with `result()`, `pepogrid.settings`: `{ theme, ... }`), and the game
 * opens on it; objects are stored as JSON.
 * @param {{ reducedMotion?: 'reduce' | 'no-preference', viewport?: { width: number, height: number }, touch?: boolean, colorScheme?: 'light' | 'dark', storage?: Record<string, unknown> }} options
 */
export async function openGame({ reducedMotion = 'no-preference', viewport = { width: 400, height: 800 }, touch = false, colorScheme = 'light', storage = {} } = {}) {
  const browser = await chromium.launch({ channel: 'msedge' })
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme, hasTouch: touch, isMobile: touch })
  const page = await context.newPage()
  const errors = []
  // Every screenshot path, listed by close() so the skill's Look step can be checked off.
  const shots = []
  const screenshot = page.screenshot.bind(page)
  page.screenshot = (options) => {
    if (options?.path) shots.push(options.path)
    return screenshot(options)
  }
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const ready = async () => {
    await page.waitForSelector('.cell')
    while ((await readSave(page))?.solution?.length !== 81) await page.waitForTimeout(50)
  }
  await page.goto(URL)
  await ready()
  const entries = Object.entries(storage)
  if (entries.length) {
    // Seeded after a first load and read on a reload: on a fresh profile, main.ts's schema check drops saved results.
    await page.evaluate((list) => {
      for (const [key, value] of list) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }, entries)
    await page.reload()
    await ready()
  }

  return {
    page,
    /** Console and page errors seen so far. */
    errors,
    /** The saved game: puzzle, solution, values, notes, mistakes… as 81-cell arrays. */
    save: () => readSave(page),
    /** Board cell `i`, row-major from 0. */
    cell: (i) => page.locator('.cell').nth(i),
    /** Number pad button for digit `d` (1-9). */
    pad: (d) => page.locator('.pad .digit').nth(d - 1),
    /** The focused element, as `button "Back"`, `button[role=tab] "Hardest"` or `body` (focus lost), to log after each step that should move focus. */
    focused: () =>
      page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return 'body'
        const role = el.getAttribute('role')
        return `${el.tagName.toLowerCase()}${role ? `[role=${role}]` : ''} "${el.textContent?.trim() ?? ''}"`
      }),
    /** Text of every button cut off: content wider than the button, or the button past the viewport's edge. */
    clipped: () =>
      page.evaluate(() =>
        [...document.querySelectorAll('button')]
          .filter((b) => {
            const { left, right } = b.getBoundingClientRect()
            return b.scrollWidth > b.clientWidth || left < 0 || right > innerWidth
          })
          .map((b) => b.textContent.trim()),
      ),
    /** Closes the browser and prints every screenshot this page saved. */
    close: async () => {
      if (shots.length) console.log(`Screenshots to look at:\n${shots.map((p) => `  ${p}`).join('\n')}`)
      await browser.close()
    },
  }
}

/**
 * Serves the last `npm run build` with `vite preview` on PORT, where the service worker runs
 * (the dev server never registers it). Resolves once the page answers; `stop()` ends the server.
 */
export async function preview() {
  const server = spawn(process.execPath, [`${root}node_modules/vite/bin/vite.js`, 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    if (await fetch(URL).then((r) => r.ok, () => false)) return { stop: () => server.kill() }
    await new Promise((r) => setTimeout(r, 500))
  }
  server.kill()
  throw new Error(`vite preview didn't answer on ${URL}`)
}

/**
 * Stands in for a deploy: stops `server`, changes dist/sw.js so the browser finds a new worker,
 * and serves again. The server restarts because preview caches file sizes at startup.
 */
export async function deploy(server) {
  server.stop()
  appendFileSync(`${root}dist/sw.js`, `\n// deploy ${Date.now()}\n`)
  return preview()
}

/** The app going to the background and back, as an iOS resume does without reloading the page. */
export function resume(page) {
  return page.evaluate(() => {
    for (const state of ['hidden', 'visible']) {
      Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }
  })
}
