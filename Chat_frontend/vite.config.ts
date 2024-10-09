import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/websocket': {
        target: 'http://localhost:8080/websocket',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/websocket/, ''),
      },
    },
  },
})
