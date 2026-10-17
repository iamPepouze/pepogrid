<script setup lang="ts">
import { computed, ref } from 'vue'
import { boardAt, type LessonExample } from '../lib/lessons'
import LessonGrid from './LessonGrid.vue'

const props = defineProps<{ example: LessonExample }>()

/** The step on show, from 0. */
const index = ref(0)
const last = computed(() => props.example.steps.length - 1)
const cells = computed(() => boardAt(props.example, index.value))
</script>

<template>
  <div class="lesson-example">
    <LessonGrid :cells="cells" />
    <p class="caption" aria-live="polite">{{ example.steps[index].caption }}</p>
    <div class="stepper">
      <button type="button" class="surface" :disabled="index === 0" @click="index--">Previous</button>
      <span class="counter">Step {{ index + 1 }} of {{ last + 1 }}</span>
      <button type="button" class="surface" :disabled="index === last" @click="index++">Next</button>
    </div>
  </div>
</template>

<style scoped>
.lesson-example {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.caption {
  min-height: 3lh;
  margin: 0;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stepper button {
  padding: 6px 14px;
}

.counter {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
</style>
