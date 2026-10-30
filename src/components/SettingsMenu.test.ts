// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from '../stores/settings'
import SettingsMenu from './SettingsMenu.vue'

enableAutoUnmount(afterEach)

/** Stands in for localStorage, which a fresh app start reads its saved settings from. */
const storage = new Map<string, string>()
const storageLike = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value) }

/** Makes the device prefer these languages. */
const deviceLanguages = (...languages: string[]) => vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)

describe('SettingsMenu', () => {
  let pinia: Pinia

  beforeEach(() => {
    storage.clear()
    pinia = createPinia().use(createPersistedState({ key: (id) => `pepogrid.${id}`, storage: storageLike }))
    setActivePinia(pinia)
    deviceLanguages('en-US')
  })
  afterEach(() => vi.restoreAllMocks())

  const open = async () => {
    const menu = mount(SettingsMenu, { global: { plugins: [pinia] }, attachTo: document.body })
    await menu.find('button.trigger').trigger('click')
    return menu
  }

  describe('Language', () => {
    it('is the first group, with each language named in itself', async () => {
      const menu = await open()
      const groups = menu.findAll('fieldset')

      expect(groups[0].find('legend').text()).toBe('Language')
      expect(groups[0].findAll('label').map((l) => l.text())).toEqual(['System (English)', 'English', 'Français', 'Deutsch'])
    })

    it('says which language System gives on this device', async () => {
      deviceLanguages('fr-CA', 'en')
      const menu = await open()

      expect(menu.find('fieldset').findAll('label')[0].text()).toBe('Système (Français)')
    })

    it('says which language System would give, not the one the app is in', async () => {
      deviceLanguages('fr')
      useSettingsStore().language = 'de'
      const menu = await open()

      expect(menu.find('fieldset').findAll('label')[0].text()).toBe('System (Français)')
    })

    it('moves focus with the arrow keys without picking or reloading', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      const menu = await open()
      const inputs = menu.findAll('fieldset')[0].findAll('input')
      inputs[0].element.focus()

      await inputs[0].trigger('keydown', { key: 'ArrowDown' })
      expect(document.activeElement).toBe(inputs[1].element)
      await inputs[1].trigger('keydown', { key: 'ArrowUp' })
      await inputs[0].trigger('keydown', { key: 'ArrowUp' })
      expect(document.activeElement).toBe(inputs[3].element)
      await menu.vm.$nextTick()

      expect(reload).not.toHaveBeenCalled()
      expect(useSettingsStore().language).toBe('system')
    })

    it('picks the focused language on Enter', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      const menu = await open()
      const inputs = menu.findAll('fieldset')[0].findAll('input')
      inputs[0].element.focus()

      await inputs[0].trigger('keydown', { key: 'ArrowDown' })
      await inputs[1].trigger('keydown', { key: 'Enter' })
      await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())

      expect(useSettingsStore().language).toBe('en')
    })

    it('saves the pick and reloads the page', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      const menu = await open()

      await menu.findAll('fieldset')[0].findAll('input')[3].setValue()
      await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())

      expect(JSON.parse(storage.get('pepogrid.settings')!).language).toBe('de')
    })

    it('does not reload when the language is already the one picked', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      const menu = await open()

      await menu.findAll('fieldset')[0].findAll('input')[0].setValue()
      await menu.vm.$nextTick()

      expect(reload).not.toHaveBeenCalled()
    })

    it('puts the whole menu in the chosen language', async () => {
      useSettingsStore().language = 'de'
      const menu = await open()
      const text = menu.find('.popover').text()

      expect(menu.find('.popover').attributes('aria-label')).toBe('Einstellungen')
      expect(text).toContain('Gleiche Ziffern hervorheben')
      expect(text).toContain('Hell')
      expect(text).toContain('Lizenz')
    })
  })
})
