import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

/** True once a new version has downloaded and waits to take over. */
const waiting = ref(false)

const updateSW = registerSW({
  onNeedRefresh() {
    waiting.value = true
  },
  onRegisteredSW(_url, registration) {
    // Resuming the installed iOS app doesn't load the page, so only a check here finds a version
    // deployed since launch (docs/ios-installed-app.md).
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      registration?.update().catch(() => {
        // Offline, or the server is unreachable: the next resume or launch checks again.
      })
    })
  },
})

/**
 * Offers to load a new version as soon as it has downloaded, instead of on the next launch.
 * Left alone, the waiting version still takes over on the next launch.
 */
export function useUpdate() {
  /** Activates the waiting version and reloads; the saved game resumes as it was. */
  async function update() {
    // updateSW() asks the waiting worker to take over, but reloads only when control passes from
    // an old worker. A page no worker controls (a first visit) never sees that, so it reloads here,
    // and the new worker serves the reload.
    const controlled = Boolean(navigator.serviceWorker?.controller)
    await updateSW()
    if (!controlled) location.reload()
  }

  return { canUpdate: waiting, update }
}
