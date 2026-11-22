// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'
import { bit } from '../lib/grid'
import type { LessonCell } from '../lib/lessons'
import LessonGrid from './LessonGrid.vue'

const cell = (over: Partial<LessonCell> = {}): LessonCell => ({
  digit: 0,
  placed: false,
  candidates: 0,
  marked: 0,
  struck: 0,
  faded: false,
  highlighted: false,
  ...over,
})

enableAutoUnmount(afterEach)

describe('LessonGrid', () => {
  it('marks only the candidates the step points at', () => {
    const cells = Array.from({ length: 81 }, () => cell())
    cells[0] = cell({ candidates: bit(3) | bit(7), marked: bit(7) })
    const grid = mount(LessonGrid, { props: { cells }, global: { plugins: [createPinia()] } })

    expect(grid.findAll('.cell')[0].findAll('.note-match').map((n) => n.text())).toEqual(['7'])
  })
})
