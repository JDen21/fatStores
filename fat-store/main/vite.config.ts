import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: 'http://localhost:8001'
    },
    proxy: {
      '/dev-api/fatStoreAdmin': {
        target: 'http://localhost:8001',
        changeOrigin: true
      }
    }
  }
})
