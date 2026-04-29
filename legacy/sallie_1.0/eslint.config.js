import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue,ts,tsx}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/build/**',
      '**/gradle/**',
      '**/node_modules/**',
      '**/.gradle/**'
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
]