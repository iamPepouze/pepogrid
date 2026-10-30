// @vitest-environment happy-dom
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import type { RegisterSWOptions } from 'virtual:pwa-register'
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import App from './App.vue'
import { useGameStore } from './stores/game'
import { useSettingsStore } from './stores/settings'
import { fill, nonGivensOf, seedResult } from './stores/testing'

/**
 * The service worker registration, faked: `sw.options` holds what App's update composable passed in.
 * It's saved here, not read from `mock.calls`: Vitest clears call history before each test, and
 * App registers only once, on import.
 */
const sw = vi.hoisted(() => ({ options: {} as RegisterSWOptions, update: vi.fn(async () => {}) }))
vi.mock('virtual:pwa-register', () => ({
  registerSW(options: RegisterSWOptions) {
    sw.options = options
    return sw.update
  },
}))

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

  describe('in French and German', () => {
    it('words the header, status bar and new game dialog in French', async () => {
      useSettingsStore().language = 'fr'
      const app = await mountApp()
      makeProgress()

      expect(app.find('.tagline').text()).toBe('Ta grille, ta détente.')
      expect(app.find('.topbar button[aria-label="Statistiques"]').exists()).toBe(true)
      expect(app.find('.status').text()).toMatch(/^Erreurs : 0/)
      expect(app.find('.timer').attributes('aria-label')).toBe('Temps écoulé')

      await app.find('.topbar button[aria-label="Nouvelle partie"]').trigger('click')
      expect(app.find('dialog').text()).toContain('Commencer une nouvelle partie Facile ?')
      expect(app.find('dialog').text()).toContain('Ta partie Facile en cours sera perdue.')
      expect(app.findAll('dialog button').map((b) => b.text())).toEqual(['Annuler', 'Nouvelle partie'])
    })

    it('says in the solved banner how the game went, in the language and with its plural', async () => {
      useSettingsStore().language = 'de'
      const app = await mountApp()
      const game = useGameStore()
      fill(game, nonGivensOf(game, [...game.puzzle.keys()]))
      await flushPromises()

      expect(app.find('.win').text()).toMatch(/^Gelöst! Leicht in .* mit 0 Fehlern./)
      expect(app.find('.win button').text()).toBe('Nochmal spielen')
    })

    it('writes the SE rating with the language’s decimal mark', async () => {
      useSettingsStore().language = 'fr'
      await useGameStore().newGame('expert')
      const app = mount(App, { global: { plugins: [pinia] }, attachTo: document.body })
      await flushPromises()
      const se = useGameStore().rating!.se.toFixed(1)

      expect(se).toContain('.')
      expect(app.find('.rating').text()).toBe(`SE ${se.replace('.', ',')}`)
    })

    it('says in the dialog, in German, when a puzzle fails to load', async () => {
      useSettingsStore().language = 'de'
      const app = await mountApp()
      vi.spyOn(useGameStore(), 'newGame').mockRejectedValueOnce(new Error('offline'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      await app.find('.topbar button[aria-label="Neues Spiel"]').trigger('click')
      await flushPromises()

      expect(app.find('dialog').text()).toContain('Neues Leicht-Rätsel konnte nicht geladen werden')
    })
  })

  describe('Statistics', () => {
    const statisticsButton = '.topbar button[aria-label="Statistics"]'

    it('swaps the game for Statistics, and Back returns to the game with focus on the Statistics button', async () => {
      const app = await mountApp()
      const button = app.find<HTMLButtonElement>(statisticsButton)

      await button.trigger('click')
      expect(button.attributes('aria-pressed')).toBe('true')
      expect(app.find('.statistics').exists()).toBe(true)
      expect(app.find<HTMLElement>('.game').element.style.display).toBe('none')
      expect(app.find(newGameButton).exists()).toBe(false)

      await app.findAll('.statistics button').find((b) => b.text() === 'Back')!.trigger('click')
      expect(app.find('.statistics').exists()).toBe(false)
      expect(app.find<HTMLElement>('.game').element.style.display).toBe('')
      expect(app.find(newGameButton).exists()).toBe(true)
      expect(document.activeElement).toBe(button.element)
    })

    it('disables the Statistics button while a puzzle loads, so no game is dealt behind it', async () => {
      const app = await mountApp()
      const button = app.find<HTMLButtonElement>(statisticsButton)

      await app.find(newGameButton).trigger('click')
      expect(button.element.disabled).toBe(true)
      await settle()
      await flushPromises()
      expect(button.element.disabled).toBe(false)
    })

    it('goes back to the game when the Statistics button is pressed again', async () => {
      const app = await mountApp()
      await app.find(statisticsButton).trigger('click')
      await app.find(statisticsButton).trigger('click')
      expect(app.find('.statistics').exists()).toBe(false)
      expect(app.find(statisticsButton).attributes('aria-pressed')).toBe('false')
    })

    it('stops the timer while Statistics is open', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      try {
        const app = await mountApp()
        const game = useGameStore()
        await app.find(statisticsButton).trigger('click')
        vi.advanceTimersByTime(5000)
        expect(game.elapsed).toBe(0)

        await app.find(statisticsButton).trigger('click')
        vi.advanceTimersByTime(2000)
        expect(game.elapsed).toBe(2)
      } finally {
        vi.useRealTimers()
      }
    })

    it('leaves the board alone when a key is pressed while Statistics is open', async () => {
      const app = await mountApp()
      const game = useGameStore()
      const [cell] = nonGivensOf(game, [...game.puzzle.keys()])
      game.select(cell)
      await app.find(statisticsButton).trigger('click')

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', code: 'Digit5' }))
      expect(game.values[cell]).toBe(0)
    })

    /** Opens Statistics over two stored results, and returns its Reset statistics button. */
    async function openWithResults(app: Awaited<ReturnType<typeof mountApp>>) {
      seedResult('hard', 'completed')
      seedResult('hard', 'abandoned')
      await app.find(statisticsButton).trigger('click')
      return app.findAll<HTMLButtonElement>('.statistics button').find((b) => b.text() === 'Reset statistics')!
    }

    it('asks before Reset statistics clears every result, and then focuses Back', async () => {
      const app = await mountApp()
      const reset = await openWithResults(app)

      await reset.trigger('click')
      expect(app.find('dialog').text()).toContain('Reset statistics?')
      await dialogButton(app, 'Reset').trigger('click')
      await flushPromises()

      expect(app.find('dialog').exists()).toBe(false)
      expect(app.find('.summary').text()).toMatch(/Played\s*0/)
      expect(document.activeElement?.textContent?.trim()).toBe('Back')
    })

    it('keeps every result and gives focus back to Reset on Cancel, Escape or a backdrop tap', async () => {
      const app = await mountApp()
      const reset = await openWithResults(app)
      const dismissals = [() => dialogButton(app, 'Cancel').trigger('click'), () => app.find('dialog').trigger('cancel'), () => app.find('dialog').trigger('click')]

      for (const dismiss of dismissals) {
        reset.element.blur()
        await reset.trigger('click')
        await dismiss()
        await flushPromises()
        expect(app.find('dialog').exists()).toBe(false)
        expect(document.activeElement).toBe(reset.element)
      }
      expect(app.find('.summary').text()).toMatch(/Played\s*2/)
    })

    it('opens Statistics on the current game’s difficulty', async () => {
      const app = await mountApp()
      await useGameStore().newGame('hard')
      await app.find(statisticsButton).trigger('click')
      expect(app.find('[role="tab"][aria-selected="true"]').text()).toBe('Hard')
    })
  })

  describe('Key technique', () => {
    type App = Awaited<ReturnType<typeof mountApp>>
    const techniqueButton = (app: App) => app.findAll<HTMLButtonElement>('.controls button').find((b) => b.text() === 'Technique')!
    const tab = (app: App, label: string) => app.findAll<HTMLButtonElement>('.key-technique [role="tab"]').find((b) => b.text() === label)!
    const selectedTab = (app: App) => app.find('.key-technique [role="tab"][aria-selected="true"]').text()

    /** Opens the view from Technique, confirming the next step when asked. */
    async function openView(app: App) {
      await techniqueButton(app).trigger('click')
      if (app.find('dialog').exists()) await dialogButton(app, 'Show').trigger('click')
      await flushPromises()
    }

    it('asks before the first next step, and Cancel shows and counts nothing and gives focus back to Technique', async () => {
      const app = await mountApp()
      const game = useGameStore()
      const button = techniqueButton(app)

      await button.trigger('click')
      expect(app.find('dialog').text()).toContain('See your next step?')
      expect(app.find('dialog').text()).toContain('noted on this game’s result')
      await dialogButton(app, 'Cancel').trigger('click')
      await flushPromises()

      expect(game.nextStepsShown).toBe(0)
      expect(app.find('.key-technique').exists()).toBe(false)
      expect(document.activeElement).toBe(button.element)
    })

    it('opens on Next step in place of the board once confirmed', async () => {
      const app = await mountApp()
      const game = useGameStore()

      await openView(app)

      expect(game.nextStepsShown).toBe(1)
      expect(selectedTab(app)).toBe('Next step')
      expect(app.find('.key-technique .technique').text()).toBe('Hidden Single')
      expect(app.find<HTMLElement>('.game').element.style.display).toBe('none')
      expect(app.find(newGameButton).exists()).toBe(false)
      // Technique is hidden with the board, so focus moves into the view.
      expect(document.activeElement?.textContent?.trim()).toBe('Back')
    })

    it('counts each opening once, even after switching tabs, and asks only before the game’s first', async () => {
      const app = await mountApp()
      const game = useGameStore()
      game.revealKeyTechnique()

      await openView(app)
      await tab(app, 'Hardest').trigger('click')
      await tab(app, 'Next step').trigger('click')
      await tab(app, 'Hardest').trigger('click')
      expect(game.nextStepsShown).toBe(1)

      await app.findAll('.key-technique button').find((b) => b.text() === 'Back')!.trigger('click')
      await techniqueButton(app).trigger('click')
      await flushPromises()
      expect(app.find('dialog').exists()).toBe(false)
      expect(selectedTab(app)).toBe('Next step')
      expect(game.nextStepsShown).toBe(2)
    })

    it('asks before the first Hardest tab, and Cancel keeps Next step with focus on Hardest', async () => {
      const app = await mountApp()
      const game = useGameStore()
      await openView(app)

      await tab(app, 'Hardest').trigger('click')
      expect(app.find('dialog').text()).toContain('Reveal the key technique?')
      await dialogButton(app, 'Cancel').trigger('click')
      await flushPromises()

      expect(game.keyTechniqueRevealed).toBe(false)
      expect(selectedTab(app)).toBe('Next step')
      expect(document.activeElement).toBe(tab(app, 'Hardest').element)
    })

    it('reveals the hardest technique on Hardest once confirmed', async () => {
      const app = await mountApp()
      const game = useGameStore()
      await openView(app)

      await tab(app, 'Hardest').trigger('click')
      await dialogButton(app, 'Reveal').trigger('click')
      await flushPromises()

      expect(game.keyTechniqueRevealed).toBe(true)
      expect(selectedTab(app)).toBe('Hardest')
      expect(app.find('.key-technique .technique').text()).toBe(game.rating!.hardest)
      expect(document.activeElement).toBe(tab(app, 'Hardest').element)
    })

    it('opens Hardest straight away once revealed, and Back returns to the game with focus on Technique', async () => {
      const app = await mountApp()
      useGameStore().revealKeyTechnique()
      const button = techniqueButton(app)
      await openView(app)

      await tab(app, 'Hardest').trigger('click')
      expect(app.find('dialog').exists()).toBe(false)
      expect(selectedTab(app)).toBe('Hardest')

      await app.findAll('.key-technique button').find((b) => b.text() === 'Back')!.trigger('click')
      expect(app.find('.key-technique').exists()).toBe(false)
      expect(app.find<HTMLElement>('.game').element.style.display).toBe('')
      expect(document.activeElement).toBe(button.element)
    })

    it.each(['Next step', 'Hardest'])('stops the timer and leaves the board alone while the key technique is open on %s', async (label) => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      try {
        const app = await mountApp()
        const game = useGameStore()
        game.revealKeyTechnique()
        const [cell] = nonGivensOf(game, [...game.puzzle.keys()])
        game.select(cell)
        await openView(app)
        await tab(app, label).trigger('click')

        vi.advanceTimersByTime(5000)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', code: 'Digit5' }))
        expect(game.elapsed).toBe(0)
        expect(game.values[cell]).toBe(0)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  it('shows Update in the header once a new version is waiting, and loads it on tap', async () => {
    // A returning player: the installed version controls the page.
    const real = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker')
    Object.defineProperty(navigator, 'serviceWorker', { value: { controller: {} }, configurable: true })
    onTestFinished(() => {
      if (real) Object.defineProperty(navigator, 'serviceWorker', real)
      else delete (navigator as { serviceWorker?: unknown }).serviceWorker
    })
    const app = await mountApp()
    const updateButton = () => app.findAll('.topbar button').find((b) => b.text() === 'Update')
    expect(updateButton()).toBeUndefined()

    sw.options.onNeedRefresh!()
    await flushPromises()
    await updateButton()!.trigger('click')
    expect(sw.update).toHaveBeenCalledOnce()
  })
})
