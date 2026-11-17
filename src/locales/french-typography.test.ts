import { describe, expect, it } from 'vitest'
import { fr } from './fr'
import { frLessons } from './lessons-fr'

/**
 * French sets `:`, `;`, `?` and `!` off from the word before with one no-break space (U+00A0, or
 * the narrower U+202F), and `:` from the word after with a plain space. The test reads the runtime
 * strings, not the source text, so it skips `'one' ? 'erreur' : 'erreurs'` and doesn't care
 * whether a no-break space was typed as itself or as an escape.
 */

/** Every string under `value`, calling each function with sample arguments (both plural forms, and words). */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (typeof value === 'function') {
    const samples: unknown[][] = [[1, 1, 1], [2, 2, 2], ['a', 'b', 'c']]
    return samples.flatMap((args) => strings(value(...args)))
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

/** What is wrong with the spacing around the high punctuation in `text`, one message per fault. */
function faults(text: string): string[] {
  const found: string[] = []
  for (const match of text.matchAll(/[:;?!]/g)) {
    const at = match.index
    const before = text.slice(0, at)
    if (!/[^\s  ][  ]$/.test(before)) found.push(`needs one no-break space before "${match[0]}" at ${at}`)
    if (match[0] === ':' && !/^(?:$| )/.test(text.slice(at + 1))) found.push(`needs a space after ":" at ${at}`)
  }
  return found.map((fault) => `${fault}: ${JSON.stringify(text)}`)
}

describe('faults', () => {
  it('accepts a no-break space before, and a space after a colon', () => {
    expect(faults('Erreurs : 3')).toEqual([])
    expect(faults('Résolue !')).toEqual([])
    expect(faults('Une partie :')).toEqual([])
  })

  it('rejects a plain space or none before', () => {
    expect(faults('Erreurs : 3')).toHaveLength(1)
    expect(faults('Erreurs: 3')).toHaveLength(1)
    expect(faults('Quoi ?')).toHaveLength(1)
  })

  it('rejects two spaces before', () => {
    expect(faults('Erreurs  : 3')).toHaveLength(1)
  })

  it('rejects no space after a colon', () => {
    expect(faults('à la fois :si')).toHaveLength(1)
  })
})

describe('French strings', () => {
  it('space their high punctuation', () => {
    expect(strings(fr).flatMap(faults)).toEqual([])
  })

  it('are found by the walk', () => {
    expect(strings(fr).length).toBeGreaterThan(100)
    expect(strings(frLessons).length).toBeGreaterThan(100)
  })

  it('in the lessons space their high punctuation', () => {
    expect(strings(frLessons).flatMap(faults)).toEqual([])
  })
})
