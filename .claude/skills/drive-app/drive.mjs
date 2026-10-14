// Opens PepoGrid in the system Edge (playwright-core, no browser download) on the
// dev server the drive-app skill starts, with a game loaded and ready to play.
import { chromium } from 'playwright-core'

export const URL = 'http://localhost:5199/pepogrid/'

/**
 * @param {{ reducedMotion?: 'reduce' | 'no-preference', viewport?: { width: number, height: number } }} options
 */
export async function openGame({ reducedMotion = 'no-preference', viewport = { width: 400, height: 800 } } = {}) {
  const browser = await chromium.launch({ channel: 'msedge' })
  const context = await browser.newContext({ viewport, reducedMotion })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(URL)
  await page.waitForSelector('.cell')
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('pepogrid.game') || '{}').solution?.length === 81)

  return {
    page,
    /** Console and page errors seen so far. */
    errors,
    /** The saved game (`pepogrid.game`): puzzle, solution, values, notes, mistakes… as 81-cell arrays. */
    save: () => page.evaluate(() => JSON.parse(localStorage.getItem('pepogrid.game'))),
    /** Board cell `i`, row-major from 0. */
    cell: (i) => page.locator('.cell').nth(i),
    /** Number pad button for digit `d` (1-9). */
    pad: (d) => page.locator('.pad .digit').nth(d - 1),
    close: () => browser.close(),
  }
}
