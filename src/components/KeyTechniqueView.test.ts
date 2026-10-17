// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import KeyTechniqueView from './KeyTechniqueView.vue'

enableAutoUnmount(afterEach)

describe('KeyTechniqueView', () => {
  const mountView = (technique: string) => mount(KeyTechniqueView, { props: { technique } })
  const button = (view: ReturnType<typeof mountView>, label: string) => view.findAll<HTMLButtonElement>('button').find((b) => b.text() === label)!
  /** The lesson grid's cell at a 1-based row and column. */
  const cell = (view: ReturnType<typeof mountView>, row: number, col: number) => view.findAll('.lesson-grid .cell')[(row - 1) * 9 + col - 1]

  it('names the technique and opens its family’s lesson at its section', () => {
    const view = mountView('Hidden Single')
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

  it('says a lesson is coming for a technique without one', () => {
    const view = mountView('Forcing Chain')
    expect(view.find('.technique').text()).toBe('Forcing Chain')
    expect(view.text()).toContain('A lesson on this technique is coming.')
    expect(view.find('.lesson-grid').exists()).toBe(false)
  })
})
