<script setup lang="ts">
/** Label and shown value of each figure, in display order. */
defineProps<{ figures: [string, string][] }>()
</script>

<template>
  <dl class="figures">
    <div v-for="[label, value] in figures" :key="label">
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

/* A label that wraps, like "Average mistakes" on phones, pushes only its own figure's top, so values stay in line. */
.figures > div {
  display: flex;
  flex-direction: column;
}

dt {
  margin-bottom: auto;
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
