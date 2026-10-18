<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed, ref } from 'vue'
import { tabKeyTarget } from '../composables/tabKeys'
import { lessonFor } from '../lib/lessons'
import type { NextTechnique } from '../lib/rater'
import LessonSectionBody from './LessonSectionBody.vue'

export type KeyTechniqueTab = 'next' | 'hardest'

const props = defineProps<{
  /** The tab shown; its parent chooses it, since Hardest may need confirming first. */
  tab: KeyTechniqueTab
  nextStep: NextTechnique
  /** The puzzle's hardest technique, by its SE name. */
  hardest: string
}>()
const emit = defineEmits<{ back: []; select: [tab: KeyTechniqueTab] }>()

const TABS: { id: KeyTechniqueTab; label: string }[] = [
  { id: 'next', label: 'Next step' },
  { id: 'hardest', label: 'Hardest' },
]

const backButton = ref<HTMLButtonElement | null>(null)
const tabs = ref<HTMLButtonElement[]>([])

defineExpose({
  /** Focuses Back: the Technique button that opened the view is hidden behind it. */
  focusBack: () => backButton.value?.focus(),
  /** Focuses a tab, for when a confirmation that the tab asked for closes. */
  focusTab: (tab: KeyTechniqueTab) => tabs.value[TABS.findIndex((t) => t.id === tab)]?.focus(),
})

/**
 * Arrow keys, Home and End move focus between the tabs, as in the WAI-ARIA tabs pattern, but don't
 * choose one: choosing Hardest can ask for confirmation, so that waits for Enter, Space or a click.
 */
function onTabKeydown(e: KeyboardEvent) {
  const next = tabKeyTarget(e.key, tabs.value.findIndex((t) => t === document.activeElement), TABS.length)
  if (next === undefined) return
  e.preventDefault()
  tabs.value[next]?.focus()
}

/** The next step's answer without a technique, shown in place of one on Next step. */
const answer = computed(() => (props.tab === 'next' && props.nextStep.kind !== 'technique' ? props.nextStep.kind : null))

/** The technique the shown tab names, or null when it names none. */
const technique = computed(() => {
  if (props.tab === 'hardest') return props.hardest
  return props.nextStep.kind === 'technique' ? props.nextStep.technique : null
})

/** The lesson and section teaching the technique, or null while it has none. */
const found = computed(() => (technique.value ? lessonFor(technique.value) : null))

/** The family's other sections, in the lesson's order, kept reachable below the one that opens. */
const others = computed(() => found.value?.lesson.sections.filter((s) => s !== found.value?.section) ?? [])
</script>

<template>
  <section class="key-technique view" aria-labelledby="key-technique-title">
    <div class="view-heading">
      <button ref="backButton" type="button" class="back-button surface" @click="emit('back')">
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
      <h2 id="key-technique-title">Key technique</h2>
    </div>

    <div class="tabs" role="tablist" aria-label="Technique" @keydown="onTabKeydown">
      <button
        v-for="t in TABS"
        :id="`key-technique-tab-${t.id}`"
        :key="t.id"
        ref="tabs"
        type="button"
        role="tab"
        aria-controls="key-technique-panel"
        :aria-selected="t.id === tab"
        :tabindex="t.id === tab ? 0 : -1"
        @click="emit('select', t.id)"
      >
        {{ t.label }}
      </button>
    </div>

    <div id="key-technique-panel" class="panel" role="tabpanel" :aria-labelledby="`key-technique-tab-${tab}`">
      <div v-if="answer === 'mistake'" class="card surface">
        <p class="headline">Your grid has a mistake</p>
        <p class="note">Check your digits and notes: one of them rules out the solution.</p>
      </div>

      <div v-else-if="answer === 'beyond'" class="card surface">
        <p class="lead">Your next step needs a technique beyond XY-Wing</p>
      </div>

      <template v-else>
        <div class="card surface">
          <p class="lead">{{ tab === 'next' ? 'Your next step needs' : 'This puzzle’s hardest technique is' }}</p>
          <p class="technique">{{ technique }}</p>
          <p v-if="found" class="note">{{ found.lesson.text }}</p>
          <p v-else class="note">A lesson on this technique is coming.</p>
        </div>

        <section v-if="found" class="card surface section" aria-labelledby="lesson-section-title">
          <h3 id="lesson-section-title">{{ found.section.title }}</h3>
          <LessonSectionBody :section="found.section" />
        </section>

        <details v-for="other in others" :key="other.title" class="card surface">
          <summary>{{ other.title }}</summary>
          <LessonSectionBody :section="other" />
        </details>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* The panel's cards keep the view's spacing between them. */
.panel {
  display: flex;
  flex-direction: column;
  gap: inherit;
}

.card {
  padding: 16px;
}

.lead,
.note {
  margin: 0;
  color: var(--muted);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section h3,
summary {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

summary {
  cursor: pointer;
}

details[open] summary {
  margin-bottom: 10px;
}

/* An answer with no technique leads with itself, as large as a technique's name. */
.technique,
.headline {
  margin: 4px 0 12px;
  font-size: 1.4rem;
  font-weight: 600;
}
</style>
