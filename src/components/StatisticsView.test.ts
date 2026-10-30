// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Difficulty } from '../lib/difficulty'
import { useSettingsStore } from '../stores/settings'
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

  /** The text of the panel's section headed `heading`, one space between its pieces of text. */
  function section(view: ReturnType<typeof mountView>, heading: string) {
    const body = view.findAll('[role="tabpanel"] h3').find((h) => h.text() === heading)?.element.nextElementSibling
    if (!body) return undefined
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
    const texts: string[] = []
    while (walker.nextNode()) texts.push(walker.currentNode.textContent!.replaceAll('\u00ad', '').trim())
    return texts.filter(Boolean).join(' ')
  }

  it('shows the selected difficulty’s times, mistakes, streaks, ratings, families and recent games', () => {
    seedResult('hard', 'completed', { endedAt: '2026-10-01T10:00:00Z', elapsed: 300, mistakes: 2, se: 3.0, hodokuScore: 300, hardest: 'Pointing', nextStepsShown: 2 })
    seedResult('hard', 'abandoned', { endedAt: '2026-10-02T10:00:00Z', elapsed: 120, mistakes: 1, se: 3.5, hodokuScore: 900, progress: 46, hardest: 'Naked Pair' })
    seedResult('hard', 'completed', { endedAt: '2026-10-03T10:00:00Z', elapsed: 4000, mistakes: 0, se: 4.0, hodokuScore: 500, hardest: 'Naked Pair', keyTechniqueRevealed: true, nextStepsShown: 1 })
    seedResult('easy', 'completed', { elapsed: 10 })
    const view = mountView('hard')

    expect(section(view, 'Solved games')).toBe('Best time 05:00 Average time 35:50 Average mistakes 1.0 Flawless 1 Key technique revealed 1 Next step used 2')
    expect(section(view, 'Streaks')).toBe('Current 1 Best 1')
    expect(section(view, 'Ratings')).toBe('SE 3.5 3.0–4.0 HoDoKu 400 300–500')
    expect(view.find('[role="tabpanel"]').text()).toContain('Abandoned at 46% on average')
    expect(section(view, 'Technique families')).toBe('Subsets 1/2 1 revealed the key technique 1 used the next step Intersections 1/1 1 used the next step')

    const recent = view.findAll('.recent li').map((li) => li.text().replace(/\s+/g, ' '))
    expect(recent).toHaveLength(3)
    expect(recent[0]).toMatch(/ · Solved · 1:06:40 · 0 mistakes · SE 4\.0$/)
    expect(recent[1]).toMatch(/ · Abandoned at 46% · 02:00 · 1 mistake · SE 3\.5$/)
    expect(recent[2]).toMatch(/ · Solved · 05:00 · 2 mistakes · SE 3\.0$/)
  })

  it('shows a dash for figures that need a solved game, and leaves out what doesn’t apply', async () => {
    seedResult('master', 'abandoned')
    seedResult('easy', 'completed')
    const view = mountView('master')

    expect(section(view, 'Solved games')).toBe('Best time — Average time — Average mistakes — Flawless — Key technique revealed — Next step used —')
    expect(section(view, 'Ratings')).toBe('SE — HoDoKu —')

    await view.findAll('[role="tab"]').find((t) => t.text() === 'Easy')!.trigger('click')
    const panel = view.find('[role="tabpanel"]').text()
    expect(panel).not.toContain('Technique families')
    expect(panel).not.toContain('on average')
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

  it('says the figures cover only the latest 1000 games once that many are stored', async () => {
    for (let i = 0; i < 999; i++) seedResult('easy', 'completed')
    const view = mountView('easy')
    expect(view.find('.summary').text()).not.toContain('latest')

    seedResult('hard', 'abandoned')
    await view.vm.$nextTick()
    expect(view.find('.summary').text()).toContain('Based on your latest 1000 games.')
  })

  it('disables Reset statistics with nothing to clear, and otherwise emits reset with the button pressed', async () => {
    const view = mountView('easy')
    const reset = () => view.findAll<HTMLButtonElement>('button').find((b) => b.text() === 'Reset statistics')!
    expect(reset().element.disabled).toBe(true)

    seedResult('medium', 'abandoned')
    await view.vm.$nextTick()
    expect(reset().element.disabled).toBe(false)
    await reset().trigger('click')
    expect(view.emitted('reset')).toEqual([[reset().element]])
  })

  describe('in French and German', () => {
    const seedMixed = () => {
      seedResult('hard', 'completed', { endedAt: '2026-10-01T10:00:00Z', elapsed: 300, mistakes: 2, se: 3.0, hodokuScore: 300, hardest: 'Pointing', nextStepsShown: 2, keyTechniqueRevealed: true })
      seedResult('hard', 'completed', { endedAt: '2026-10-02T10:00:00Z', mistakes: 1, se: 4.2, hardest: 'Naked Pair' })
      seedResult('hard', 'abandoned', { endedAt: '2026-10-03T10:00:00Z', mistakes: 0, se: 3.5, progress: 46, hardest: 'Naked Pair' })
      seedResult('hard', 'abandoned', { endedAt: '2026-10-04T10:00:00Z', progress: 10, hardest: 'Naked Pair' })
      seedResult('hard', 'completed', { endedAt: '2026-10-05T10:00:00Z', mistakes: 1, se: 3.5, hardest: 'Naked Pair' })
      seedResult('hard', 'completed', { endedAt: '2026-10-06T10:00:00Z', mistakes: 1, se: 3.5, hardest: 'Naked Pair' })
    }

    it('writes decimals with a comma and the solve rate as a French player does', () => {
      useSettingsStore().language = 'fr'
      seedMixed()
      const view = mountView('hard')

      expect(view.find('.summary').text()).toMatch(/Taux de réussite\s*67[\u00a0\u202f]%/)
      expect(section(view, 'Parties résolues')).toContain('Erreurs en moyenne 1,3')
      expect(section(view, 'Évaluations')).toBe('Note SE 3,6 3,0–4,2 Score HoDoKu 225 200–300')
      expect(view.find('[role="tabpanel"]').text()).toMatch(/Abandonnées à 28[\u00a0\u202f]% en moyenne/)
    })

    it('words the labels, tabs and technique families in French, and the dates in French', () => {
      useSettingsStore().language = 'fr'
      seedMixed()
      const view = mountView('hard')

      expect(view.find('h2').text()).toBe('Statistiques')
      expect(view.findAll('[role="tab"]').map((t) => t.text())).toEqual(['Facile', 'Moyen', 'Difficile', 'Expert', 'Maître'])
      expect(section(view, 'Familles de techniques')).toBe('Sous-ensembles 3/5 Intersections 1/1 1 a révélé la technique clé 1 a utilisé la prochaine étape')
      expect(view.findAll('.recent li')[0].text()).toMatch(/^\d+ oct\.?,? .* · Résolue · .* · 1 erreur · SE 3,5$/)
      expect(view.findAll('button').map((b) => b.text())).toContain('Réinitialiser les statistiques')
    })

    it('words the labels and families in German, and the dates in German', () => {
      useSettingsStore().language = 'de'
      seedMixed()
      const view = mountView('hard')

      expect(view.find('.summary').text()).toMatch(/Lösungsquote\s*67[\u00a0\u202f]%/)
      expect(section(view, 'Technikfamilien')).toBe('Teilmengen 3/5 Schnittmengen 1/1 1 hat die Schlüsseltechnik aufgedeckt 1 hat den nächsten Schritt genutzt')
      expect(view.findAll('.recent li')[0].text()).toMatch(/^\d+\. Okt\.?,? .* · Gelöst · .* · 1 Fehler · SE 3,5$/)
      expect(view.findAll('button').map((b) => b.text())).toContain('Zurück')
    })

    it('shows a dash in French for what needs a solved game, and says "no games" in French', async () => {
      useSettingsStore().language = 'fr'
      seedResult('master', 'abandoned')
      const view = mountView('master')

      expect(section(view, 'Parties résolues')).toBe('Meilleur temps — Temps moyen — Erreurs en moyenne — Sans faute — Technique clé révélée — Prochaine étape utilisée —')
      await view.findAll('[role="tab"]').find((t) => t.text() === 'Facile')!.trigger('click')
      expect(view.find('[role="tabpanel"]').text()).toBe('Aucune partie en Facile pour l’instant.')
    })
  })

  it('emits back when Back is pressed', async () => {
    const view = mountView('easy')
    await view.findAll('button').find((b) => b.text() === 'Back')!.trigger('click')
    expect(view.emitted('back')).toHaveLength(1)
  })
})
