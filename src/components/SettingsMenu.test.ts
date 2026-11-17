// @vitest-environment happy-dom
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCodeFromStores } from '../composables/useTransfer'
import { SCHEMA_VERSION } from '../lib/schema'
import { createTransferCode, readTransferCode } from '../lib/transfer'
import { useGameStore } from '../stores/game'
import { useResultsStore } from '../stores/results'
import { useSettingsStore } from '../stores/settings'
import { fill, nonGivensOf, seedResult } from '../stores/testing'
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

      const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      inputs[0].element.dispatchEvent(arrow)
      // The browser's own move to the next radio, which would pick it, is the default action.
      expect(arrow.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(inputs[1].element)
      await inputs[1].trigger('keydown', { key: 'ArrowUp' })
      await inputs[0].trigger('keydown', { key: 'ArrowUp' })
      expect(document.activeElement).toBe(inputs[3].element)
      await menu.vm.$nextTick()

      expect(reload).not.toHaveBeenCalled()
      expect(useSettingsStore().language).toBe('system')
    })

    it('leaves Alt + arrow to the browser, which goes back and forward with it', async () => {
      const menu = await open()
      const inputs = menu.findAll('fieldset')[0].findAll('input')
      inputs[0].element.focus()

      const back = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true, cancelable: true })
      inputs[0].element.dispatchEvent(back)

      expect(back.defaultPrevented).toBe(false)
      expect(document.activeElement).toBe(inputs[0].element)
    })

    it('makes one Tab stop of the group, wherever focus is in it', async () => {
      useSettingsStore().language = 'fr'
      const menu = await open()
      const stops = () => menu.findAll('fieldset')[0].findAll('input').map((i) => i.attributes('tabindex') !== '-1')
      const inputs = menu.findAll('fieldset')[0].findAll('input')

      // Focus in the group on a language that isn't picked: the picked one stops being a stop, so Tab leaves the group.
      await inputs[1].trigger('focus')
      expect(stops()).toEqual([true, true, false, true])
      await inputs[2].trigger('focus')
      expect(stops()).toEqual([true, true, true, true])
    })

    it('keeps the picked language a Tab stop after a tap outside closes the menu from another one', async () => {
      useSettingsStore().language = 'fr'
      const menu = await open()
      const radios = () => menu.findAll('fieldset')[0].findAll('input')
      await radios()[1].trigger('focus')

      // A browser may fire no focusout when the focused radio is removed with the menu.
      document.dispatchEvent(new Event('pointerdown'))
      await menu.vm.$nextTick()
      await menu.find('button.trigger').trigger('click')

      expect(radios().map((i) => i.attributes('tabindex') !== '-1')).toEqual([true, true, true, true])
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

  describe('Paste transfer code', () => {
    /** A clock that moves a second on at every reading, so no press lands inside the dialog's guard after a step change. */
    let clock: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      let now = 0
      clock = vi.spyOn(performance, 'now').mockImplementation(() => (now += 1000))
    })

    /** Makes the clipboard hold `text`, or refuse to be read. */
    const clipboardHolds = (text: string | Error) =>
      Object.defineProperty(navigator, 'clipboard', { value: { readText: vi.fn(async () => (text instanceof Error ? Promise.reject(text) : text)) }, configurable: true })

    /** The code another address would copy, from stores of their own: `setup` plays that address. */
    async function codeFrom(setup: () => Promise<void> | void) {
      setActivePinia(createPinia())
      await setup()
      const code = await createCodeFromStores()
      setActivePinia(pinia)
      return code
    }

    /** A code with `n` results and a hard game with a digit placed. */
    const hardGameCode = (n = 2, settings: (s: ReturnType<typeof useSettingsStore>) => void = () => {}) =>
      codeFrom(async () => {
        const game = useGameStore()
        await game.newGame('hard')
        fill(game, nonGivensOf(game, [...game.puzzle.keys()]).slice(0, 2))
        for (let i = 0; i < n; i++) seedResult('hard', 'completed', { endedAt: `2026-02-0${i + 1}T10:00:00Z` })
        settings(useSettingsStore())
      })

    const entry = (menu: Awaited<ReturnType<typeof open>>) => menu.find('button.paste-entry')
    const dialogButton = (menu: Awaited<ReturnType<typeof open>>, label: string) => menu.findAll('dialog button').find((b) => b.text() === label)!
    /** Opens the dialog and taps Paste, which reads the clipboard. */
    async function paste(menu: Awaited<ReturnType<typeof open>>) {
      await entry(menu).trigger('click')
      await dialogButton(menu, 'Paste').trigger('click')
      await vi.waitFor(() => expect(menu.find('dialog').text()).not.toContain('Reading'))
    }

    /** Makes the clipboard read wait until the returned function answers it, as iOS's Paste callout does. */
    function slowClipboard() {
      let answer: (text: string) => void = () => {}
      Object.defineProperty(navigator, 'clipboard', { value: { readText: () => new Promise<string>((resolve) => (answer = resolve)) }, configurable: true })
      return (text: string) => answer(text)
    }

    it('waits on Paste while the clipboard is being read, and still offers Cancel', async () => {
      const answer = slowClipboard()
      const menu = await open()
      await entry(menu).trigger('click')

      await dialogButton(menu, 'Paste').trigger('click')

      expect(menu.find('dialog').text()).toContain('Reading the transfer code…')
      expect(dialogButton(menu, 'Paste').attributes('disabled')).toBeDefined()
      expect(dialogButton(menu, 'Cancel').attributes('disabled')).toBeUndefined()
      answer('hello')
      await vi.waitFor(() => expect(menu.find('dialog').text()).toContain('That isn’t a transfer code.'))
    })

    it('closes on Cancel while the clipboard is being read, and does nothing with what arrives', async () => {
      const answer = slowClipboard()
      const menu = await open()
      await entry(menu).trigger('click')
      await dialogButton(menu, 'Paste').trigger('click')

      await dialogButton(menu, 'Cancel').trigger('click')
      answer(await hardGameCode())
      await flushPromises()

      expect(menu.find('dialog').exists()).toBe(false)
      expect(useResultsStore().results).toHaveLength(0)
      expect(document.activeElement).toBe(entry(menu).element)
    })

    it('ignores a press that lands just as the dialog moves on, so a double tap can’t bring it over unread', async () => {
      clipboardHolds(await hardGameCode())
      const menu = await open()
      await paste(menu)
      clock.mockReturnValue(5_000_000)

      await dialogButton(menu, 'Bring over').trigger('click')
      expect(menu.find('dialog').text()).toContain('Your settings came over')
      await dialogButton(menu, 'OK').trigger('click')

      expect(menu.find('dialog').exists()).toBe(true)
    })

    it('neither lists nor warns about a game the code carries that the app can’t resume', async () => {
      // A hand-altered code: its game passes the code's own checks, not the game store's.
      const { snapshot } = await readTransferCode(await hardGameCode(0), SCHEMA_VERSION)
      clipboardHolds(await createTransferCode({ ...snapshot!, game: { ...snapshot!.game, mistakes: 1.5 } }))
      const game = useGameStore()
      await game.newGame('medium')
      fill(game, nonGivensOf(game, [...game.puzzle.keys()]).slice(0, 1))
      const menu = await open()
      await paste(menu)

      expect(menu.find('dialog').text()).toContain('No game in progress')
      expect(menu.find('dialog').text()).not.toContain('Abandoned')
      await dialogButton(menu, 'Bring over').trigger('click')

      expect(game.difficulty).toBe('medium')
      expect(useResultsStore().results).toHaveLength(0)
    })

    it('is an entry in the menu that opens a dialog with a Paste button and Cancel', async () => {
      const menu = await open()

      await entry(menu).trigger('click')

      expect(menu.find('dialog').find('h2').text()).toBe('Paste transfer code')
      expect(menu.findAll('dialog button').map((b) => b.text())).toEqual(['Cancel', 'Paste'])
    })

    it('says what the transfer code holds before anything changes', async () => {
      clipboardHolds(await hardGameCode(2, (s) => (s.theme = 'dark')))
      const menu = await open()

      await paste(menu)

      expect(menu.find('dialog').text()).toContain('2 results')
      expect(menu.find('dialog').text()).toContain('Game in progress: Hard')
      expect(menu.find('dialog').text()).toContain('Settings: System (English), Dark theme, matching numbers highlighted')
      expect(menu.findAll('dialog button').map((b) => b.text())).toEqual(['Cancel', 'Bring over'])
      // On Cancel, so a second Enter after Paste can't bring it over unread.
      expect(document.activeElement).toBe(dialogButton(menu, 'Cancel').element)
      expect(useResultsStore().results).toHaveLength(0)
      expect(useGameStore().isValid()).toBe(false)
    })

    it('brings the results, settings and game over on Bring over, and says what came', async () => {
      clipboardHolds(await hardGameCode(2, (s) => (s.theme = 'dark')))
      seedResult('easy', 'completed', { endedAt: '2026-01-01T10:00:00Z' })
      const menu = await open()
      await paste(menu)

      await dialogButton(menu, 'Bring over').trigger('click')

      expect(useResultsStore().results.map((r) => r.difficulty)).toEqual(['easy', 'hard', 'hard'])
      expect(useSettingsStore().theme).toBe('dark')
      expect(useGameStore().difficulty).toBe('hard')
      expect(useGameStore().isValid()).toBe(true)
      expect(menu.find('dialog').text()).toContain('Your settings came over, with 2 new results. Your Hard game is on the grid.')
      expect(menu.findAll('dialog button').map((b) => b.text())).toEqual(['OK'])
    })

    it('adds no result twice when the same code is brought over twice', async () => {
      clipboardHolds(await hardGameCode())
      const menu = await open()
      const said: string[] = []
      for (let n = 0; n < 2; n++) {
        await paste(menu)
        await dialogButton(menu, 'Bring over').trigger('click')
        said.push(menu.find('dialog p').text())
        await dialogButton(menu, 'OK').trigger('click')
        await menu.vm.$nextTick()
      }

      expect(said[1]).toBe('Your settings came over, with no new results. Your Hard game is on the grid.')
      // The second time, the game the first brought over has a placed digit, so it is recorded as Abandoned, once.
      const outcomes = useResultsStore().results.map((r) => r.outcome)
      expect(outcomes.filter((o) => o === 'completed')).toHaveLength(2)
      expect(outcomes.filter((o) => o === 'abandoned')).toHaveLength(1)
    })

    it('warns that a game with a placed digit will be recorded as Abandoned, and keeps that result', async () => {
      clipboardHolds(await hardGameCode(1))
      const game = useGameStore()
      await game.newGame('medium')
      fill(game, nonGivensOf(game, [...game.puzzle.keys()]).slice(0, 1))
      const menu = await open()
      await paste(menu)

      expect(menu.find('dialog').text()).toContain('Your current Medium game will be recorded as Abandoned.')
      await dialogButton(menu, 'Bring over').trigger('click')

      expect(useResultsStore().results.map((r) => [r.difficulty, r.outcome])).toContainEqual(['medium', 'abandoned'])
      expect(useResultsStore().results).toHaveLength(2)
      expect(game.difficulty).toBe('hard')
    })

    it('does not warn, or record anything, when the game on the board has no placed digit', async () => {
      clipboardHolds(await hardGameCode(0))
      await useGameStore().newGame('medium')
      const menu = await open()
      await paste(menu)

      expect(menu.find('dialog').text()).not.toContain('Abandoned')
      await dialogButton(menu, 'Bring over').trigger('click')

      expect(useResultsStore().results).toHaveLength(0)
    })

    it.each([
      ['text that is not a transfer code', 'hello', 'That isn’t a transfer code. Copy it again on the old address, then tap Paste.'],
      ['a code from a newer format', 'pepogrid-transfer:9:AAAA', 'This transfer code is from a newer version of PepoGrid. Update the app, then tap Paste again.'],
      ['a clipboard that cannot be read', new Error('NotAllowedError'), 'PepoGrid couldn’t read the clipboard. Copy the transfer code again on the old address, then tap Paste.'],
    ])('says so for %s, and offers Paste again', async (_name, clipboard, message) => {
      clipboardHolds(clipboard)
      const menu = await open()

      await paste(menu)

      expect(menu.find('dialog').text()).toContain(message)
      expect(menu.findAll('dialog button').map((b) => b.text())).toEqual(['Cancel', 'Paste'])
      expect(document.activeElement).toBe(dialogButton(menu, 'Paste').element)
    })

    it.each([
      ['Cancel', (menu: Awaited<ReturnType<typeof open>>) => dialogButton(menu, 'Cancel').trigger('click')],
      ['Esc', (menu: Awaited<ReturnType<typeof open>>) => menu.find('dialog').trigger('cancel')],
      ['a tap outside', (menu: Awaited<ReturnType<typeof open>>) => menu.find('dialog').trigger('click')],
    ])('changes nothing and returns focus to the entry on %s', async (_name, dismiss) => {
      clipboardHolds(await hardGameCode())
      const menu = await open()
      await paste(menu)

      await dismiss(menu)
      await menu.vm.$nextTick()

      expect(menu.find('dialog').exists()).toBe(false)
      expect(useResultsStore().results).toHaveLength(0)
      expect(useGameStore().isValid()).toBe(false)
      expect(document.activeElement).toBe(entry(menu).element)
    })

    it('reloads into the incoming language once the player has read what came over', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      clipboardHolds(await hardGameCode(1, (s) => (s.language = 'de')))
      const menu = await open()
      await paste(menu)
      await dialogButton(menu, 'Bring over').trigger('click')

      expect(reload).not.toHaveBeenCalled()
      expect(menu.find('dialog').text()).toContain('Deine Einstellungen wurden übernommen, mit 1 neuen Ergebnis.')
      await dialogButton(menu, 'OK').trigger('click')
      await vi.waitFor(() => expect(reload).toHaveBeenCalledOnce())
    })

    it('does not reload when the language stays the same', async () => {
      const reload = vi.fn()
      vi.stubGlobal('location', { ...window.location, reload })
      clipboardHolds(await hardGameCode())
      const menu = await open()
      await paste(menu)
      await dialogButton(menu, 'Bring over').trigger('click')
      await dialogButton(menu, 'OK').trigger('click')
      await menu.vm.$nextTick()

      expect(reload).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(entry(menu).element)
    })

    it('is not offered on the old address', async () => {
      vi.stubEnv('VITE_PEPOGRID_PAGES', 'true')
      const menu = await open()

      expect(entry(menu).exists()).toBe(false)
    })
  })
})
