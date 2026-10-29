import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Unified Vite configuration with proxy to backend server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5502,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5008',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5008',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5502,
    host: true,
  },
});
