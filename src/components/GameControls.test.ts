// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../stores/game'
import GameControls from './GameControls.vue'

enableAutoUnmount(afterEach)

describe('GameControls', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
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
})
