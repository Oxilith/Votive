import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3000,
    https: fs.existsSync(path.resolve(__dirname, '../certs/localhost+2.pem'))
      ? {
          key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost+2-key.pem')),
          cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost+2.pem')),
        }
      : undefined,
  },
})
