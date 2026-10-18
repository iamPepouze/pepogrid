// PreToolUse hook on Bash and PowerShell: refuses a command that runs Python and writes a file. On
// Windows, Python's default code page turns a `’` into byte 0x92 and its text mode can rewrite line
// endings, and multi-site replace scripts abort halfway on one stale string.
// It sees only the command's own text: a write inside a script file (`python gen.py`) or through a
// shell redirect gets through, so `npm run lint`'s UTF-8 check stays the backstop.
// Reads the hook's JSON on stdin; prints a deny decision, or nothing to let the command run.
import { readFileSync } from 'node:fs'

const { tool_input: input } = JSON.parse(readFileSync(0, 'utf8'))
const command = input?.command ?? ''

// `python`, `python3` or `py` as a command word, not a `.py` file name.
const runsPython = /(^|[\s;&|(])(python3?|py)(\.exe)?(?=\s|$)/m.test(command)
// Opening a file to write, or writing through a file object; printing to stdout or stderr isn't a write.
const writes = /open\([^)]*['"][wax]b?\+?['"]|\bwrite_(text|bytes)\(|(?<!std(out|err))\.write\(/.test(command)

if (runsPython && writes) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Python writes are blocked in this repo. Edit a file with the Edit tool, one call per site, even for several edits to one file. For the same mechanical change across many files, use a Node script (readFileSync/writeFileSync with utf8 keep line endings).',
      },
    }),
  )
}
