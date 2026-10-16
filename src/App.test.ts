// @vitest-environment happy-dom
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { useGameStore } from './stores/game'
import { nonGivensOf } from './stores/testing'

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

  it('asks before the header’s New game button replaces a game with progress', async () => {
    const app = await mountApp()
    const game = useGameStore()
    const [cell] = nonGivensOf(game, [...game.puzzle.keys()])
    game.select(cell)
    game.input(game.solution[cell])
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
})
