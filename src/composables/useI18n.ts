import { computed, watchEffect } from 'vue'
import { resolveLanguage } from '../lib/language'
import { LESSON_LANGUAGES, LOCALES, MESSAGES } from '../locales'
import { useSettingsStore } from '../stores/settings'

/** The language the settings and the device give, with its messages and its BCP 47 tag for `Intl`. */
export function useI18n() {
  const settings = useSettingsStore()
  const language = computed(() => resolveLanguage(navigator.languages, settings.language))
  const t = computed(() => MESSAGES[language.value])
  const locale = computed(() => LOCALES[language.value])
  const lessonLanguage = computed(() => LESSON_LANGUAGES[language.value])
  /** A rating or an average to one decimal, with the language's decimal mark: 7.2, or 7,2 in French and German. */
  /** A technique's name as this language's players know it, from Sudoku Explainer's name; patterns they call by their English name stay as they are. */
  const techniqueName = (name: string) => t.value.techniques[name] ?? name
  const formatTenths = (n: number) => new Intl.NumberFormat(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)
  /** A share of 0-1 as a whole percent, as the language writes it: 45%, or 45 % in French and German. */
  const formatPercent = (share: number) => new Intl.NumberFormat(locale.value, { style: 'percent', maximumFractionDigits: 0 }).format(share)
  /** The day, month and time of a date, with the year when `withYear`, in the app's language and not the device's. */
  const formatDateTime = (date: Date, withYear: boolean) =>
    date.toLocaleString(locale.value, { day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined, hour: '2-digit', minute: '2-digit' })
  return { language, t, locale, lessonLanguage, techniqueName, formatTenths, formatPercent, formatDateTime }
}

/** Keeps `<html lang>` at the app's language. Call once, from App; index.html sets it before first paint. */
export function useDocumentLanguage() {
  const { locale } = useI18n()
  watchEffect(() => {
    document.documentElement.lang = locale.value
  })
}
