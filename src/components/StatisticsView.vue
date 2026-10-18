<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed, nextTick, ref } from 'vue'
import { DIFFICULTIES, LABELS, type Difficulty } from '../lib/difficulty'
import { MAX_RESULTS, capReached, countsOf, formatDuration, statisticsOf, type Counts, type Spread, type StatResult } from '../lib/statistics'
import { useResultsStore } from '../stores/results'
import StatFigures, { type Figure } from './StatFigures.vue'

const props = defineProps<{ current: Difficulty }>()
const emit = defineEmits<{ back: []; reset: [trigger: HTMLButtonElement | null] }>()

const results = useResultsStore()

const backButton = ref<HTMLButtonElement | null>(null)
const resetButton = ref<HTMLButtonElement | null>(null)

defineExpose({
  /** Focuses Back, for when the button the player used is gone or disabled. */
  focusBack: () => backButton.value?.focus(),
})

/** The difficulty whose tab is shown; opens on the one being played. */
const selected = ref<Difficulty>(props.current)
const tabs = ref<HTMLButtonElement[]>([])

const stats = computed(() => statisticsOf(results.results, selected.value))

/** Shows a figure, or a dash when it's missing, so a missing figure isn't read as zero. */
const shown = <T>(value: T | null, format: (v: T) => string) => (value === null ? '—' : format(value))
const percent = (share: number) => `${Math.round(share)}%`
const tenths = (n: number) => n.toFixed(1)

const countFigures = (counts: Counts): Figure[] => [
  { label: 'Played', value: String(counts.played) },
  { label: 'Solved', value: String(counts.solved) },
  { label: 'Abandoned', value: String(counts.abandoned) },
  { label: 'Solve rate', value: shown(counts.solveRate, (rate) => percent(rate * 100)) },
]

const solvedFigures = computed((): Figure[] => [
  { label: 'Best time', value: shown(stats.value.bestTime, formatDuration) },
  { label: 'Average time', value: shown(stats.value.averageTime, formatDuration) },
  { label: 'Average mistakes', value: shown(stats.value.averageMistakes, tenths) },
  { label: 'Flawless', value: shown(stats.value.flawless, String) },
  { label: 'Revealed', value: shown(stats.value.revealed, String) },
])

const streakFigures = computed((): Figure[] => [
  { label: 'Current', value: String(stats.value.currentStreak) },
  { label: 'Best', value: String(stats.value.bestStreak) },
])

const rating = (label: string, spread: Spread | null, format: (n: number) => string) => ({
  label,
  average: shown(spread, (s) => format(s.average)),
  range: spread && `${format(spread.min)}–${format(spread.max)}`,
})

/** Each rating's label, shown average and min–max range. */
const ratings = computed(() => [rating('SE', stats.value.se, tenths), rating('HoDoKu', stats.value.hodoku, (n) => String(Math.round(n)))])

const thisYear = new Date().getFullYear()

/** Day, month and time of the game's end, with the year when it isn't this one. */
function endOf(result: StatResult) {
  const end = new Date(result.endedAt)
  const year = end.getFullYear() === thisYear ? undefined : 'numeric'
  return end.toLocaleString(undefined, { day: 'numeric', month: 'short', year, hour: '2-digit', minute: '2-digit' })
}

/** A recent result's fields, in display order. */
const recentFields = (r: StatResult) => [
  endOf(r),
  r.outcome === 'completed' ? 'Solved' : `Abandoned at ${percent(r.progress)}`,
  formatDuration(r.elapsed),
  `${r.mistakes} ${r.mistakes === 1 ? 'mistake' : 'mistakes'}`,
  `SE ${tenths(r.se)}`,
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
  <section class="statistics view" aria-labelledby="statistics-title">
    <div class="view-heading">
      <button ref="backButton" type="button" class="back-button surface" @click="emit('back')">
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
      <h2 id="statistics-title">Statistics</h2>
    </div>

    <section class="summary card surface" aria-labelledby="summary-title">
      <h3 id="summary-title">All difficulties</h3>
      <StatFigures :figures="countFigures(countsOf(results.results))" />
      <p v-if="capReached(results.results)" class="note">Based on your latest {{ MAX_RESULTS }} games.</p>
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

    <div id="statistics-panel" class="card surface" role="tabpanel" :aria-labelledby="`statistics-tab-${selected}`">
      <p v-if="!stats.played" class="empty">No {{ LABELS[selected] }} games yet.</p>
      <template v-else>
        <StatFigures :figures="countFigures(stats)" />

        <h3>Solved games</h3>
        <StatFigures :figures="solvedFigures" />

        <h3>Streaks</h3>
        <StatFigures :figures="streakFigures" />

        <h3>Ratings</h3>
        <dl class="list">
          <div v-for="r in ratings" :key="r.label">
            <dt>{{ r.label }}</dt>
            <dd>
              <span class="stat-value">{{ r.average }}</span>
              <span v-if="r.range" class="muted-note">{{ r.range }}</span>
            </dd>
          </div>
        </dl>
        <p v-if="stats.averageProgress !== null" class="note">Abandoned at {{ percent(stats.averageProgress) }} on average</p>

        <template v-if="stats.families.length">
          <h3>Technique families</h3>
          <dl class="list">
            <div v-for="f in stats.families" :key="f.family">
              <dt>{{ f.family }}</dt>
              <dd>
                <span class="stat-value">{{ f.solved }}/{{ f.played }}</span>
                <span v-if="f.revealed" class="muted-note">· {{ f.revealed }} revealed</span>
              </dd>
            </div>
          </dl>
        </template>

        <h3>Recent games</h3>
        <ol class="recent">
          <li v-for="(r, i) in stats.recent" :key="i">
            <!-- The leading space keeps the text readable as one line; flex drops it on screen. -->
            <span v-for="(field, j) in recentFields(r)" :key="j">{{ j ? ' · ' : '' }}{{ field }}</span>
          </li>
        </ol>
      </template>
    </div>

    <button
      ref="resetButton"
      type="button"
      class="reset surface"
      :disabled="!results.results.length"
      @click="emit('reset', resetButton)"
    >
      Reset statistics
    </button>
  </section>
</template>

<style scoped>
.card {
  padding: 12px;
}

.card h3 {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.empty {
  margin: 0;
  color: var(--muted);
}

#statistics-panel h3 {
  margin-top: 16px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
}

.list > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.list dd {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
}

/* A muted note beside a value: a rating's range, a family's revealed solves. */
.muted-note {
  color: var(--muted);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.note {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.recent {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

/* Fields wrap whole on narrow phones, the dot staying with the field after it. */
.recent li {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.3em;
}

.reset {
  align-self: center;
  padding: 6px 16px;
}
</style>
