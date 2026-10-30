<script setup lang="ts">
import { Monitor, Moon, Settings, Sun } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { LANGUAGES, resolveLanguage, type LanguageSetting } from '../lib/language'
import { LANGUAGE_NAMES } from '../locales'
import { THEME_MODES, useSettingsStore, type ThemeMode } from '../stores/settings'

const settings = useSettingsStore()
const { t } = useI18n()

const LANGUAGE_SETTINGS: readonly LanguageSetting[] = ['system', ...LANGUAGES]
/** The language System gives on this device, whichever language the app is in now. */
const deviceLanguage = computed(() => resolveLanguage(navigator.languages, 'system'))
const languageLabel = (setting: LanguageSetting) => (setting === 'system' ? t.value.settings.system(LANGUAGE_NAMES[deviceLanguage.value]) : LANGUAGE_NAMES[setting])
const themeLabels = computed<Record<ThemeMode, string>>(() => ({
  system: t.value.settings.themeSystem,
  light: t.value.settings.themeLight,
  dark: t.value.settings.themeDark,
}))
const ICONS = { system: Monitor, light: Sun, dark: Moon }
const LICENSE_URL = 'https://github.com/iamPepouze/pepogrid/blob/main/LICENSE'

/** Saves the pick, then reloads, so every word of the app comes up in the new language. */
async function pickLanguage(setting: LanguageSetting) {
  if (setting === settings.language) return
  settings.language = setting
  // The persisted copy is written on the store's next flush; a reload before it would drop the pick.
  await nextTick()
  window.location.reload()
}

/**
 * A native radio group picks on every arrow key, and a pick here reloads the app, so a keyboard player
 * couldn't step to their language. The arrows only move focus; `Enter` picks, as `Space` and a tap already do.
 */
function onLanguageKeydown(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  if (e.key === 'Enter') {
    e.preventDefault()
    input.click()
    return
  }
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
  if (!step) return
  e.preventDefault()
  const inputs = [...input.closest('fieldset')!.querySelectorAll('input')]
  inputs[(inputs.indexOf(input) + step + inputs.length) % inputs.length].focus()
}

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
      :aria-label="t.settings.title"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <Settings aria-hidden="true" />
    </button>

    <div v-if="open" class="popover" role="dialog" :aria-label="t.settings.title">
      <fieldset @keydown="onLanguageKeydown">
        <legend>{{ t.settings.language }}</legend>
        <label v-for="s in LANGUAGE_SETTINGS" :key="s" class="option" :class="{ checked: settings.language === s }">
          <input type="radio" name="language" :value="s" :checked="settings.language === s" @change="pickLanguage(s)" />
          <span>{{ languageLabel(s) }}</span>
        </label>
      </fieldset>
      <fieldset>
        <legend>{{ t.settings.theme }}</legend>
        <label v-for="m in THEME_MODES" :key="m" class="option" :class="{ checked: settings.theme === m }">
          <input v-model="settings.theme" type="radio" name="theme" :value="m" />
          <component :is="ICONS[m]" class="icon" aria-hidden="true" />
          <span>{{ themeLabels[m] }}</span>
        </label>
      </fieldset>
      <fieldset>
        <legend>{{ t.settings.board }}</legend>
        <label class="switch-row">
          <span>{{ t.settings.highlightMatching }}</span>
          <input v-model="settings.highlightMatching" type="checkbox" role="switch" class="switch" />
        </label>
      </fieldset>
      <p class="credit">
        © 2026 Pepouze ·
        <a :href="LICENSE_URL" target="_blank" rel="noopener">{{ t.settings.license }}</a>
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
  background: var(--switch-off);
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
  background: var(--switch-thumb);
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
