/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue']
        }
      }
    }
  }
});