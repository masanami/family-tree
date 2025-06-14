import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ['react', 'react-dom'],
          // Router chunk
          router: ['react-router-dom'],
          // ReactFlow chunk (heavy component)
          reactflow: ['reactflow'],
          // UI components chunk
          ui: ['./src/components/UI/Button.tsx', './src/components/UI/Modal.tsx', './src/components/UI/Input.tsx']
        }
      },
      treeshake: {
        // Aggressive tree shaking
        preset: 'recommended',
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Enable compression
    reportCompressedSize: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['reactflow'] // Let it be code-split
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
