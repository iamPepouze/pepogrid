import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist/', 'dev-dist/', 'tools/'] },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  // <script setup lang="ts"> blocks need the TypeScript parser inside vue-eslint-parser.
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
)
