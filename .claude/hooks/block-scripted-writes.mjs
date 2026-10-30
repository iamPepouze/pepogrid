// PreToolUse hook on Bash and PowerShell: refuses a command that writes files from a script, which
// should be Edit tool calls. On Windows, Python's default code page turns a `’` into byte 0x92 and its
// text mode can rewrite line endings, and multi-site replace scripts abort halfway on one stale string.
// Denied: Python with a file write in the command's text; `node -e` whose text calls a write function;
// `node <file>` whose file text does; `sed -i` / `perl -i` on a path outside the scratchpad.
// The literal text `many-files` (`// many-files`, `# many-files`) in node text or a sed/perl command
// allows it: the same mechanical change across many files. Python has no marker.
// It sees text only: paths computed at run time and shell redirects get through, so `npm run lint`'s
// UTF-8 check stays the backstop. PowerShell write cmdlets aren't blocked.
// Reads the hook's JSON on stdin; prints a deny decision, or nothing to let the command run.
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const { tool_input: input, cwd } = JSON.parse(readFileSync(0, 'utf8'))
const command = input?.command ?? ''

const MARKER = 'many-files'
const commandWord = (names) => `(^|[\\s;&|(])(${names})(\\.exe)?(?=\\s|$)`

// `python`, `python3` or `py` as a command word, not a `.py` file name.
const runsPython = new RegExp(commandWord('python3?|py'), 'm').test(command)
// Opening a file to write, or writing through a file object; printing to stdout or stderr isn't a write.
const pythonWrites = /open\([^)]*['"][wax]b?\+?['"]|\bwrite_(text|bytes)\(|(?<!std(out|err))\.write\(/.test(command)

const nodeWrites = (text) => /\b(writeFileSync|appendFileSync|writeFile|rmSync|renameSync)\b/.test(text) && !text.includes(MARKER)

/** Whether `node -e` text, or the script file a `node` command runs, writes a file. */
function nodeWrite() {
  if (!new RegExp(commandWord('node')).test(command)) return false
  if (/\s(-e|--eval)(?=[\s=]|$)/.test(command)) return nodeWrites(command)
  const file = /(^|[\s;&|(])node(\.exe)?\s+(?:-\S+\s+)*["']?([^\s"';&|]+\.[cm]?js)["']?/m.exec(command)?.[3]
  if (!file) return false
  try {
    return nodeWrites(readFileSync(resolve(cwd ?? process.cwd(), file), 'utf8'))
  } catch {
    return false
  }
}

/** Whether the command edits in place with sed or perl, on a path that isn't the scratchpad. */
function inPlaceEdit() {
  const inPlace = new RegExp(`${commandWord('sed|perl')}\\s+(?:[^\\s;&|]+\\s+)*?(-[a-zA-Z]*i\\S*|--in-place\\S*)(?=\\s|$)`, 'm')
  if (!inPlace.test(command) || command.includes(MARKER)) return false
  const text = command.replaceAll('\\', '/').toLowerCase()
  return !(text.includes('/scratchpad/') || text.includes(tmpdir().replaceAll('\\', '/').toLowerCase()))
}

if ((runsPython && pythonWrites) || nodeWrite() || inPlaceEdit()) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Scripted file writes are blocked in this repo (Python, node -e, a node script that writes, sed -i, perl -i). Edit a file with the Edit tool, one call per site, even for several edits to one file. For the same mechanical change across many files, put `many-files` in the script or command as a comment (`// many-files`, `# many-files`); Node readFileSync/writeFileSync with utf8 keep line endings.',
      },
    }),
  )
}
