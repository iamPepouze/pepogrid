// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Difficulty } from '../lib/difficulty'
import { seedResult } from '../stores/testing'
import StatisticsView from './StatisticsView.vue'

enableAutoUnmount(afterEach)

describe('StatisticsView', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountView = (current: Difficulty) => mount(StatisticsView, { props: { current }, global: { plugins: [pinia] }, attachTo: document.body })
  const selectedTab = (view: ReturnType<typeof mountView>) => view.find('[role="tab"][aria-selected="true"]')

  it('counts every difficulty in the summary, and the selected difficulty in its tab', () => {
    seedResult('hard', 'completed')
    seedResult('hard', 'abandoned')
    seedResult('hard', 'completed')
    seedResult('master', 'abandoned')
    const view = mountView('hard')

    const summary = view.find('.summary').text()
    expect(summary).toMatch(/Played\s*4/)
    expect(summary).toMatch(/Solved\s*2/)
    expect(summary).toMatch(/Abandoned\s*2/)
    expect(summary).toMatch(/Solve rate\s*50%/)

    expect(selectedTab(view).text()).toBe('Hard')
    const panel = view.find('[role="tabpanel"]').text()
    expect(panel).toMatch(/Played\s*3/)
    expect(panel).toMatch(/Solved\s*2/)
    expect(panel).toMatch(/Abandoned\s*1/)
    expect(panel).toMatch(/Solve rate\s*67%/)
  })

  it('says so on a difficulty with no games yet', async () => {
    seedResult('easy', 'completed')
    const view = mountView('easy')

    await view.findAll('[role="tab"]').find((t) => t.text() === 'Master')!.trigger('click')
    expect(view.find('[role="tabpanel"]').text()).toBe('No Master games yet.')
  })

  it('moves between tabs with the arrow keys, wrapping round, and Home and End', async () => {
    const view = mountView('easy')
    const press = async (key: string) => {
      await selectedTab(view).trigger('keydown', { key })
      await view.vm.$nextTick()
    }

    await press('ArrowLeft')
    expect(selectedTab(view).text()).toBe('Master')
    expect(document.activeElement).toBe(selectedTab(view).element)
    await press('ArrowRight')
    expect(selectedTab(view).text()).toBe('Easy')
    await press('End')
    expect(selectedTab(view).text()).toBe('Master')
    await press('Home')
    expect(selectedTab(view).text()).toBe('Easy')
  })

  it('emits back when Back is pressed', async () => {
    const view = mountView('easy')
    await view.findAll('button').find((b) => b.text() === 'Back')!.trigger('click')
    expect(view.emitted('back')).toHaveLength(1)
  })
})
