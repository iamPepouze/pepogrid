<script setup lang="ts">
import { BookOpen, Eraser, Pencil, Undo2, WandSparkles } from '@lucide/vue'
import { useI18n } from '../composables/useI18n'
import { useGameStore } from '../stores/game'

const { t } = useI18n()
/** A label's name for assistive technology: the soft hyphens that let it break on screen taken out. */
const plain = (label: string) => label.replaceAll(String.fromCharCode(0xad), '')
const game = useGameStore()
/** `keyTechnique` passes the button, so focus can return to it: Safari doesn't focus a tapped button. */
const emit = defineEmits<{ keyTechnique: [trigger: HTMLButtonElement] }>()
</script>

<template>
  <div class="controls-box">
    <div class="controls">
      <button type="button" class="control" :aria-label="plain(t.controls.undo)" :disabled="!game.history.length || game.completed" @click="game.undo">
        <Undo2 class="icon" aria-hidden="true" />
        <span>{{ t.controls.undo }}</span>
      </button>
      <button type="button" class="control" :disabled="game.completed" @click="game.erase">
        <Eraser class="icon" aria-hidden="true" />
        <span>{{ t.controls.erase }}</span>
      </button>
      <button
        type="button"
        class="control"
        :class="{ active: game.notesMode }"
        :aria-pressed="game.notesMode"
        :disabled="game.completed"
        @click="game.toggleNotesMode"
      >
        <Pencil class="icon" aria-hidden="true" />
        <span>{{ t.controls.notes }}</span>
        <span class="badge" aria-hidden="true">{{ game.notesMode ? t.controls.on : t.controls.off }}</span>
      </button>
      <button type="button" class="control" :disabled="!game.canFillNotes" @click="game.fillNotes">
        <WandSparkles class="icon" aria-hidden="true" />
        <span>{{ t.controls.fillNotes }}</span>
      </button>
      <button
        type="button"
        class="control technique"
        :disabled="game.loading || game.completed"
        @click="emit('keyTechnique', $event.currentTarget as HTMLButtonElement)"
      >
        <BookOpen class="icon" aria-hidden="true" />
        <span>{{ t.controls.technique }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* The container for the query below, which asks how many ems wide the controls are. */
.controls-box {
  container-type: inline-size;
}

.controls {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

/*
 * Larger text, or a longer label in another language, leaves five columns narrower than their
 * longest word, and the row would push the page sideways. Below 16em (text zoomed past about 1.2x
 * on a 320px screen) the buttons take as many columns as fit, each at least 4em wide, and wrap into rows.
 */
@container (max-width: 16em) {
  .controls {
    grid-template-columns: repeat(auto-fill, minmax(4em, 1fr));
  }
}

/* Touch screens: icon above a small label, like a mobile toolbar. */
.control {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  padding: 6px 4px;
  border: 1px solid var(--button-border);
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.control:disabled {
  opacity: 0.45;
  cursor: default;
}

.control.active {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.badge {
  position: absolute;
  top: 3px;
  right: 3px;
  padding: 0 3px;
  border: 1px solid var(--button-border);
  border-radius: 999px;
  background: var(--badge-bg);
  color: var(--muted);
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.4;
}

.control.active .badge {
  border-color: var(--accent);
  background: var(--on-accent);
  color: var(--accent);
}

/* Mouse and keyboard devices. */
@media (hover: hover) and (pointer: fine) {
  .control:hover:not(:disabled, .active) {
    background: var(--peer);
  }

  /* Icon left of the label, in the side panel or once four such buttons fit in a row. */
  @media (orientation: landscape) and (min-width: 600px), (min-width: 760px) {
    .control {
      flex-direction: row;
      gap: 6px;
      min-height: 44px;
      padding: 8px 6px;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .icon {
      width: 18px;
      height: 18px;
    }

    .badge {
      top: 4px;
      right: 4px;
      padding: 1px 5px;
      font-size: 0.6rem;
    }
  }

  /* The side panel is too narrow for inline labels in one row: two columns. */
  @media (orientation: landscape) and (min-width: 600px) {
    .controls {
      grid-template-columns: repeat(2, 1fr);
    }

    /* The fifth control takes a row of its own rather than half of one. */
    .technique {
      grid-column: span 2;
    }
  }
}
</style>
