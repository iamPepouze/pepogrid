import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const LIB_IMPORTS = 'src/lib imports only src/lib and the bank data in src/data.'
const BROWSER_GLOBALS = ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'location', 'HTMLElement']

export default defineConfig(
  { ignores: ['dist/', 'dev-dist/', 'tools/'] },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  // <script setup lang="ts"> blocks need the TypeScript parser inside vue-eslint-parser.
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  // House formatting: no semicolons, single quotes, 2-space indent, trailing commas in multi-line lists.
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
  // src/lib is pure TypeScript, shared with the bank scripts and the tests.
  {
    files: ['src/lib/**/*.ts'],
    ignores: ['src/lib/**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ regex: '^(?!\\./|\\.\\./data/)', message: LIB_IMPORTS }] }],
      // no-restricted-imports skips dynamic import(), which bank.ts uses for the bank data.
      'no-restricted-syntax': ['error', { selector: 'ImportExpression[source.value=/^(?!\\.\\.\\/data\\/)/]', message: LIB_IMPORTS }],
      'no-restricted-globals': ['error', ...BROWSER_GLOBALS.map((name) => ({ name, message: 'src/lib stays free of browser APIs.' }))],
    },
  },
)
