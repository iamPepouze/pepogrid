<script setup lang="ts">
import { computed } from 'vue'
import type { Statistics } from '../lib/statistics'

const props = defineProps<{ stats: Statistics }>()

const percent = (rate: number | null) => (rate === null ? '—' : `${Math.round(rate * 100)}%`)

/** Label and shown value of each figure, in display order. */
const rows = computed((): [string, string][] => [
  ['Played', String(props.stats.played)],
  ['Solved', String(props.stats.solved)],
  ['Abandoned', String(props.stats.abandoned)],
  ['Solve rate', percent(props.stats.solveRate)],
])
</script>

<template>
  <dl class="figures">
    <div v-for="[label, value] in rows" :key="label">
      <dt>{{ label }}</dt>
      <dd>{{ value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.figures {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

/* Four labels like "Abandoned" don't fit side by side on the narrowest phones. */
@media (max-width: 359px) {
  .figures {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

dt {
  color: var(--muted);
  font-size: 0.8rem;
}

dd {
  margin: 2px 0 0;
  font-size: 1.15rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
