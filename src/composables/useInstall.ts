import { computed, ref } from 'vue'

/** Chromium's install prompt event, not yet in the standard DOM typings. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferred = ref<BeforeInstallPromptEvent | null>(null)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred.value = e as BeforeInstallPromptEvent
})

window.addEventListener('appinstalled', () => {
  deferred.value = null
})

/** Offers the browser's install prompt where supported (Chromium browsers). */
export function useInstall() {
  const canInstall = computed(() => deferred.value !== null)

  async function install() {
    const event = deferred.value
    if (!event) return
    await event.prompt()
    await event.userChoice
    // The event can only be used once.
    deferred.value = null
  }

  return { canInstall, install }
}
