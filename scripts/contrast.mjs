// Checks the theme tokens in src/style.css against WCAG 2.2 contrast (UX_STANDARDS.md U11, U12),
// in both themes, for the pairs of colours the app draws on each other that PAIRS lists.
// A pair that already fails is allowed with the issue that tracks it, so CI stays green until the
// fix lands; an allowed pair that passes fails the check, so its entry gets removed. A failing pair
// that no new colour for either token can fix is also listed as stuck; listing it adds no failure of its own.
// Usage: node scripts/contrast.mjs
import { readFileSync } from 'node:fs'

/** WCAG minimums: normal text, and a control's or state's look (U12). */
const TEXT = 4.5
const UI = 3

/**
 * The completion glow's wash (`.cell.glow::before` in SudokuBoard.vue) is `--accent` over the cell at
 * up to this opacity, the `glow` keyframes' peak. A pair marked `GLOW` is checked on that blend.
 */
const GLOW_OPACITY = 0.28
const GLOW = 'in the glow'

/**
 * Failing pairs, `<foreground> on <background> at <minimum>` (then ` in the glow` for a glow pair), with
 * the issue that tracks each. The minimum is part of the key, so a pair allowed as text is still held
 * to 3:1 as a control.
 */
const ALLOWED = {
  '--user-digit on --cell at 4.5 in the glow': '#95',
  '--user-digit on --peer at 4.5 in the glow': '#95',
  '--user-digit on --same-digit at 4.5 in the glow': '#95',
  '--user-digit on --conflict at 4.5 in the glow': '#95',
  '--user-digit on --selected at 4.5 in the glow': '#95',
}

/**
 * [foreground token, background token, minimum, what it is, GLOW when the background is under the
 * glow's wash], kept as UX_STANDARDS.md's **Checking** says. Disabled controls are exempt (WCAG
 * 1.4.3), so they aren't listed.
 */
const PAIRS = [
  // Board and lesson digits. A digit is normal text at 320px wide, where cells are smallest.
  ...['--cell', '--peer', '--same-digit', '--conflict', '--selected'].flatMap((bg) => [
    ['--given-digit', bg, TEXT, 'a given'],
    ['--user-digit', bg, TEXT, "a player's digit"],
    ['--wrong-digit', bg, TEXT, 'a wrong digit'],
  ]),
  // A digit swells in the glow and is drawn over its wash, so its background is the blend.
  ...['--cell', '--peer', '--same-digit', '--conflict', '--selected'].flatMap((bg) => [
    ['--given-digit', bg, TEXT, 'a given', GLOW],
    ['--user-digit', bg, TEXT, "a player's digit", GLOW],
  ]),
  // Notes sit only in empty cells, which are never tinted as the same digit or as a clash.
  ...['--cell', '--peer', '--selected'].map((bg) => ['--note', bg, TEXT, 'a note']),
  // A faded lesson cell draws in --muted. It is never highlighted (sudoku.test.ts), so --selected isn't its background.
  ['--muted', '--cell', TEXT, 'a faded lesson cell'],
  ['--accent-text', '--cell', TEXT, "a lesson's marked candidate"],
  ['--accent-text', '--selected', TEXT, "a lesson's marked candidate"],
  // Chrome text.
  ['--text', '--page', TEXT, 'body text'],
  ['--text', '--button-bg', TEXT, 'a button or card'],
  ['--muted', '--page', TEXT, 'muted text'],
  ['--muted', '--button-bg', TEXT, 'muted text in a card'],
  ['--muted', '--badge-bg', TEXT, 'the Notes badge'],
  ['--on-accent', '--accent', TEXT, 'a selected tab or primary button'],
  ['--accent', '--on-accent', TEXT, 'the active Notes badge'],
  ['--user-digit', '--button-bg', TEXT, 'a number pad digit'],
  ['--note', '--button-bg', TEXT, 'a number pad digit in notes mode'],
  ['--accent-text', '--page', TEXT, 'the Install and Update pills'],
  ['--accent-text', '--peer', TEXT, 'a hovered pill'],
  ['--text', '--peer', TEXT, 'a hovered button, the solved banner'],
  ['--muted', '--peer', TEXT, "the solved banner's ratings"],
  // States and controls (U12).
  ['--accent', '--page', UI, 'the focus ring, a selected tab'],
  ['--accent', '--button-bg', UI, 'a selected tab beside the others'],
  ['--switch-off', '--button-bg', UI, "the settings switch's track when off"],
  ['--switch-thumb', '--switch-off', UI, "the settings switch's thumb on its off track"],
  ['--switch-thumb', '--accent', UI, "the settings switch's thumb on its on track"],
  // The selected cell's ring, against what sits on either side of it: the cell's own fill and its neighbours'.
  ...['--selected', '--cell', '--peer', '--same-digit', '--conflict'].map((bg) => [
    '--accent-text',
    bg,
    UI,
    "the selected cell's ring",
  ]),
]

