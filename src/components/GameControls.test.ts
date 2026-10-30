// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../stores/game'
import { useSettingsStore } from '../stores/settings'
import { fill, nonGivensOf } from '../stores/testing'
import GameControls from './GameControls.vue'

enableAutoUnmount(afterEach)

describe('GameControls', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('labels its buttons in the chosen language', () => {
    const labels = () => mount(GameControls, { global: { plugins: [pinia] } }).findAll('button').map((b) => b.text().replace(/\s*(ON|OFF|OUI|NON|AN|AUS)$/, ''))

    expect(labels()).toEqual(['Undo', 'Erase', 'Notes', 'Fill notes', 'Technique'])
    useSettingsStore().language = 'fr'
    expect(labels()).toEqual(['Annuler', 'Effacer', 'Notes', 'Remplir les notes', 'Technique'])
    useSettingsStore().language = 'de'
    expect(labels()).toEqual(['Rück­gängig', 'Löschen', 'Notizen', 'Notizen füllen', 'Technik'])
  })

  it('shows the Notes badge in the chosen language', async () => {
    const badge = () => controls.find('.badge').text()
    const game = useGameStore()
    const controls = mount(GameControls, { global: { plugins: [pinia] } })

    expect(badge()).toBe('OFF')
    useSettingsStore().language = 'fr'
    await controls.vm.$nextTick()
    expect(badge()).toBe('NON')
    game.toggleNotesMode()
    await controls.vm.$nextTick()
    expect(badge()).toBe('OUI')
    useSettingsStore().language = 'de'
    await controls.vm.$nextTick()
    expect(badge()).toBe('AN')
  })

  it('names Undo without the soft hyphen that lets its German label break', () => {
    useSettingsStore().language = 'de'
    const undo = mount(GameControls, { global: { plugins: [pinia] } }).find('button')

    expect(undo.text()).toContain(String.fromCharCode(0xad))
    expect(undo.attributes('aria-label')).toBe('Rückgängig')
  })

  it('fills notes from its button, then greys it out until the notes change', async () => {
    const game = useGameStore()
    await game.newGame('medium')
    const controls = mount(GameControls, { global: { plugins: [pinia] } })
    const fillButton = () => controls.findAll('button').find((b) => b.text() === 'Fill notes')!

    expect(fillButton().attributes('disabled')).toBeUndefined()
    await fillButton().trigger('click')
    expect(game.notes.some((n) => n !== 0)).toBe(true)
    expect(fillButton().attributes('disabled')).toBeDefined()

    game.undo()
    await controls.vm.$nextTick()
    expect(fillButton().attributes('disabled')).toBeUndefined()
  })

  it('asks for the key technique from its Technique button, from its own element', async () => {
    await useGameStore().newGame('easy')
    const controls = mount(GameControls, { global: { plugins: [pinia] } })
    const button = controls.findAll('button').find((b) => b.text() === 'Technique')!

    await button.trigger('click')
    expect(controls.emitted('keyTechnique')).toEqual([[button.element]])
  })

  it('disables Technique while a puzzle loads and once the game is solved', async () => {
    const game = useGameStore()
    await game.newGame('easy')
    const controls = mount(GameControls, { global: { plugins: [pinia] } })
    const disabled = () => controls.findAll<HTMLButtonElement>('button').find((b) => b.text() === 'Technique')!.element.disabled

    expect(disabled()).toBe(false)
    const loading = game.newGame('easy')
    await controls.vm.$nextTick()
    expect(disabled()).toBe(true)
    await loading
    fill(game, nonGivensOf(game, [...game.puzzle.keys()]))
    await controls.vm.$nextTick()
    expect(disabled()).toBe(true)
  })
})
