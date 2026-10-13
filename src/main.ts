import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

/**
 * Bump when saved games or results change meaning; older data is dropped once.
 * 2: five rated difficulty tiers (results gained SE/HoDoKu ratings).
 */
const SCHEMA_VERSION = 2

try {
  // Saves from before the Pinia stores used a different format.
  for (const key of ['pepogrid:game', 'pepogrid:theme']) localStorage.removeItem(key)
  if (Number(localStorage.getItem('pepogrid.schema') ?? 0) < SCHEMA_VERSION) {
    // Settings survive; the game and results start fresh.
    localStorage.removeItem('pepogrid.game')
    localStorage.removeItem('pepogrid.results')
    localStorage.setItem('pepogrid.schema', String(SCHEMA_VERSION))
  }
} catch {
  // Storage unavailable: nothing to migrate.
}

const pinia = createPinia()
pinia.use(createPersistedState({ key: (id) => `pepogrid.${id}` }))

createApp(App).use(pinia).mount('#app')
