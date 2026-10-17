// @vitest-environment happy-dom
import type { RegisterSWOptions } from 'virtual:pwa-register'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/** The service worker registration, faked: `sw.options` holds what the composable passed in. */
const sw = vi.hoisted(() => ({ options: {} as RegisterSWOptions, update: vi.fn(async () => {}) }))
vi.mock('virtual:pwa-register', () => ({
  registerSW(options: RegisterSWOptions) {
    sw.options = options
    return sw.update
  },
}))

/** A fresh copy of the module, which registers the service worker once on import. */
async function load() {
  vi.resetModules()
  sw.update.mockClear()
  const { useUpdate } = await import('./useUpdate')
  return { ...useUpdate(), options: sw.options }
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

/** The worker controlling the page, or null on a first visit. */
function setController(controller: object | null) {
  Object.defineProperty(navigator, 'serviceWorker', { value: { controller }, configurable: true })
}

describe('useUpdate', () => {
  beforeEach(() => setVisibility('visible'))

  it('offers an update once a new version is waiting', async () => {
    const { canUpdate, options } = await load()
    expect(canUpdate.value).toBe(false)
    options.onNeedRefresh!()
    expect(canUpdate.value).toBe(true)
  })

  it('activates the waiting version when the player updates', async () => {
    setController({})
    const { update, options } = await load()
    options.onNeedRefresh!()
    await update()
    expect(sw.update).toHaveBeenCalledOnce()
  })

  it('reloads when no worker controls the page yet, since the page then loads from the network', async () => {
    setController(null)
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload })
    const { update, options } = await load()
    options.onNeedRefresh!()
    await update()
    expect(reload).toHaveBeenCalledOnce()
  })

  it('checks for a new version when the app comes back into view', async () => {
    const { options } = await load()
    const registration = { update: vi.fn(async () => {}) } as unknown as ServiceWorkerRegistration
    options.onRegisteredSW!('sw.js', registration)

    setVisibility('hidden')
    expect(registration.update).not.toHaveBeenCalled()
    setVisibility('visible')
    expect(registration.update).toHaveBeenCalledOnce()
  })

  it('ignores a failed check, such as one made offline', async () => {
    const { options } = await load()
    const registration = { update: vi.fn(async () => { throw new Error('offline') }) } as unknown as ServiceWorkerRegistration
    options.onRegisteredSW!('sw.js', registration)
    setVisibility('hidden')
    setVisibility('visible')
    await vi.waitFor(() => expect(registration.update).toHaveBeenCalledOnce())
  })
})
