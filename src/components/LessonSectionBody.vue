<script setup lang="ts">
import type { LessonSection } from '../lib/lessons'
import LessonExample from './LessonExample.vue'

defineProps<{ section: LessonSection }>()
</script>

<template>
  <div class="lesson-section-body">
    <p>{{ section.text }}</p>
    <LessonExample v-for="example in section.examples" :key="example.position" :example="example" />
  </div>
</template>

<style scoped>
.lesson-section-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

p {
  margin: 0;
}
</style>
