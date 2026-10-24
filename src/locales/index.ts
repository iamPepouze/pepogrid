import type { Language } from '../lib/language'
import { de } from './de'
import { en, type Messages } from './en'
import { fr } from './fr'

export type { Messages }

export const MESSAGES: Record<Language, Messages> = { en, fr, de }

/** Each language's name in itself, so a player finds theirs whatever language the menu is in. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', fr: 'Français', de: 'Deutsch' }

/** BCP 47 tags for `Intl` and `<html lang>`. */
export const LOCALES: Record<Language, string> = { en: 'en', fr: 'fr', de: 'de' }
