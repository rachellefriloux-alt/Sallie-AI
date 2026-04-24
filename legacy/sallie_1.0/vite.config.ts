/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Vite configuration for modern web development.
 * Got it, love.
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat Sallie custom elements as custom elements
          isCustomElement: (tag) => tag.startsWith('sallie-')
        }
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/components': resolve(__dirname, 'components'),
      '@/core': resolve(__dirname, 'core'),
      '@/ai': resolve(__dirname, 'ai'),
      '@/ui': resolve(__dirname, 'ui'),
      '@/feature': resolve(__dirname, 'feature')
    }
  },
  
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __SALLIE_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['vue'],
          ui: ['./ui/visual/themeGenerator.ts', './ui/visual/svgGenerator.ts'],
          core: ['./core/AdaptivePersonaEngine.ts', './core/PluginRegistry.ts']
        },
        
        // Better asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          let extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // Optimize for production
    cssCodeSplit: true,
    cssMinify: true,
    
    // Bundle size analysis
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true,
    cors: true,
    
    // Proxy API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  optimizeDeps: {
    include: ['vue'],
    exclude: ['@vite/client', '@vite/env']
  },
  
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  
  css: {
    devSourcemap: true,
    
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./ui/styles/variables.scss";
          @import "./ui/styles/mixins.scss";
        `
      }
    },
    
    postcss: {
      plugins: [
        // Add PostCSS plugins as needed
      ]
    }
  },
  
  json: {
    namedExports: true,
    stringify: false
  },
  
  // Environment variables
  envPrefix: 'SALLIE_',
  
  // Performance optimizations
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `"/assets/${filename}"` };
      } else {
        return { relative: true };
      }
    }
  }
});