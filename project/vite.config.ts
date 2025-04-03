import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    hmr: {
      timeout: 60000,
      overlay: true,
      clientPort: 5173,
      protocol: 'ws',
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },
  build: {
    outDir: mode === 'desktop' ? 'dist-electron' : 'dist',
    sourcemap: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'game-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
  define: {
    'process.env.PLATFORM': JSON.stringify(mode),
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}));