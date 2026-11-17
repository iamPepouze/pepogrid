<script setup lang="ts">
/**
 * The old address's move screen (spec #112): stands in for the game when none is in progress, explains the move
 * in three steps and copies the transfer code. There is no way past it, only to Statistics (read-only) and back.
 */
import { ChartColumn } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { copyTransferCode } from '../composables/useTransfer'

defineEmits<{ statistics: [] }>()

const NEW_ADDRESS = 'pepogrid.adrienmg.eu'

const { t } = useI18n()
const copyButton = ref<HTMLButtonElement | null>(null)
const statisticsButton = ref<HTMLButtonElement | null>(null)

defineExpose({
  /** Focuses Copy, where the player lands when the move screen replaces the game. */
  focusCopy: () => copyButton.value?.focus(),
  /** Focuses Statistics, for Back from the Statistics it opened. */
  focusStatistics: () => statisticsButton.value?.focus(),
})

/** What the last copy did, shown beside the button and announced; `copying` while the code is being made. */
const copyState = ref<'idle' | 'copying' | 'copied' | 'failed'>('idle')

async function onCopy() {
  if (copyState.value === 'copying') return
  // Emptied first, so a second identical outcome is a change a screen reader announces again.
  copyState.value = 'copying'
  copyState.value = (await copyTransferCode()) ? 'copied' : 'failed'
}
</script>

<template>
  <section class="move view" aria-labelledby="move-title">
    <h2 id="move-title">{{ t.transfer.move.title }}</h2>
    <ol>
      <li>
        <button ref="copyButton" type="button" class="copy" @click="onCopy">{{ t.transfer.move.copy }}</button>
        <!-- Rendered from the start, and never hidden, so the message is announced when it fills in. -->
        <span class="status" :class="{ failed: copyState === 'failed' }" role="status">{{
          copyState === 'copied' ? t.transfer.move.copied : copyState === 'failed' ? t.transfer.move.copyFailed : ''
        }}</span>
      </li>
      <li>
        {{ t.transfer.move.openBefore }} <a :href="`https://${NEW_ADDRESS}`" target="_blank" rel="noopener"><strong>{{ NEW_ADDRESS }}</strong></a>.
        {{ t.transfer.move.openAfter }}
      </li>
      <li>{{ t.transfer.move.pasteStep }}</li>
    </ol>
    <button ref="statisticsButton" type="button" class="statistics surface" @click="$emit('statistics')">
      <ChartColumn aria-hidden="true" />
      <span>{{ t.app.statistics }}</span>
    </button>
  </section>
</template>

<style scoped>
.move {
  gap: 16px;
}

h2 {
  margin: 0;
  font-size: 1.3rem;
}

ol {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  /* In em, so the numbers keep their room at large text. */
  padding-left: 1.8em;
}

li {
  overflow-wrap: break-word;
}

a {
  color: var(--accent-text);
}

.copy {
  max-width: 100%;
  min-height: 44px;
  padding: 8px 16px;
  /* At large text, a long word such as a German one breaks rather than spilling out of the screen. */
  overflow-wrap: anywhere;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.copy:focus-visible,
.statistics:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.status {
  display: block;
  color: var(--muted);
}

/* Only the space, not the region, goes while empty: a hidden live region may not be announced when it fills in. */
.status:not(:empty) {
  margin-top: 8px;
}

.status.failed {
  color: var(--text);
  font-weight: 600;
}

.statistics {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  padding: 0 14px;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.statistics svg {
  width: 18px;
  height: 18px;
}
</style>
