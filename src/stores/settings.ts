import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LANGUAGES, type LanguageSetting } from '../lib/language'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** User preferences. Persisted as `pepogrid.settings` (also read early by index.html). */
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<ThemeMode>('system')
    /** Tint cells sharing the selected cell's digit and emphasize matching notes. */
    const highlightMatching = ref(true)
    /** The app's language, or `system` to follow the device's preferred languages. */
    const language = ref<LanguageSetting>('system')

    return { theme, highlightMatching, language }
  },
  {
    persist: {
      afterHydrate: ({ store }) => {
        if (!THEME_MODES.includes(store.theme)) store.theme = 'system'
        if (typeof store.highlightMatching !== 'boolean') store.highlightMatching = true
        if (store.language !== 'system' && !LANGUAGES.includes(store.language)) store.language = 'system'
      },
    },
  },
)
