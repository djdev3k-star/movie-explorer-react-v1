import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Disable PWA service worker in development
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  // You can add other configurations here
})
