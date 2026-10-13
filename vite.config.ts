import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Served as a GitHub Pages project site (docs/adr/0006-github-pages-project-site.md).
  base: '/pepogrid/',
  plugins: [
    vue(),
    VitePWA({
      // 'prompt' without any prompt UI: a new version installs in the background
      // and takes over on the next launch, never reloading a game in progress.
      registerType: 'prompt',
      injectRegister: 'script',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'PepoGrid',
        short_name: 'PepoGrid',
        description: 'Your grid, your chill.',
        lang: 'en',
        start_url: '/pepogrid/',
        scope: '/pepogrid/',
        display: 'standalone',
        theme_color: '#1565c0',
        background_color: '#f5f7fa',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
