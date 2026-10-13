import { computed, ref, watchEffect } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

// Keep in sync with the early theme script in index.html.
const STORAGE_KEY = 'pepogrid:theme'
const BAR_COLOR = { light: '#1565c0', dark: '#1e1e1e' }

function readSaved(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

const mode = ref<ThemeMode>(readSaved())

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemIsDark = ref(systemQuery.matches)
systemQuery.addEventListener('change', (e) => {
  systemIsDark.value = e.matches
})

const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && systemIsDark.value))

watchEffect(() => {
  const root = document.documentElement
  if (mode.value === 'system') delete root.dataset.theme
  else root.dataset.theme = mode.value

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark.value ? BAR_COLOR.dark : BAR_COLOR.light)

  try {
    if (mode.value === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, mode.value)
  } catch {
    // Storage unavailable: the choice lasts for this session only.
  }
})

export function useTheme() {
  return { mode, isDark }
}
