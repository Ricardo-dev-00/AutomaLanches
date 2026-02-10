import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    // Otimizar tamanho do bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true
      }
    },
    // Code splitting automático
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons': ['react-icons'],
          'storage': ['zustand']
        }
      }
    },
    // Geral
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },
  // Otimizar dependências
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'react-icons']
  }
})
