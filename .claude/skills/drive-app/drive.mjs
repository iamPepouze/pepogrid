// Opens PepoGrid in the system Edge (playwright-core, no browser download) on the
// dev server the drive-app skill starts, with a game loaded and ready to play.
import { chromium } from 'playwright-core'

/** The dev server port the skill starts Vite on: `npm run dev -- --port 5199 --strictPort`. */
export const PORT = 5199
export const URL = `http://localhost:${PORT}/pepogrid/`

/** The saved game (`pepogrid.game`, see src/stores/game.ts), or null before one exists. */
const readSave = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pepogrid.game') ?? 'null'))

/**
 * `touch` emulates a phone (no hover, coarse pointer), which gets the touch layout; without it the
 * page sees a mouse at any viewport size. `colorScheme` is the device theme the default *System*
 * setting follows. `storage` seeds localStorage, keyed as the stores persist
 * (`pepogrid.results`: `{ results: [...] }`, `pepogrid.settings`: `{ theme, ... }`), and the game
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
