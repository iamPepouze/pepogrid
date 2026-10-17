<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { ref } from 'vue'

defineProps<{ technique: string }>()
const emit = defineEmits<{ back: [] }>()

const backButton = ref<HTMLButtonElement | null>(null)

defineExpose({
  /** Focuses Back: the Technique button that opened the view is hidden behind it. */
  focusBack: () => backButton.value?.focus(),
})
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
      <p class="note">A lesson on this technique is coming.</p>
    </div>
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

.technique {
  margin: 4px 0 12px;
  font-size: 1.4rem;
  font-weight: 600;
}
</style>
