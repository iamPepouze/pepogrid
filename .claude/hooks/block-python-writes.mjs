// PreToolUse hook on Bash: refuses a command that runs Python and writes a file. On Windows,
// Python's default code page turns a `’` into byte 0x92 and its text mode can rewrite line
// endings, and multi-site replace scripts abort halfway on one stale string.
// Reads the hook's JSON on stdin; prints a deny decision, or nothing to let the command run.
import { readFileSync } from 'node:fs'

const { tool_input: input } = JSON.parse(readFileSync(0, 'utf8'))
const command = input?.command ?? ''

const runsPython = /\bpy(thon3?)?\b/.test(command)
const writes = /open\([^)]*['"][wax]b?\+?['"]|\bwrite_(text|bytes)\(|\.write\(/.test(command)

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
