/**
 * Vitest setup: seeds Math.random for every test, so a random puzzle pick or transform can be
 * replayed. Each test gets a fresh seed, or TEST_SEED when set; a failure's error ends with the seed.
 */
import { beforeEach, vi } from 'vitest'

/** mulberry32: a small, fast seeded PRNG returning floats in [0, 1). */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const unseeded = Math.random

beforeEach(({ onTestFailed }) => {
  const fixed = import.meta.env.TEST_SEED
  const seed = fixed ? Number(fixed) : Math.floor(unseeded() * 2 ** 32)
  const random = vi.spyOn(Math, 'random').mockImplementation(mulberry32(seed))
  // In the error itself, so output filtered down to the failures still carries the seed.
  onTestFailed(({ task }) => {
    for (const error of task.result?.errors ?? []) error.message += `\nReplay this test with TEST_SEED=${seed}`
  })
  // Only this spy: a test file's own spies keep their lifetime.
  return () => random.mockRestore()
})
