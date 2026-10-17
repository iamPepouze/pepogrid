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
  <section class="key-technique" aria-labelledby="key-technique-title">
    <div class="heading">
      <button ref="backButton" type="button" class="back surface" @click="emit('back')">
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>
      <h2 id="key-technique-title">Key technique</h2>
    </div>

    <div class="card surface">
      <p class="lead">This puzzle’s hardest step needs</p>
      <p class="technique">{{ technique }}</p>
      <p class="note">A lesson on this technique is coming.</p>
    </div>
  </section>
</template>

<style scoped>
.key-technique {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text);
}

.heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.heading h2 {
  margin: 0;
  font-size: 1.15rem;
}

.back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
}

.back > svg {
  width: 18px;
  height: 18px;
}

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
