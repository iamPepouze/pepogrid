import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

/** Matches an import source src/lib may not use: anything but src/lib itself and the bank data. */
const LIB_FORBIDDEN_SOURCE = '^(?!\\./|\\.\\./data/)'
const LIB_IMPORTS_MESSAGE = 'src/lib imports only src/lib and the bank data in src/data.'
/** A digit's bitmask spelled out (`1 << d`): CODING_STANDARDS.md G2 has it go through `bit(d)`. Other shifts (positions, subsets) stay allowed. */
const DIGIT_SHIFT = {
  selector: "BinaryExpression[operator='<<'][left.value=1][right.name=/^(d|digit)$/]",
  message: "Use bit(d) from src/lib/grid.ts for a digit's bitmask.",
}
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
  { files: ['src/**/*.{ts,vue}'], rules: { 'no-restricted-syntax': ['error', DIGIT_SHIFT] } },
  // src/lib is pure TypeScript, shared with the bank scripts and the tests.
  // Its no-restricted-syntax replaces the one above, so it repeats DIGIT_SHIFT.
  {
    files: ['src/lib/**/*.ts'],
    ignores: ['src/lib/**/*.test.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ regex: LIB_FORBIDDEN_SOURCE, message: LIB_IMPORTS_MESSAGE }] }],
      // no-restricted-imports skips dynamic import(), which bank.ts uses for the bank data.
      // Selector regexes end at the first '/', so the pattern's slashes are escaped.
      'no-restricted-syntax': ['error', {
        selector: `ImportExpression[source.value=/${LIB_FORBIDDEN_SOURCE.replaceAll('/', '\\/')}/]`,
        message: LIB_IMPORTS_MESSAGE,
      }, DIGIT_SHIFT],
      'no-restricted-globals': ['error', ...BROWSER_GLOBALS.map((name) => ({ name, message: 'src/lib stays free of browser APIs.' }))],
    },
  },
)
