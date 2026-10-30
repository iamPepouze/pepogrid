<script setup lang="ts">
/** A figure's label and its value as shown, such as "—" when it is missing. */
export interface Figure {
  label: string
  value: string
}

/** The figures in display order. */
defineProps<{ figures: Figure[] }>()
</script>

<template>
  <div class="box">
    <dl class="figures">
      <div v-for="f in figures" :key="f.label">
        <dt>{{ f.label }}</dt>
        <dd class="stat-value">{{ f.value }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.box {
  container-type: inline-size;
}

.figures {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

/*
 * Columns follow the room the figures have, not the screen: large text narrows them too. Four labels like
 * "Abandoned" need 20em across, and French and German labels, such as "Durchschnittszeit", need 26em.
 */
@container (max-width: 20em) {
  .figures {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (max-width: 12em) {
  .figures {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container (max-width: 26em) {
  :is(:lang(fr), :lang(de)) .figures {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (max-width: 13em) {
  :is(:lang(fr), :lang(de)) .figures {
    grid-template-columns: minmax(0, 1fr);
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
}
</style>
