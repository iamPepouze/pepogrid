import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Saves from before the Pinia stores used a different format; drop them.
try {
  for (const key of ['pepogrid:game', 'pepogrid:theme']) localStorage.removeItem(key)
} catch {
  // Storage unavailable: nothing to clean up.
}

const pinia = createPinia()
pinia.use(createPersistedState({ key: (id) => `pepogrid.${id}` }))

createApp(App).use(pinia).mount('#app')
