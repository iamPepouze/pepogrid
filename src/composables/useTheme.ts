import { computed, ref, watchEffect } from 'vue'
import { useSettingsStore } from '../stores/settings'

// Keep in sync with the early theme script in index.html.
const BAR_COLOR = { light: '#1565c0', dark: '#1e1e1e' }

/**
 * Applies the theme setting to the document: the data-theme attribute that
 * selects the palette, and the browser/OS title bar color. Call once, from App.
 */
export function useTheme() {
  const settings = useSettingsStore()

  const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const systemIsDark = ref(systemQuery.matches)
  systemQuery.addEventListener('change', (e) => {
    systemIsDark.value = e.matches
  })

  const isDark = computed(
    () => settings.theme === 'dark' || (settings.theme === 'system' && systemIsDark.value),
  )

  watchEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') delete root.dataset.theme
    else root.dataset.theme = settings.theme

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark.value ? BAR_COLOR.dark : BAR_COLOR.light)
  })

  return { isDark }
}
