import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

/** User preferences. Persisted as `pepogrid.settings` (also read early by index.html). */
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<ThemeMode>('system')

    return { theme }
  },
  {
    persist: {
      afterHydrate: ({ store }) => {
        if (!THEME_MODES.includes(store.theme)) store.theme = 'system'
      },
    },
  },
)
