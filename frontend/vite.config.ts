import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Thalassa/' : '/',

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inyecta el registro del Service Worker en index.html automáticamente
      injectRegister: 'auto',
      // En dev, el SW también se activa para facilitar pruebas
      devOptions: { enabled: false },

      manifest: {
        name: 'Thalassa — Marine Aquarium Management',
        short_name: 'Thalassa',
        description: 'Track parameters, livestock and equipment for your marine aquariums.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/Thalassa/dashboard',
        scope: '/Thalassa/',
        lang: 'en',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Cachear todos los assets estáticos que Vite genera
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],

        runtimeCaching: [
          {
            // API calls: NetworkFirst con timeout 3s — si falla, devuelve caché
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts: StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // date-fns v4 exports only ESM conditions that Vite 6 / the PWA plugin's
      // internal Rollup pass can't resolve without an explicit alias (same fix as vitest.config.ts)
      'date-fns': resolve(__dirname, 'node_modules/date-fns/index.cjs'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
