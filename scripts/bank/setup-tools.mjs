// Downloads the offline rating tools used to build the Expert/Master puzzle bank
// into tools/ (gitignored). Requires Java 17+ on PATH or in JAVA_HOME to run them.
//   node scripts/bank/setup-tools.mjs
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TOOLS_DIR = new URL('../../tools/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const TOOLS = [
  {
    // Sudoku Explainer fork that provides the SE rating ("serate").
    file: 'SukakuExplainer.jar',
    url: 'https://github.com/SudokuMonster/SukakuExplainer/releases/download/v1.18.1/SukakuExplainer.jar',
    sha256: '37831647bf1727be02c159f25aefd8602918185d79d4aee73472eff40cd6736c',
  },
  {
    file: 'hodoku.jar',
    url: 'https://sourceforge.net/projects/hodoku/files/hodoku/hodoku_2.2.0/hodoku.jar/download',
    sha256: '6e5f0c865b6915acf9fa688eb0e43588139ef40d7375b0965677be5fe42294bc',
  },
]

mkdirSync(TOOLS_DIR, { recursive: true })

for (const tool of TOOLS) {
  const path = join(TOOLS_DIR, tool.file)
  if (!existsSync(path)) {
    process.stdout.write(`Downloading ${tool.file}... `)
    const res = await fetch(tool.url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`${tool.url}: HTTP ${res.status}`)
    writeFileSync(path, Buffer.from(await res.arrayBuffer()))
    console.log('done')
  }
  const hash = createHash('sha256').update(readFileSync(path)).digest('hex')
  if (tool.sha256 && hash !== tool.sha256) throw new Error(`${tool.file}: unexpected SHA-256 ${hash}`)
  console.log(`${tool.file}  sha256 ${hash}`)
}
