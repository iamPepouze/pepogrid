// @vitest-environment happy-dom
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { useGameStore } from './stores/game'
import { fill, nonGivensOf } from './stores/testing'

enableAutoUnmount(afterEach)

describe('App', () => {
  let pinia: Pinia

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  /** Mounts the app over a game already dealt, so the test doesn't race the first puzzle's loading. */
  async function mountApp() {
    await useGameStore().newGame('easy')
    const app = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
    await flushPromises()
    return app
  }

  /** Waits out a puzzle load: the bank arrives by dynamic import, which takes more than a microtask. */
  const settle = () => vi.waitFor(() => expect(useGameStore().loading).toBe(false))

  const newGameButton = '.topbar button[aria-label="New game"]'

  /** Places the right digit in the first empty cell, so a new game would throw progress away. */
  function makeProgress() {
    const game = useGameStore()
    const [cell] = nonGivensOf(game, [...game.puzzle.keys()])
    game.select(cell)
    game.input(game.solution[cell])
  }

  const dialogButton = (app: Awaited<ReturnType<typeof mountApp>>, label: string) => app.findAll('dialog button').find((b) => b.text() === label)!

  it('asks before the header’s New game button replaces a game with progress', async () => {
    const app = await mountApp()
    const game = useGameStore()
    makeProgress()
    const puzzle = [...game.puzzle]

    await app.find(newGameButton).trigger('click')
    expect(app.find('dialog').text()).toContain('Start a new Easy game?')
    await app.findAll('dialog button').find((b) => b.text() === 'Cancel')!.trigger('click')
    await flushPromises()
    expect(app.find('dialog').exists()).toBe(false)
    expect(game.puzzle).toEqual(puzzle)

    await app.find(newGameButton).trigger('click')
    await app.findAll('dialog button').find((b) => b.text() === 'New game')!.trigger('click')
    await settle()
    expect(app.find('dialog').exists()).toBe(false)
    expect(game.puzzle).not.toEqual(puzzle)
    expect(game.hasProgress).toBe(false)
  })

  it('starts a new game straight away when there is no progress to lose', async () => {
    const app = await mountApp()
    const game = useGameStore()
    const puzzle = [...game.puzzle]

    await app.find(newGameButton).trigger('click')
    expect(app.find('dialog').exists()).toBe(false)
    await settle()
    expect(game.puzzle).not.toEqual(puzzle)
  })

  it('asks before a difficulty change replaces a game with progress, then deals that difficulty', async () => {
    const app = await mountApp()
    const game = useGameStore()
    makeProgress()

    await app.find('.topbar button[aria-haspopup="menu"]').trigger('click')
    await app.findAll('[role="menuitemradio"]').find((b) => b.text() === 'Hard')!.trigger('click')
    expect(app.find('dialog').text()).toContain('Start a new Hard game?')
    expect(app.find('dialog').text()).toContain('Your current Easy game will be lost.')
    await dialogButton(app, 'New game').trigger('click')
    await settle()
    expect(game.difficulty).toBe('hard')
  })

  it('leaves the board alone when a key is pressed while the dialog is open', async () => {
    const app = await mountApp()
    const game = useGameStore()
    makeProgress()
    const empty = game.values.findIndex((v) => v === 0)
    game.select(empty)

    await app.find(newGameButton).trigger('click')
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: String(game.solution[empty]), code: `Digit${game.solution[empty]}`, bubbles: true }))
    expect(game.values[empty]).toBe(0)
  })

  // The tests below click without focusing first, as Safari does: a tap leaves focus where it was.

  it('gives focus back to the New game button when the dialog is cancelled', async () => {
    const app = await mountApp()
    makeProgress()
    const button = app.find<HTMLButtonElement>(newGameButton)

    await button.trigger('click')
    await dialogButton(app, 'Cancel').trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(button.element)
  })

  it('keeps the game and gives focus back to New game on Escape or a backdrop tap', async () => {
    const app = await mountApp()
    const game = useGameStore()
    makeProgress()
    const puzzle = [...game.puzzle]
    const button = app.find<HTMLButtonElement>(newGameButton)

    await button.trigger('click')
    await app.find('dialog').trigger('cancel')
    await flushPromises()
    expect(document.activeElement).toBe(button.element)

    button.element.blur()
    await button.trigger('click')
    await app.find('dialog').trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(button.element)
    expect(game.puzzle).toEqual(puzzle)
  })

  it('disables Play again while the next puzzle loads', async () => {
    const app = await mountApp()
    const game = useGameStore()
    fill(game, nonGivensOf(game, [...game.puzzle.keys()]))
    await flushPromises()

    const playAgain = app.findAll('.win button').find((b) => b.text() === 'Play again')!
    await playAgain.trigger('click')
    expect(playAgain.attributes('disabled')).toBeDefined()
    await settle()
  })

  it('moves focus to the board once a confirmed new game is dealt', async () => {
    const app = await mountApp()
    makeProgress()

    await app.find(newGameButton).trigger('click')
    await dialogButton(app, 'New game').trigger('click')
    await settle()
    expect(document.activeElement).toBe(app.find('[role="grid"]').element)
  })

  it('moves focus to the board once New game deals a game without asking', async () => {
    const app = await mountApp()

    await app.find(newGameButton).trigger('click')
    await settle()
    expect(document.activeElement).toBe(app.find('[role="grid"]').element)
  })

  it('moves focus to the board once a difficulty pick deals a game', async () => {
    const app = await mountApp()

    await app.find('.topbar button[aria-haspopup="menu"]').trigger('click')
    await app.findAll('[role="menuitemradio"]').find((b) => b.text() === 'Medium')!.trigger('click')
    await settle()
    expect(document.activeElement).toBe(app.find('[role="grid"]').element)
  })

  it('moves focus to the board once Play again deals a new game', async () => {
    const app = await mountApp()
    const game = useGameStore()
    fill(game, nonGivensOf(game, [...game.puzzle.keys()]))
    await flushPromises()

    await app.findAll('.win button').find((b) => b.text() === 'Play again')!.trigger('click')
    await settle()
    expect(document.activeElement).toBe(app.find('[role="grid"]').element)
  })

  it('says so in the dialog when a puzzle fails to load, then gives focus back to New game', async () => {
    const app = await mountApp()
    vi.spyOn(useGameStore(), 'newGame').mockRejectedValueOnce(new Error('offline'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const button = app.find<HTMLButtonElement>(newGameButton)

    await button.trigger('click')
    await flushPromises()
    expect(app.find('dialog').text()).toContain("Couldn't load a new Easy puzzle")
    expect(app.findAll('dialog button').map((b) => b.text())).toEqual(['OK'])
    await dialogButton(app, 'OK').trigger('click')
    await flushPromises()
    expect(document.activeElement).toBe(button.element)
  })
})
