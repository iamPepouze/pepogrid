import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

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
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { regex: '^(vue|pinia)', message: 'src/lib stays free of Vue and Pinia.' },
          { regex: '^\\.\\./(stores|components|composables|App)', message: 'src/lib imports only src/lib and src/data.' },
        ],
      }],
      'no-restricted-globals': ['error', { name: 'window', message: 'src/lib stays free of the DOM.' }, { name: 'document', message: 'src/lib stays free of the DOM.' }],
    },
  },
)
