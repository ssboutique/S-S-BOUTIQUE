import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'S&S BOUTIQUE - Tienda Oficial',
        short_name: 'S&S BOUTIQUE',
        description: 'Boutique de moda, calzado y accesorios exclusivos con atención personalizada vía WhatsApp',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=192&h=192&fit=crop',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=512&h=512&fit=crop',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@supabase/supabase-js': path.resolve(__dirname, './node_modules/@supabase/supabase-js/dist/index.cjs'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
