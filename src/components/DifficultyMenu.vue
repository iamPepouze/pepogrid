<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { DIFFICULTIES, type Difficulty } from '../lib/difficulty'

const { t } = useI18n()
defineProps<{ current: Difficulty; disabled?: boolean }>()
/** `select` also carries the menu's trigger, for focus to return to if the pick is cancelled. */
const emit = defineEmits<{ select: [difficulty: Difficulty, trigger: HTMLButtonElement | null] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function close(returnFocus = false) {
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function choose(d: Difficulty) {
  close(true)
  emit('select', d, trigger.value)
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
  <div ref="root" class="difficulty-menu" data-own-keys @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      :disabled="disabled"
      @click="open = !open"
    >
      <span>{{ t.difficulty[current] }}</span>
      <ChevronDown class="chevron" aria-hidden="true" />
    </button>

    <div v-if="open" class="popover" role="menu" :aria-label="t.difficultyMenu">
      <button
        v-for="d in DIFFICULTIES"
        :key="d"
        type="button"
        role="menuitemradio"
        class="option"
        :class="{ checked: current === d }"
        :aria-checked="current === d"
        @click="choose(d)"
      >
        <span>{{ t.difficulty[d] }}</span>
        <Check v-if="current === d" class="check" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* No positioning here: the popover anchors to the header (App.vue) so it stays on screen. */
.difficulty-menu {
  display: contents;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 0 8px 0 12px;
  border: 1px solid var(--accent);
  border-radius: 10px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.trigger:disabled {
  opacity: 0.6;
  cursor: progress;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.15s;
}

.trigger[aria-expanded='true'] .chevron {
  transform: rotate(180deg);
}

.popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: min(200px, 100%);
  padding: 6px;
  border: 1px solid var(--button-border);
  border-radius: 12px;
  background: var(--button-bg);
  box-shadow: var(--shadow);
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.option.checked {
  background: var(--accent);
  color: var(--on-accent);
}

.check {
  width: 16px;
  height: 16px;
}

@media (hover: hover) {
  .option:hover:not(.checked) {
    background: var(--peer);
  }
}
</style>
