/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vitest configuration for testing.
 * Got it, love.
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true
  }
})