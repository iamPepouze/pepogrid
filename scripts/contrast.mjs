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
 * Failing pairs, `<foreground> on <background> at <minimum>`, with the issue that tracks each. The
 * minimum is part of the key, so a pair allowed as text is still held to 3:1 as a control.
 */
const ALLOWED = {
  '--user-digit on --same-digit at 4.5': '#64',
  '--user-digit on --conflict at 4.5': '#64',
  '--user-digit on --selected at 4.5': '#64',
  '--wrong-digit on --peer at 4.5': '#64',
  '--wrong-digit on --same-digit at 4.5': '#64',
  '--wrong-digit on --conflict at 4.5': '#64',
  '--wrong-digit on --selected at 4.5': '#64',
  '--note on --selected at 4.5': '#64',
  '--accent on --cell at 4.5': '#75',
  '--accent on --selected at 4.5': '#75',
  '--selected on --cell at 3': '#66',
  '--selected on --peer at 3': '#66',
}

/**
 * [foreground token, background token, minimum, what it is], kept as UX_STANDARDS.md's **Checking**
 * says. Disabled controls are exempt (WCAG 1.4.3), so they aren't listed.
 */
const PAIRS = [
  // Board and lesson digits. A digit is normal text at 320px wide, where cells are smallest.
  ...['--cell', '--peer', '--same-digit', '--conflict', '--selected'].flatMap((bg) => [
    ['--given-digit', bg, TEXT, 'a given'],
    ['--user-digit', bg, TEXT, "a player's digit"],
    ['--wrong-digit', bg, TEXT, 'a wrong digit'],
  ]),
  // Notes sit only in empty cells, which are never tinted as the same digit or as a clash.
  ...['--cell', '--peer', '--selected'].map((bg) => ['--note', bg, TEXT, 'a note']),
  ['--accent', '--cell', TEXT, "a lesson's marked candidate"],
  ['--accent', '--selected', TEXT, "a lesson's marked candidate"],
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
  // The switch's thumb is a literal #fff, the same white as --on-accent.
  ['--on-accent', '--switch-off', UI, "the settings switch's thumb on its off track"],
  ['--selected', '--cell', UI, 'the selected cell'],
  ['--selected', '--peer', UI, 'the selected cell among its peers'],
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
  for (const [fg, bg, min] of PAIRS) {
    if (fg !== token && bg !== token) continue
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
for (const [fg, bg, min, what] of PAIRS) {
  const issue = ALLOWED[`${fg} on ${bg} at ${min}`]
  const results = Object.entries(THEMES).map(([theme, t]) => {
    if (!t[fg] || !t[bg]) throw new Error(`${theme} theme has no ${t[fg] ? bg : fg}`)
    return { theme, t, value: ratio(t[fg], t[bg]) }
  })
  const failing = results.filter((r) => r.value < min)
  // Rounded down, so 4.498 never shows as a passing 4.50.
  const shown = results.map((r) => `${r.theme} ${(Math.floor(r.value * 100) / 100).toFixed(2)}`).join(', ')
  const line = `${fg} on ${bg} (${what}): ${shown}, needs ${min}:1`
  if (failing.length && issue) allowed.push(`${line}, allowed by ${issue}`)
  else if (failing.length) problems.push(line)
  else if (issue) problems.push(`${line}: passes now, so remove its ${issue} allowance`)
  const stuckIn = failing.filter((r) => !fits(fg, r.t) && !fits(bg, r.t)).map((r) => r.theme)
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
