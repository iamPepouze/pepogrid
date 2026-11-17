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

defineExpose({
  /** Focuses Copy, where the player lands when the move screen replaces the game. */
  focusCopy: () => copyButton.value?.focus(),
})

/** What the Copy button last did, shown beside it and announced. */
const copy = ref<'idle' | 'copied' | 'failed'>('idle')

async function onCopy() {
  copy.value = (await copyTransferCode()) ? 'copied' : 'failed'
}
</script>

<template>
  <section class="move view" aria-labelledby="move-title">
    <h2 id="move-title">{{ t.transfer.move.title }}</h2>
    <ol>
      <li>
        <button ref="copyButton" type="button" class="copy" @click="onCopy">{{ t.transfer.move.copy }}</button>
        <!-- Present from the start, so the message is announced when it fills in. -->
        <span class="status" :class="{ failed: copy === 'failed' }" role="status">
          {{ copy === 'copied' ? t.transfer.move.copied : copy === 'failed' ? t.transfer.move.copyFailed : '' }}
        </span>
      </li>
      <li>
        {{ t.transfer.move.openBefore }} <a :href="`https://${NEW_ADDRESS}`" target="_blank" rel="noopener"><strong>{{ NEW_ADDRESS }}</strong></a>.
        {{ t.transfer.move.openAfter }}
      </li>
      <li>{{ t.transfer.move.pasteStep }}</li>
    </ol>
    <button type="button" class="statistics surface" @click="$emit('statistics')">
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
  margin-top: 8px;
  color: var(--muted);
}

.status:empty {
  display: none;
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
