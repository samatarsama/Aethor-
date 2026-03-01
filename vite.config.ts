import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/politiloggen': {
        target: 'https://api.politiet.no/politiloggen/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/politiloggen/, ''),
      },
      '/api/met': {
        target: 'https://api.met.no/weatherapi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/met/, ''),
      },
      '/api/avinor': {
        target: 'https://api.avinor.no',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/avinor/, '/XmlFeed.asp'),
      },
    },
  },
})
