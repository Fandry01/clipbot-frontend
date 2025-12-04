import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // alle backend calls door de dev server proxien -> zelfde origin/port
        '^/v1': { target: 'http://localhost:8080', changeOrigin: true }
  }
  }
})
