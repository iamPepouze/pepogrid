// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SCHEMA_VERSION } from '../lib/schema'
import { readTransferCode } from '../lib/transfer'
import { useGameStore } from '../stores/game'
import { useSettingsStore } from '../stores/settings'
import { fill, nonGivensOf, seedResult } from '../stores/testing'
import MoveScreen from './MoveScreen.vue'

enableAutoUnmount(afterEach)

/** Fakes the clipboard, remembering what was written; `fail` makes the browser refuse. */
function fakeClipboard(fail = false) {
  const written: string[] = []
  const writeText = vi.fn(async (text: string) => {
    if (fail) throw new Error('NotAllowedError')
    written.push(text)
  })
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return written
}

describe('MoveScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => vi.unstubAllGlobals())

  const mountScreen = () => mount(MoveScreen)

  /** Waits out the copy: compressing the code takes more than a microtask. */
  const copied = (screen: ReturnType<typeof mountScreen>) => vi.waitFor(() => expect(screen.find('[role="status"]').text()).toContain('Copied'))

  it('has the title, the three steps and a link to the new address', () => {
    const screen = mountScreen()

    expect(screen.find('h2').text()).toBe('PepoGrid has moved')
    const steps = screen.findAll('ol > li')
    expect(steps).toHaveLength(3)
    expect(steps[0].find('button').text()).toBe('Copy transfer code')
    expect(steps[1].find('a').attributes('href')).toBe('https://pepogrid.adrienmg.eu')
    expect(steps[2].text()).toBe('In Settings, tap Paste transfer code.')
  })

  it('copies a transfer code that reads back to the stores’ state, and says so in a status region', async () => {
    const written = fakeClipboard()
    const game = useGameStore()
    await game.newGame('hard')
    fill(game, nonGivensOf(game, [...game.puzzle.keys()]).slice(0, 3))
    useSettingsStore().theme = 'dark'
    seedResult('easy', 'completed')
    const screen = mountScreen()
    expect(screen.find('[role="status"]').text()).toBe('')

    await screen.find('button.copy').trigger('click')
    await copied(screen)

    const read = await readTransferCode(written[0], SCHEMA_VERSION)
    expect(read.snapshot?.results).toHaveLength(1)
    expect(read.snapshot?.settings).toMatchObject({ theme: 'dark' })
    expect(read.snapshot?.game).toMatchObject({ difficulty: 'hard', values: game.values })
    expect(screen.find('[role="status"]').text()).toBe('Copied. Now paste it on the new address (step 3).')
  })

  it('changes nothing in the stores when copying', async () => {
    fakeClipboard()
    const game = useGameStore()
    await game.newGame('easy')
    seedResult('easy', 'completed')
    const before = JSON.stringify([game.$state, useSettingsStore().$state])
    const screen = mountScreen()

    await screen.find('button.copy').trigger('click')
    await copied(screen)

    expect(JSON.stringify([game.$state, useSettingsStore().$state])).toBe(before)
  })

  it('says the copy failed, and to tap Copy again, when the browser refuses', async () => {
    fakeClipboard(true)
    const screen = mountScreen()

    await screen.find('button.copy').trigger('click')
    await vi.waitFor(() => expect(screen.find('[role="status"]').text()).not.toBe(''))

    expect(screen.find('[role="status"]').text()).toBe('Couldn’t copy the transfer code. Tap Copy again.')
  })

  it('hands the clipboard a promise of the code where it can, so iOS keeps the tap’s permission', async () => {
    const written: Promise<Blob>[] = []
    class FakeItem {
      constructor(public items: Record<string, Promise<Blob>>) {
        written.push(items['text/plain'])
      }
    }
    vi.stubGlobal('ClipboardItem', FakeItem)
    Object.defineProperty(navigator, 'clipboard', { value: { write: vi.fn(async () => {}), writeText: vi.fn() }, configurable: true })
    const screen = mountScreen()

    await screen.find('button.copy').trigger('click')
    await copied(screen)

    expect(navigator.clipboard.write).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    expect((await readTransferCode(await (await written[0]).text(), SCHEMA_VERSION)).snapshot).toBeDefined()
    expect(screen.find('[role="status"]').text()).toContain('Copied')
  })

  it('opens Statistics from its Statistics button', async () => {
    const screen = mountScreen()

    await screen.find('button.statistics').trigger('click')

    expect(screen.emitted('statistics')).toHaveLength(1)
  })
})
