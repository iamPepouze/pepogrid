<script setup lang="ts">
/**
 * Modal message in the app's own style, used instead of window.confirm and window.alert,
 * which iOS home-screen apps don't show reliably.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** What the dialog says. Without a cancelLabel it is a lone-button alert. */
export interface DialogContent {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
}

defineProps<DialogContent>()
const emit = defineEmits<{ close: [confirmed: boolean] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)

/** What had focus before the dialog opened, to hand focus back to. */
let opener: HTMLElement | null = null

onMounted(() => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value?.showModal()
  // Focus Cancel when there is one, so a stray Enter is harmless.
  ;(cancelButton.value ?? confirmButton.value)?.focus()
})

// The parent closes the dialog by unmounting it. Close it first: while modal, it leaves the opener inert and unfocusable.
onBeforeUnmount(() => {
  dialog.value?.close()
  opener?.focus()
})

/** A click on the dialog element itself, not its content, landed on the backdrop. */
function onClick(e: MouseEvent) {
  if (e.target === dialog.value) emit('close', false)
}

/** Escape: the parent closes the dialog by unmounting it, so keep the browser from closing it first. */
function onCancel(e: Event) {
  e.preventDefault()
  emit('close', false)
}
</script>

<template>
  <!-- data-own-keys: the game's global shortcuts leave keys inside this dialog alone. -->
  <dialog ref="dialog" class="dialog" aria-labelledby="dialog-title" data-own-keys @click="onClick" @cancel="onCancel">
    <div class="content">
      <h2 id="dialog-title">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button v-if="cancelLabel" type="button" ref="cancelButton" class="button" @click="emit('close', false)">
          {{ cancelLabel }}
        </button>
        <button type="button" ref="confirmButton" class="button primary" @click="emit('close', true)">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(340px, calc(100vw - 32px));
  padding: 0;
  border: 1px solid var(--button-border);
  border-radius: 14px;
  background: var(--button-bg);
  color: var(--text);
  box-shadow: var(--shadow);
}

@media (min-width: 768px) {
  .dialog {
    width: 400px;
  }
}

.dialog::backdrop {
  background: rgb(0 0 0 / 0.45);
}

.content {
  padding: 18px 18px 14px;
}

h2 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}

p {
  margin: 0 0 16px;
  color: var(--muted);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.button {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

@media (hover: hover) {
  .button:hover:not(.primary) {
    background: var(--peer);
  }
}
</style>
