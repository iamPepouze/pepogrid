// Fails if a text file git tracks or would add isn't valid UTF-8, such as one a Windows script wrote
// in its default code page: ESLint, vue-tsc and Vitest all accept the stray byte. Binary files
// (images) and ignored files are skipped. Part of `npm run lint`, so it runs before a commit as well as in CI.
// Usage: node scripts/check-utf8.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const decoder = new TextDecoder('utf-8', { fatal: true })

// `-I` skips binary files; `--untracked` adds new files not yet staged.
const files = execFileSync('git', ['grep', '-Iz', '--untracked', '--name-only', '-e', ''], { encoding: 'utf8' }).split('\0').filter(Boolean)

const bad = files.filter((file) => {
  try {
    decoder.decode(readFileSync(file))
    return false
  } catch {
    return true
  }
})
for (const file of bad) console.error(`Not valid UTF-8: ${file}`)
process.exitCode = bad.length ? 1 : 0
