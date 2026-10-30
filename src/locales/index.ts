import type { Language } from '../lib/language'
import { de } from './de'
import { en, type Messages } from './en'
import { fr } from './fr'
import { deLessons } from './lessons-de'
import { frLessons } from './lessons-fr'
import type { LessonLanguage } from '../lib/lessons'

export type { Messages }

/** Each language's messages. */
export const MESSAGES: Record<Language, Messages> = { en, fr, de }

/** Each language's name in itself, so a player finds theirs whatever language the menu is in. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', fr: 'Français', de: 'Deutsch' }

/** BCP 47 tags for `Intl` and `<html lang>`. */
export const LOCALES: Record<Language, string> = { en: 'en', fr: 'fr', de: 'de' }

/** Each language's lessons and technique names; English is the lessons' own language, so it has none. */
export const LESSON_LANGUAGES: Record<Language, LessonLanguage | undefined> = {
  en: undefined,
  fr: { texts: frLessons, names: fr.techniques },
  de: { texts: deLessons, names: de.techniques },
}
