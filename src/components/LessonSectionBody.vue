<script setup lang="ts">
import type { LessonSection } from '../lib/lessons'
import LessonExample from './LessonExample.vue'

/** `english` marks a lesson shown in English inside another language, so a screen reader reads its words in English. */
defineProps<{ section: LessonSection; english?: boolean }>()
</script>

<template>
  <div class="lesson-section-body">
    <p :lang="english ? 'en' : undefined">{{ section.text }}</p>
    <LessonExample v-for="example in section.examples" :key="example.position" :example="example" :english="english" />
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
