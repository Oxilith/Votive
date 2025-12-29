import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/admin',
  base: '/admin/',
  build: {
    // Output to where compiled index.js expects it: path.join(__dirname, 'admin')
    // In production: __dirname = /app/dist/prompt-service/src, so admin path = /app/dist/prompt-service/src/admin
    outDir: '../../dist/prompt-service/src/admin',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
