import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { useSettingsStore } from './settings'

/** Stands in for localStorage, which these Node tests lack. */
const storage = new Map<string, string>()
const storageLike = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value) }

/** A fresh app start: a new Pinia that loads the saved settings from `storage`. Pinia only applies plugins once it is installed in an app. */
function startApp() {
  const pinia = createPinia().use(createPersistedState({ key: (id) => `pepogrid.${id}`, storage: storageLike }))
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useSettingsStore()
}

describe('settings store', () => {
  beforeEach(() => storage.clear())

  it('starts on the system theme and language, with the matching-number highlight on', () => {
    const settings = startApp()

    expect([settings.theme, settings.language, settings.highlightMatching]).toEqual(['system', 'system', true])
  })

  it('keeps what was saved', () => {
    storage.set('pepogrid.settings', JSON.stringify({ theme: 'dark', language: 'fr', highlightMatching: false }))
    const settings = startApp()

    expect([settings.theme, settings.language, settings.highlightMatching]).toEqual(['dark', 'fr', false])
  })

  it('falls back to the defaults for saved values that are not valid', () => {
    storage.set('pepogrid.settings', JSON.stringify({ theme: 'sepia', language: 'klingon', highlightMatching: 'yes' }))
    const settings = startApp()

    expect([settings.theme, settings.language, settings.highlightMatching]).toEqual(['system', 'system', true])
  })
})
