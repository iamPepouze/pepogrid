<script setup lang="ts">
/**
 * Settings → Paste transfer code (new address only): reads the clipboard, says what the transfer code holds,
 * and brings it over on the player's word. One AppDialog whose content follows the step the player is at.
 * It emits `close` with whether the language changed, so the opener can reload into it once the player has read the result.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { bringOver, pasteTransferCode, summaryOf, type BroughtOver, type PasteFailure } from '../composables/useTransfer'
import { resolveLanguage } from '../lib/language'
import type { TransferSnapshot } from '../lib/transfer'
import { LANGUAGE_NAMES } from '../locales'
import type { GameResult } from '../stores/results'
import type { Preferences } from '../stores/settings'
import AppDialog from './AppDialog.vue'

const emit = defineEmits<{ close: [languageChanged: boolean] }>()

const { t } = useI18n()
const paste = computed(() => t.value.transfer.paste)

type Step =
  | { kind: 'ready' }
  | { kind: 'reading' }
  | { kind: 'summary'; snapshot: TransferSnapshot<GameResult> }
  | ({ kind: 'done' } & BroughtOver)
  | { kind: 'error'; failure: PasteFailure }

/**
 * How long after a step changes a press of its confirm button is ignored. The button stays the same element across
 * steps, so the second tap of a double tap would otherwise answer the next step unread (Bring over, then OK).
 */
const STEP_GUARD_MS = 400

const step = ref<Step>({ kind: 'ready' })
/** When `step` last changed, for STEP_GUARD_MS. */
let steppedAt = -Infinity

/** True once the dialog has asked to close, so a clipboard read still under way doesn't carry on. */
let closed = false

function close(languageChanged: boolean) {
  closed = true
  emit('close', languageChanged)
}

function goTo(next: Step) {
  step.value = next
  steppedAt = performance.now()
}
const dialog = ref<InstanceType<typeof AppDialog> | null>(null)

const FAILURE_MESSAGES = { 'not-a-code': 'notCode', newer: 'newer', unreadable: 'unreadable' } as const

/** The settings a code carries, named as the Settings menu names them. */
function settingsText({ language, theme, highlightMatching }: Preferences) {
  const languageName = language === 'system' ? t.value.settings.system(LANGUAGE_NAMES[resolveLanguage(navigator.languages, 'system')]) : LANGUAGE_NAMES[language]
  const themeName = { system: t.value.settings.themeSystem, light: t.value.settings.themeLight, dark: t.value.settings.themeDark }[theme]
  return paste.value.settings(languageName, themeName, highlightMatching)
}

/** The summary of the snapshot being offered, null at every other step. */
const summary = computed(() => (step.value.kind === 'summary' ? summaryOf(step.value.snapshot) : null))

/** The dialog's own words and buttons for the current step. */
const content = computed(() => {
  const s = step.value
  const cancel = t.value.common.cancel
  if (s.kind === 'summary') return { title: paste.value.summaryTitle, message: paste.value.summaryIntro, confirmLabel: paste.value.bringOver, cancelLabel: cancel }
  if (s.kind === 'done') {
    const difficulty = s.gameDifficulty && t.value.difficulty[s.gameDifficulty]
    return { title: paste.value.doneTitle, message: paste.value.done(s.newResults, difficulty), confirmLabel: t.value.common.ok }
  }
  const message = s.kind === 'ready' ? paste.value.ready : s.kind === 'reading' ? paste.value.reading : paste.value[FAILURE_MESSAGES[s.failure]]
  return { title: paste.value.title, message, confirmLabel: paste.value.paste, cancelLabel: cancel, busy: s.kind === 'reading' }
})

/** Reads the clipboard, then puts focus where the next move is: Cancel on the summary, so a second Enter can't bring it over unread; Paste after an error. */
async function read() {
  goTo({ kind: 'reading' })
  const result = await pasteTransferCode()
  // Cancelled while the clipboard was read: the dialog is gone.
  if (closed) return
  goTo(result.snapshot ? { kind: 'summary', snapshot: result.snapshot } : { kind: 'error', failure: result.failure })
  await nextTick()
  if (result.snapshot) dialog.value?.focusPrimary()
  else dialog.value?.focusConfirm()
}

async function onClose(confirmed: boolean) {
  const s = step.value
  if (confirmed && (s.kind === 'reading' || performance.now() - steppedAt < STEP_GUARD_MS)) return
  if (s.kind === 'done') return close(s.languageChanged)
  if (!confirmed) return close(false)
  if (s.kind === 'summary') {
    goTo({ kind: 'done', ...bringOver(s.snapshot) })
    // The Cancel button is gone, and focus with it.
    await nextTick()
    dialog.value?.focusPrimary()
  } else {
    await read()
  }
}
</script>

<template>
  <AppDialog ref="dialog" v-bind="content" live @close="onClose">
    <!-- Always present, so a screen reader announces the summary when it fills in. -->
    <div class="summary" role="status">
      <template v-if="summary">
        <ul>
          <li>{{ paste.results(summary.results) }}</li>
          <li>{{ paste.game(summary.gameDifficulty && t.difficulty[summary.gameDifficulty]) }}</li>
          <li>{{ settingsText(summary.settings) }}</li>
        </ul>
        <p v-if="summary.abandonedDifficulty" class="warning">{{ paste.abandonWarning(t.difficulty[summary.abandonedDifficulty]) }}</p>
      </template>
    </div>
  </AppDialog>
</template>

<style scoped>
.summary ul {
  margin: 0 0 12px;
  padding-left: 20px;
  color: var(--text);
}

.warning {
  margin: 0 0 16px;
  color: var(--text);
  font-weight: 600;
}
</style>
