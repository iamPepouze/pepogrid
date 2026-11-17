import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LANGUAGES, type LanguageSetting } from '../lib/language'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** The persisted preferences, as a transfer code carries them. */
export interface Preferences {
  theme: ThemeMode
  highlightMatching: boolean
  language: LanguageSetting
}

/** User preferences. Persisted as `pepogrid.settings` (also read early by index.html). */
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<ThemeMode>('system')
    /** Tint cells sharing the selected cell's digit and emphasize matching notes. */
    const highlightMatching = ref(true)
    /** The app's language, or `system` to follow the device's preferred languages. */
    const language = ref<LanguageSetting>('system')

    /** The preferences as a plain copy, for a transfer code. */
    const snapshot = (): Preferences => ({ theme: theme.value, highlightMatching: highlightMatching.value, language: language.value })

    /** The preferences `adopt` would leave: each valid one from `incoming`, and the current one where it is missing or invalid. */
    function adopted(incoming: Record<string, unknown>): Preferences {
      const current = snapshot()
      return {
        theme: THEME_MODES.includes(incoming.theme as ThemeMode) ? (incoming.theme as ThemeMode) : current.theme,
        highlightMatching: typeof incoming.highlightMatching === 'boolean' ? incoming.highlightMatching : current.highlightMatching,
        language: incoming.language === 'system' || LANGUAGES.includes(incoming.language as never) ? (incoming.language as LanguageSetting) : current.language,
      }
    }

    /** Takes over preferences from `snapshot`: each valid one, and none that a hand-edited code got wrong. */
    function adopt(incoming: Record<string, unknown>) {
      const next = adopted(incoming)
      theme.value = next.theme
      highlightMatching.value = next.highlightMatching
      language.value = next.language
    }

    return { theme, highlightMatching, language, snapshot, adopted, adopt }
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