const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

/** The `--token: #hex` declarations in the first block opened by `selector`. */
function tokens(selector) {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`style.css has no "${selector} {" block`)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]))
}

const THEMES = { light: tokens(':root'), dark: tokens(":root[data-theme='dark']") }

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** `over` laid on `under` at `opacity`, as sRGB channels blend in CSS. */
function blend(over, under, opacity) {
  const channels = [1, 3, 5].map((i) => {
    const o = parseInt(over.slice(i, i + 2), 16)
    const u = parseInt(under.slice(i, i + 2), 16)
    return Math.round(o * opacity + u * (1 - opacity))
  })
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Whether some colour for `token` passes every pair it is in, in theme `t`, with the other tokens as
 * they are. Each pair allows a luminance at or below one bound or at or above another; the windows
 * that survive every pair are the luminances left to choose from.
 */
function fits(token, t) {
  let windows = [[0, 1]]
  for (const [fg, bg, min, , glow] of PAIRS) {
    // A glow pair's background is a blend of two tokens, so no one token's colour settles it.
    if (glow || (fg !== token && bg !== token)) continue
    const other = luminance(t[fg === token ? bg : fg]) + 0.05
    const passing = [
      [0, other / min - 0.05],
      [min * other - 0.05, 1],
    ]
    windows = windows.flatMap(([lo, hi]) => passing.map(([a, b]) => [Math.max(lo, a), Math.min(hi, b)]))
    windows = windows.filter(([lo, hi]) => lo <= hi)
  }
  return windows.length > 0
}

const problems = []
const allowed = []
// Failing pairs that neither of their tokens can fix: they need a design call, not a new value.
const stuck = []
for (const [fg, bg, min, what, glow] of PAIRS) {
  const where = glow ? ` ${glow}` : ''
  const issue = ALLOWED[`${fg} on ${bg} at ${min}${where}`]
  const results = Object.entries(THEMES).map(([theme, t]) => {
    for (const token of glow ? [fg, bg, '--accent'] : [fg, bg]) {
      if (!t[token]) throw new Error(`${theme} theme has no ${token}`)
    }
    return { theme, t, value: ratio(t[fg], glow ? blend(t['--accent'], t[bg], GLOW_OPACITY) : t[bg]) }
  })
  const failing = results.filter((r) => r.value < min)
  // Rounded down, so 4.498 never shows as a passing 4.50.
  const shown = results.map((r) => `${r.theme} ${(Math.floor(r.value * 100) / 100).toFixed(2)}`).join(', ')
  const line = `${fg} on ${bg}${where} (${what}): ${shown}, needs ${min}:1`
  if (failing.length && issue) allowed.push(`${line}, allowed by ${issue}`)
  else if (failing.length) problems.push(line)
  else if (issue) problems.push(`${line}: passes now, so remove its ${issue} allowance`)
  // A glow pair is never listed as stuck: fits() leaves it out, as its background is a blend of two tokens.
  const stuckIn = glow ? [] : failing.filter((r) => !fits(fg, r.t) && !fits(bg, r.t)).map((r) => r.theme)
  if (stuckIn.length) stuck.push(`${fg} on ${bg} (${what}) in ${stuckIn.join(' and ')}`)
}

for (const line of allowed) console.log(`known: ${line}`)
for (const line of stuck) {
  console.log(`stuck: ${line}: no colour for either token passes all its pairs, so split a token or show it by more than colour`)
}
for (const line of problems) console.error(`FAIL: ${line}`)
console.log(
  `${PAIRS.length} pairs checked in both themes: ${problems.length} failing, ${allowed.length} known, ${stuck.length} stuck.`,
)
process.exitCode = problems.length ? 1 : 0
