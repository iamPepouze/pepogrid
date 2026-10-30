import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const hook = join(import.meta.dirname, 'block-scripted-writes.mjs')

/** What the hook decides for a Bash command: `'deny'`, or `'allow'` when it prints nothing. */
function run(command) {
  const { stdout } = spawnSync(process.execPath, [hook], { input: JSON.stringify({ tool_input: { command } }), encoding: 'utf8' })
  return stdout.trim() ? JSON.parse(stdout).hookSpecificOutput.permissionDecision : 'allow'
}

/** A script file in a temporary directory, returned as its path with forward slashes. */
function script(text) {
  const path = join(mkdtempSync(join(tmpdir(), 'hook-test-')), 'edit.mjs')
  writeFileSync(path, text)
  return path.replaceAll('\\', '/')
}

const scratchFile = join(tmpdir(), 'claude', 'scratchpad', 'notes.txt').replaceAll('\\', '/')

describe('the scripted-writes hook', () => {
  it('denies sed -i on a repo file', () => {
    expect(run('sed -i \'s/a/b/\' src/App.vue')).toBe('deny')
  })

  it('denies perl -i on a repo file', () => {
    expect(run('perl -pi -e \'s/a/b/\' src/App.vue')).toBe('deny')
  })

  it('denies node -e that calls a write function', () => {
    expect(run('node -e "require(\'fs\').writeFileSync(\'a.txt\', \'x\')"')).toBe('deny')
  })

  it('denies node --eval that calls a write function', () => {
    expect(run('node --eval "fs.rmSync(\'a.txt\')"')).toBe('deny')
  })

  it('denies a node script file whose text writes', () => {
    expect(run(`node ${script('import { writeFileSync } from \'node:fs\'\nwriteFileSync(\'a.txt\', \'x\')')}`)).toBe('deny')
  })

  it('denies a Python write', () => {
    expect(run('python -c "open(\'a.txt\', \'w\').write(\'x\')"')).toBe('deny')
  })

  it('allows sed -i on a scratchpad file', () => {
    expect(run(`sed -i 's/a/b/' ${scratchFile}`)).toBe('allow')
  })

  it('allows sed -i with the many-files marker', () => {
    expect(run('sed -i \'s/a/b/\' src/*.vue # many-files')).toBe('allow')
  })

  it('allows node -e that carries the many-files marker', () => {
    expect(run('node -e "// many-files\nfs.writeFileSync(\'a.txt\', \'x\')"')).toBe('allow')
  })

  it('allows a node script that carries the many-files marker', () => {
    expect(run(`node ${script('// many-files\nwriteFileSync(\'a.txt\', \'x\')')}`)).toBe('allow')
  })

  it('allows node -e that only prints', () => {
    expect(run('node -e "console.log(1 + 1)"')).toBe('allow')
  })

  it('allows a node script that only reads', () => {
    expect(run(`node ${script('import { readFileSync } from \'node:fs\'\nconsole.log(readFileSync(\'a.txt\', \'utf8\'))')}`)).toBe('allow')
  })

  it('allows sed without -i', () => {
    expect(run('sed -n \'s/a/b/p\' src/App.vue')).toBe('allow')
  })

  it('allows sed without -i piped into grep -i', () => {
    expect(run('sed -n \'s/a/b/p\' src/App.vue | grep -i foo')).toBe('allow')
  })

  it('allows a plain npm test', () => {
    expect(run('npm test')).toBe('allow')
  })
})
