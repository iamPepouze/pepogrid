<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed, ref } from 'vue'
import { lessonFor } from '../lib/lessons'
import LessonExample from './LessonExample.vue'

const props = defineProps<{ technique: string }>()
const emit = defineEmits<{ back: [] }>()

const backButton = ref<HTMLButtonElement | null>(null)

defineExpose({
  /** Focuses Back: the Technique button that opened the view is hidden behind it. */
  focusBack: () => backButton.value?.focus(),
})

/** The lesson and section teaching the technique, or null while it has none. */
const found = computed(() => lessonFor(props.technique))

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

    <div class="card surface">
      <p class="lead">This puzzle’s hardest technique is</p>
      <p class="technique">{{ technique }}</p>
      <p v-if="found" class="note">{{ found.lesson.text }}</p>
      <p v-else class="note">A lesson on this technique is coming.</p>
    </div>

    <section v-if="found" class="card surface section" aria-labelledby="lesson-section-title">
      <h3 id="lesson-section-title">{{ found.section.title }}</h3>
      <p>{{ found.section.text }}</p>
      <LessonExample v-for="example in found.section.examples" :key="example.position" :example="example" />
    </section>

    <details v-for="other in others" :key="other.title" class="card surface">
      <summary>{{ other.title }}</summary>
      <div class="section">
        <p>{{ other.text }}</p>
        <LessonExample v-for="example in other.examples" :key="example.position" :example="example" />
      </div>
    </details>
  </section>
</template>

<style scoped>
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

.section p {
  margin: 0;
}

.technique {
  margin: 4px 0 12px;
  font-size: 1.4rem;
  font-weight: 600;
}
</style>
