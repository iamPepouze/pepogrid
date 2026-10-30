/**
 * The app's languages and the choice between them. The setting is `system` or a language;
 * `system` follows the device's preferred languages. Keep in sync with the early script in index.html.
 */

export const LANGUAGES = ['en', 'fr', 'de'] as const

export type Language = (typeof LANGUAGES)[number]

export type LanguageSetting = 'system' | Language

/** The language to use: the setting when it names one, else the first of the device's languages the app supports, else English. */
export function resolveLanguage(preferred: readonly string[], setting: LanguageSetting): Language {
  if (setting !== 'system') return setting
  for (const tag of preferred) {
    const base = tag.split('-')[0].toLowerCase()
    const found = LANGUAGES.find((language) => language === base)
    if (found) return found
  }
  return 'en'
}
