import { readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/favicon.ico',
        'icons/icon-16x16.png',
        'icons/icon-32x32.png',
        'icons/icon-48x48.png',
        'icons/icon-57x57.png',
        'icons/icon-60x60.png',
        'icons/icon-72x72.png',
        'icons/icon-76x76.png',
        'icons/icon-96x96.png',
        'icons/icon-114x114.png',
        'icons/icon-120x120.png',
        'icons/icon-144x144.png',
        'icons/icon-152x152.png',
        'icons/icon-180x180.png',
      ],
      manifest: {
        id: '/',
        name: 'My Wallet',
        short_name: 'Wallet',
        description: 'Personal budgeting and finance tracker',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/graphql': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
