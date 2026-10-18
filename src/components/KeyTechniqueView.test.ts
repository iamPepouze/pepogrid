// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { NextTechnique } from '../lib/rater'
import KeyTechniqueView, { type KeyTechniqueTab } from './KeyTechniqueView.vue'

enableAutoUnmount(afterEach)

describe('KeyTechniqueView', () => {
  /** The view on its Hardest tab, for `hardest`, unless `fields` say otherwise. */
  const mountView = (hardest: string, fields: { tab?: KeyTechniqueTab; nextStep?: NextTechnique } = {}) =>
    mount(KeyTechniqueView, { props: { tab: 'hardest', nextStep: { kind: 'technique', technique: 'Hidden Single' }, hardest, ...fields }, attachTo: document.body })
  const tabs = (view: ReturnType<typeof mountView>) => view.findAll<HTMLButtonElement>('[role="tab"]')
  const button = (view: ReturnType<typeof mountView>, label: string) => view.findAll<HTMLButtonElement>('button').find((b) => b.text() === label)!
  /** The lesson grid's cell at a 1-based row and column. */
  const cell = (view: ReturnType<typeof mountView>, row: number, col: number) => view.findAll('.lesson-grid .cell')[(row - 1) * 9 + col - 1]

  it('shows Next step and Hardest as tabs, with the one shown selected', () => {
    const view = mountView('XY-Wing', { tab: 'next' })
    expect(view.find('[role="tablist"]').exists()).toBe(true)
    expect(tabs(view).map((t) => [t.text(), t.attributes('aria-selected')])).toEqual([['Next step', 'true'], ['Hardest', 'false']])
    const panel = view.find('[role="tabpanel"]')
    expect(panel.attributes('aria-labelledby')).toBe(tabs(view)[0].attributes('id'))
    expect(tabs(view)[0].attributes('aria-controls')).toBe(panel.attributes('id'))
  })

  it('names the next technique on Next step and opens its family’s lesson at its section', () => {
    const view = mountView('XY-Wing', { tab: 'next', nextStep: { kind: 'technique', technique: 'Naked Triplet' } })
    expect(view.find('.lead').text()).toBe('Your next step needs')
    expect(view.find('.technique').text()).toBe('Naked Triplet')
    expect(view.find('h3').text()).toBe('Naked Triplet')
    expect(view.findAll('details').map((d) => d.find('summary').text())).toContain('Naked Pair')
    expect(view.text()).not.toContain('XY-Wing')
  })

  it('says when the next step needs a technique beyond XY-Wing', () => {
    const view = mountView('Unique Rectangle type 1', { tab: 'next', nextStep: { kind: 'beyond' } })
    expect(view.find('[role="tabpanel"]').text()).toBe('Your next step needs a technique beyond XY-Wing')
    expect(view.find('.lesson-grid').exists()).toBe(false)
  })

  it('says the grid has a mistake, with no technique and no lesson', () => {
    const view = mountView('XY-Wing', { tab: 'next', nextStep: { kind: 'mistake' } })
    expect(view.findAll('[role="tabpanel"] p').map((p) => p.text())).toEqual([
      'Your grid has a mistake',
      'Check your digits and notes: something there rules out the solution.',
    ])
    expect(view.find('.technique').exists()).toBe(false)
    expect(view.find('.lesson-grid').exists()).toBe(false)
    expect(view.text()).not.toContain('XY-Wing')
  })

  it('asks for the tab the player chooses, leaving the choice to its parent', async () => {
    const view = mountView('XY-Wing', { tab: 'next' })
    await tabs(view)[1].trigger('click')
    await tabs(view)[0].trigger('click')
    expect(view.emitted('select')).toEqual([['hardest'], ['next']])
    expect(tabs(view)[0].attributes('aria-selected')).toBe('true')
  })

  it('moves focus between the tabs with the arrow keys, without choosing one', async () => {
    const view = mountView('XY-Wing', { tab: 'next' })
    expect(tabs(view).map((t) => t.attributes('tabindex'))).toEqual(['0', '-1'])
    tabs(view)[0].element.focus()
    await tabs(view)[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs(view)[1].element)
    await tabs(view)[1].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs(view)[0].element)
    await tabs(view)[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tabs(view)[1].element)
    expect(view.emitted('select')).toBeUndefined()
  })

  it('names the hardest technique on Hardest and opens its family’s lesson at its section', () => {
    const view = mountView('Hidden Single')
    expect(view.find('.lead').text()).toBe('This puzzle’s hardest technique is')
    expect(view.find('.technique').text()).toBe('Hidden Single')
    expect(view.find('h3').text()).toBe('Hidden Single')
    expect(view.text()).toContain('A single is a digit with only one place left to go.')
  })

  it('steps through the example with Previous and Next, which stop at either end', async () => {
    const view = mountView('Hidden Single')
    const counter = () => view.find('.counter').text()
    expect(counter()).toBe('Step 1 of 4')
    expect(button(view, 'Previous').element.disabled).toBe(true)
    expect(view.find('.caption').text()).toContain('The top-middle box still needs a 3.')

    for (let n = 2; n <= 4; n++) await button(view, 'Next').trigger('click')
    expect(counter()).toBe('Step 4 of 4')
    expect(button(view, 'Next').element.disabled).toBe(true)
    expect(view.find('.caption').text()).toContain('That’s a hidden single.')

    await button(view, 'Previous').trigger('click')
    expect(counter()).toBe('Step 3 of 4')
    expect(button(view, 'Next').element.disabled).toBe(false)
  })

  it('announces each step’s caption and counter', () => {
    const view = mountView('Hidden Single')
    expect(view.find('.caption').attributes('aria-live')).toBe('polite')
    expect(view.find('.counter').attributes('aria-live')).toBe('polite')
  })

  it('fades the cells outside the step and labels what each cell shows', async () => {
    const view = mountView('Hidden Single')
    expect(cell(view, 9, 9).classes()).toContain('faded')
    expect(cell(view, 9, 9).attributes('aria-label')).toBe('Row 9, column 9: candidates 1 3 8 9, faded')
    expect(cell(view, 1, 4).classes()).not.toContain('faded')
    expect(cell(view, 1, 4).attributes('aria-label')).toBe('Row 1, column 4: 2')

    await button(view, 'Next').trigger('click')
    expect(cell(view, 1, 1).classes()).toContain('highlighted')
    expect(cell(view, 1, 1).attributes('aria-label')).toBe('Row 1, column 1: 3, highlighted')
  })

  it('places the digit on the last step', async () => {
    const view = mountView('Hidden Single')
    for (let n = 2; n <= 4; n++) await button(view, 'Next').trigger('click')
    expect(cell(view, 2, 4).classes()).toContain('placed')
    expect(cell(view, 2, 4).attributes('aria-label')).toBe('Row 2, column 4: 3, placed, highlighted')
  })

  it('opens the technique’s section first and keeps the family’s other sections collapsed below it', () => {
    const view = mountView('Direct Hidden Triplet')
    expect(view.find('h3').text()).toBe('Direct Hidden Triplet')
    const others = view.findAll('details')
    expect(others.map((d) => d.find('summary').text())).toEqual(['Direct Hidden Pair'])
    expect(others[0].attributes('open')).toBeUndefined()
    expect(others[0].text()).toContain('Look for two digits that have the same two cells')
    expect(others[0].find('.lesson-grid').exists()).toBe(true)
  })

  it('says a lesson is coming for a technique in no bank', () => {
    const view = mountView('Dynamic Forcing Chain')
    expect(view.find('.technique').text()).toBe('Dynamic Forcing Chain')
    expect(view.text()).toContain('A lesson on this technique is coming.')
    expect(view.find('.lesson-grid').exists()).toBe(false)
  })
})
