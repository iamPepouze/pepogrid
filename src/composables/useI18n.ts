import { computed, watchEffect } from 'vue'
import { resolveLanguage } from '../lib/language'
import { LOCALES, MESSAGES } from '../locales'
import { useSettingsStore } from '../stores/settings'

/** The language the settings and the device give, with its messages and its BCP 47 tag for `Intl`. */
export function useI18n() {
  const settings = useSettingsStore()
  const language = computed(() => resolveLanguage(navigator.languages, settings.language))
  const t = computed(() => MESSAGES[language.value])
  const locale = computed(() => LOCALES[language.value])
  return { language, t, locale }
}

/** Keeps `<html lang>` at the app's language. Call once, from App; index.html sets it before first paint. */
export function useDocumentLanguage() {
  const { locale } = useI18n()
  watchEffect(() => {
    document.documentElement.lang = locale.value
  })
}
