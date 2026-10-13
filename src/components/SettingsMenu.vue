<script setup lang="ts">
import { Monitor, Moon, Settings, Sun } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { THEME_MODES, useSettingsStore, type ThemeMode } from '../stores/settings'

const settings = useSettingsStore()

const LABELS: Record<ThemeMode, string> = { system: 'System', light: 'Light', dark: 'Dark' }
const ICONS = { system: Monitor, light: Sun, dark: Moon }

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function close(returnFocus = false) {
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function onDocumentPointerDown(e: PointerEvent) {
  if (open.value && !root.value?.contains(e.target as Node)) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation()
    close(true)
  }
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <!-- data-own-keys: the game's global shortcuts leave keys inside this menu alone. -->
  <div ref="root" class="settings" data-own-keys @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="trigger"
      aria-label="Settings"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Settings class="icon" aria-hidden="true" />
    </button>

    <div v-if="open" class="popover" role="dialog" aria-label="Settings">
      <fieldset>
        <legend>Theme</legend>
        <label v-for="m in THEME_MODES" :key="m" class="option" :class="{ checked: settings.theme === m }">
          <input v-model="settings.theme" type="radio" name="theme" :value="m" />
          <component :is="ICONS[m]" class="icon" aria-hidden="true" />
          <span>{{ LABELS[m] }}</span>
        </label>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.settings {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  cursor: pointer;
}

.trigger[aria-expanded='true'] {
  border-color: var(--accent);
  color: var(--accent);
}

.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 10;
  min-width: 170px;
  padding: 10px;
  border: 1px solid var(--button-border);
  border-radius: 12px;
  background: var(--button-bg);
  box-shadow: var(--shadow);
}

fieldset {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 6px;
  padding: 0 4px;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
}

.option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option.checked {
  background: var(--accent);
  color: var(--on-accent);
}

.option:has(input:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .option:hover:not(.checked) {
    background: var(--peer);
  }
}
</style>
