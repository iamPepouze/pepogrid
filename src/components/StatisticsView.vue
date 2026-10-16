<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed, nextTick, ref } from 'vue'
import { DIFFICULTIES, LABELS, type Difficulty } from '../lib/difficulty'
import { statisticsOf, type Statistics } from '../lib/statistics'
import { useResultsStore } from '../stores/results'

const props = defineProps<{ current: Difficulty }>()
const emit = defineEmits<{ back: [] }>()

const results = useResultsStore()

/** The difficulty whose tab is shown; opens on the one being played. */
const selected = ref<Difficulty>(props.current)
const tabs = ref<HTMLButtonElement[]>([])

const overall = computed(() => statisticsOf(results.results))
const shown = computed(() => statisticsOf(results.results, selected.value))

const percent = (rate: number | null) => (rate === null ? '—' : `${Math.round(rate * 100)}%`)

/** The count rows shared by the summary and each tab. */
const countRows = (s: Statistics): [string, string][] => [
  ['Played', String(s.played)],
  ['Solved', String(s.solved)],
  ['Abandoned', String(s.abandoned)],
  ['Solve rate', percent(s.solveRate)],
]

/** Arrow keys, Home and End move between tabs, as in the WAI-ARIA tabs pattern. */
async function onTabKeydown(e: KeyboardEvent) {
  const i = DIFFICULTIES.indexOf(selected.value)
  const last = DIFFICULTIES.length - 1
  const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key]
  if (next === undefined) return
  e.preventDefault()
  selected.value = DIFFICULTIES[next]
  await nextTick()
  tabs.value[next]?.focus()
}
</script>

<template>
  <section class="statistics" aria-labelledby="statistics-title">
    <div class="heading">
      <button type="button" class="back" @click="emit('back')">
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
      <h2 id="statistics-title">Statistics</h2>
    </div>

    <section class="summary card" aria-labelledby="summary-title">
      <h3 id="summary-title">All difficulties</h3>
      <dl class="figures">
        <div v-for="[label, value] in countRows(overall)" :key="label">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </section>

    <div class="tabs" role="tablist" aria-label="Difficulty" @keydown="onTabKeydown">
      <button
        v-for="d in DIFFICULTIES"
        :id="`statistics-tab-${d}`"
        :key="d"
        ref="tabs"
        type="button"
        role="tab"
        aria-controls="statistics-panel"
        :aria-selected="d === selected"
        :tabindex="d === selected ? 0 : -1"
        @click="selected = d"
      >
        {{ LABELS[d] }}
      </button>
    </div>

    <div id="statistics-panel" class="card" role="tabpanel" :aria-labelledby="`statistics-tab-${selected}`">
      <p v-if="!shown.played" class="empty">No {{ LABELS[selected] }} games yet.</p>
      <dl v-else class="figures">
        <div v-for="[label, value] in countRows(shown)" :key="label">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.statistics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text);
}

.heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.heading h2 {
  margin: 0;
  font-size: 1.15rem;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 6px 12px 6px 8px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.back > svg {
  width: 18px;
  height: 18px;
}

.card {
  padding: 12px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
}

.card h3 {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.figures {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.figures dt {
  color: var(--muted);
  font-size: 0.8rem;
}

.figures dd {
  margin: 2px 0 0;
  font-size: 1.15rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tabs button {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  padding: 6px 8px;
  border: 1px solid var(--button-border);
  border-radius: 999px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.tabs button[aria-selected='true'] {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.empty {
  margin: 0;
  color: var(--muted);
}

@media (hover: hover) and (pointer: fine) {
  .back:hover,
  .tabs button:hover:not([aria-selected='true']) {
    background: var(--peer);
  }
}
</style>
