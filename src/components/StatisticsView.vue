<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { tabKeyTarget } from '../composables/tabKeys'
import { DIFFICULTIES, type Difficulty } from '../lib/difficulty'
import { MAX_RESULTS, capReached, countsOf, formatDuration, statisticsOf, type Counts, type Spread, type StatResult } from '../lib/statistics'
import { useResultsStore } from '../stores/results'
import StatFigures, { type Figure } from './StatFigures.vue'

const props = defineProps<{ current: Difficulty }>()
const emit = defineEmits<{ back: []; reset: [trigger: HTMLButtonElement | null] }>()

const results = useResultsStore()
const { t, formatTenths: tenths, formatPercent, formatDateTime } = useI18n()
const m = computed(() => t.value.statistics)

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
/** A percentage of 0-100, as the language writes it. */
const percent = (share: number) => formatPercent(share / 100)
/** A family's name in the app's language; the stored results keep the English one. */
const familyName = (family: string) => (m.value.families as Record<string, string>)[family] ?? family

const countFigures = (counts: Counts): Figure[] => [
  { label: m.value.played, value: String(counts.played) },
  { label: m.value.solved, value: String(counts.solved) },
  { label: m.value.abandoned, value: String(counts.abandoned) },
  { label: m.value.solveRate, value: shown(counts.solveRate, formatPercent) },
]

const solvedFigures = computed((): Figure[] => [
  { label: m.value.bestTime, value: shown(stats.value.bestTime, formatDuration) },
  { label: m.value.averageTime, value: shown(stats.value.averageTime, formatDuration) },
  { label: m.value.averageMistakes, value: shown(stats.value.averageMistakes, tenths) },
  { label: m.value.flawless, value: shown(stats.value.flawless, String) },
  { label: m.value.keyRevealed, value: shown(stats.value.revealed, String) },
  { label: m.value.nextStepUsed, value: shown(stats.value.nextStepUsed, String) },
])

const streakFigures = computed((): Figure[] => [
  { label: m.value.current, value: String(stats.value.currentStreak) },
  { label: m.value.best, value: String(stats.value.bestStreak) },
])

const rating = (label: string, spread: Spread | null, format: (n: number) => string) => ({
  label,
  average: shown(spread, (s) => format(s.average)),
  range: spread && `${format(spread.min)}–${format(spread.max)}`,
})

/** Each rating's label, shown average and min–max range. */
const ratings = computed(() => [rating(m.value.se, stats.value.se, tenths), rating(m.value.hodoku, stats.value.hodoku, (n) => String(Math.round(n)))])

const thisYear = new Date().getFullYear()

/** Day, month and time of the game's end, with the year when it isn't this one. */
function endOf(result: StatResult) {
  const end = new Date(result.endedAt)
  return formatDateTime(end, end.getFullYear() !== thisYear)
}

/** A recent result's fields, in display order. */
const recentFields = (r: StatResult) => [
  endOf(r),
  r.outcome === 'completed' ? m.value.recentSolved : m.value.recentAbandoned(percent(r.progress)),
  formatDuration(r.elapsed),
  m.value.mistakes(r.mistakes),
  m.value.recentSe(tenths(r.se)),
]

/** Arrow keys, Home and End move between tabs, as in the WAI-ARIA tabs pattern. */
async function onTabKeydown(e: KeyboardEvent) {
  const next = tabKeyTarget(e.key, DIFFICULTIES.indexOf(selected.value), DIFFICULTIES.length)
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
        <span>{{ m.back }}</span>
      </button>
      <h2 id="statistics-title">{{ m.title }}</h2>
    </div>

    <section class="summary card surface" aria-labelledby="summary-title">
      <h3 id="summary-title">{{ m.allDifficulties }}</h3>
      <StatFigures :figures="countFigures(countsOf(results.results))" />
      <p v-if="capReached(results.results)" class="note">{{ m.cap(MAX_RESULTS) }}</p>
    </section>

    <div class="tabs" role="tablist" :aria-label="t.difficultyMenu" @keydown="onTabKeydown">
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
        {{ t.difficulty[d] }}
      </button>
    </div>

    <div id="statistics-panel" class="card surface" role="tabpanel" :aria-labelledby="`statistics-tab-${selected}`">
      <p v-if="!stats.played" class="empty">{{ m.empty(t.difficulty[selected]) }}</p>
      <template v-else>
        <StatFigures :figures="countFigures(stats)" />

        <h3>{{ m.solvedGames }}</h3>
        <StatFigures :figures="solvedFigures" />

        <h3>{{ m.streaks }}</h3>
        <StatFigures :figures="streakFigures" />

        <h3>{{ m.ratings }}</h3>
        <dl class="list">
          <div v-for="r in ratings" :key="r.label">
            <dt>{{ r.label }}</dt>
            <dd>
              <span class="stat-value">{{ r.average }}</span>
              <span v-if="r.range" class="muted-note">{{ r.range }}</span>
            </dd>
          </div>
        </dl>
        <p v-if="stats.averageProgress !== null" class="note">{{ m.abandonedAverage(percent(stats.averageProgress)) }}</p>

        <template v-if="stats.families.length">
          <h3>{{ m.techniqueFamilies }}</h3>
          <dl class="list families">
            <div v-for="f in stats.families" :key="f.family">
              <dt>{{ familyName(f.family) }}</dt>
              <dd>
                <span class="stat-value">{{ f.solved }}/{{ f.played }}</span>
                <span v-if="f.revealed" class="muted-note">{{ m.revealedKey(f.revealed) }}</span>
                <span v-if="f.nextStepUsed" class="muted-note">{{ m.usedNextStep(f.nextStepUsed) }}</span>
              </dd>
            </div>
          </dl>
        </template>

        <h3>{{ m.recentGames }}</h3>
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
      {{ m.reset }}
    </button>
  </section>
</template>

<style scoped>
/* At large text, a long word such as a German one breaks rather than spilling out of its card. */
.statistics {
  overflow-wrap: anywhere;
}

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

/*
 * Each of a family's notes sits on its own line under its count, so the counts stay in one right-hand column.
 * The notes take the room they need first, so the family's name wraps before a note does. When the name's
 * longest word and the notes can't share a line, as with large text on a phone, the count and its notes drop under the name.
 */
.families {
  /* 8px more than other lists, so a family's stacked notes read as one block, apart from the next family's name. */
  gap: 12px;
}

.families > div {
  flex-wrap: wrap;
  row-gap: 0;
}

.families dt {
  flex: 1 1 0;
}

.families dd {
  flex: 0 1 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  margin-left: auto;
  text-align: right;
}

/* A muted note beside or under a value: a rating's range, a family's solves with help. */
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
