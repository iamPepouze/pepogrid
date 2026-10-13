import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** User preferences. Persisted as `pepogrid.settings` (also read early by index.html). */
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<ThemeMode>('system')
    /** Tint cells sharing the selected cell's digit and emphasize matching notes. */
    const highlightMatching = ref(true)

    return { theme, highlightMatching }
  },
  {
    persist: {
      afterHydrate: ({ store }) => {
        if (!THEME_MODES.includes(store.theme)) store.theme = 'system'
        if (typeof store.highlightMatching !== 'boolean') store.highlightMatching = true
      },
    },
  },
)
