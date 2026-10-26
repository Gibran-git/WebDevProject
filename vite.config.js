import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api/met/public/collection/... -> https://collectionapi.metmuseum.org/public/collection/...
      '/api/met': {
        target: 'https://collectionapi.metmuseum.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/met/, ''),
      },
    },
  },
})
