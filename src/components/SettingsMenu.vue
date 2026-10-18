<script setup lang="ts">
import { Monitor, Moon, Settings, Sun } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { THEME_MODES, useSettingsStore, type ThemeMode } from '../stores/settings'

const settings = useSettingsStore()

const LABELS: Record<ThemeMode, string> = { system: 'System', light: 'Light', dark: 'Dark' }
const ICONS = { system: Monitor, light: Sun, dark: Moon }
const LICENSE_URL = 'https://github.com/iamPepouze/pepogrid/blob/main/LICENSE'

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
      class="trigger icon-button"
      aria-label="Settings"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Settings aria-hidden="true" />
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
      <fieldset>
        <legend>Board</legend>
        <label class="switch-row">
          <span>Highlight matching numbers</span>
          <input v-model="settings.highlightMatching" type="checkbox" role="switch" class="switch" />
        </label>
      </fieldset>
      <p class="credit">
        © 2026 Pepouze ·
        <a :href="LICENSE_URL" target="_blank" rel="noopener">License</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* No positioning here: the popover anchors to the header (App.vue) so it stays on screen. */
.settings {
  display: contents;
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
  width: min(260px, 100%);
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

fieldset + fieldset {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--button-border);
}

.credit {
  margin: 10px 0 0;
  padding: 10px 4px 0;
  border-top: 1px solid var(--button-border);
  color: var(--muted);
  font-size: 0.75rem;
  text-align: center;
}

.credit a {
  color: inherit;
}

.credit a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 0 4px 0 10px;
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
}

/* A checkbox drawn as an on/off switch. */
.switch {
  appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  margin: 0;
  border-radius: 999px;
  background: var(--muted);
  cursor: pointer;
  transition: background 0.15s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
  transition: transform 0.15s;
}

.switch:checked {
  background: var(--accent);
}

.switch:checked::after {
  transform: translateX(16px);
}

.switch:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
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
