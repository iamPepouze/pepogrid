<script setup lang="ts">
/**
 * Settings → Paste transfer code (new address only): reads the clipboard, says what the transfer code holds,
 * and brings it over on the player's word. One AppDialog whose content follows the step the player is at.
 * It emits `close` with whether the language changed, so the opener can reload into it once the player has read the result.
 */
import { computed, nextTick, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { bringOver, pasteTransferCode, summaryOf, type PasteFailure } from '../composables/useTransfer'
import { resolveLanguage } from '../lib/language'
import type { TransferSnapshot } from '../lib/transfer'
import { LANGUAGE_NAMES } from '../locales'
import type { GameResult } from '../stores/results'
import AppDialog from './AppDialog.vue'

const emit = defineEmits<{ close: [languageChanged: boolean] }>()

const { t } = useI18n()
const m = computed(() => t.value.transfer.paste)

type Step =
  | { kind: 'ready' }
  | { kind: 'reading' }
  | { kind: 'summary'; snapshot: TransferSnapshot<GameResult> }
  | { kind: 'done'; results: number; difficulty: string | null; languageChanged: boolean }
  | { kind: 'error'; failure: PasteFailure }

const step = ref<Step>({ kind: 'ready' })
const dialog = ref<InstanceType<typeof AppDialog> | null>(null)

const difficultyName = (difficulty: string | null) => (difficulty ? t.value.difficulty[difficulty as keyof typeof t.value.difficulty] : null)
/** The settings a code carries, named as the Settings menu names them. */
const settingsText = (settings: Record<string, unknown>) => {
  const language = settings.language === 'system' ? t.value.settings.system(LANGUAGE_NAMES[resolveLanguage(navigator.languages, 'system')]) : LANGUAGE_NAMES[settings.language as keyof typeof LANGUAGE_NAMES] ?? '?'
  const theme = { system: t.value.settings.themeSystem, light: t.value.settings.themeLight, dark: t.value.settings.themeDark }[settings.theme as 'system'] ?? '?'
  return m.value.settings(language, theme)
}

/** The summary of the snapshot being offered, null at every other step. */
const summary = computed(() => (step.value.kind === 'summary' ? summaryOf(step.value.snapshot) : null))

/** The dialog's own words and buttons for the current step. */
const content = computed(() => {
  const s = step.value
  const cancel = t.value.common.cancel
  if (s.kind === 'summary') return { title: m.value.summaryTitle, message: m.value.summaryIntro, confirmLabel: m.value.bringOver, cancelLabel: cancel }
  if (s.kind === 'done') return { title: m.value.doneTitle, message: m.value.done(s.results, s.difficulty), confirmLabel: t.value.common.ok }
  const message = s.kind === 'ready' ? m.value.ready : s.kind === 'reading' ? m.value.reading : m.value[s.failure === 'not-a-code' ? 'notCode' : s.failure === 'newer' ? 'newer' : 'unreadable']
  return { title: m.value.title, message, confirmLabel: m.value.paste, cancelLabel: cancel }
})

async function paste() {
  step.value = { kind: 'reading' }
  const read = await pasteTransferCode()
  step.value = read.snapshot ? { kind: 'summary', snapshot: read.snapshot } : { kind: 'error', failure: read.failure }
}

async function onClose(confirmed: boolean) {
  const s = step.value
  if (s.kind === 'reading') return
  if (s.kind === 'done') return emit('close', s.languageChanged)
  if (!confirmed) return emit('close', false)
  if (s.kind === 'summary') {
    const done = { results: s.snapshot.results.length, difficulty: difficultyName(summaryOf(s.snapshot).gameDifficulty) }
    step.value = { kind: 'done', ...done, languageChanged: bringOver(s.snapshot) }
    // The Cancel button is gone, and focus with it.
    await nextTick()
    dialog.value?.focusPrimary()
  } else {
    await paste()
  }
}
</script>

<template>
  <AppDialog ref="dialog" v-bind="content" live @close="onClose">
    <div v-if="summary" class="summary">
      <ul>
        <li>{{ m.results(summary.results) }}</li>
        <li>{{ m.game(difficultyName(summary.gameDifficulty)) }}</li>
        <li>{{ settingsText(summary.settings) }}</li>
      </ul>
      <p v-if="summary.abandonedDifficulty" class="warning">{{ m.abandonWarning(difficultyName(summary.abandonedDifficulty)!) }}</p>
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
