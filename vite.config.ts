import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/sababawords/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SababaWords',
        short_name: 'SababaWords',
        lang: 'he',
        dir: 'rtl',
        description: 'למידת אנגלית וערבית בכיף',
        theme_color: '#58cc02',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/sababawords/',
        scope: '/sababawords/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
