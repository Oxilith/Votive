import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import fs from 'fs'

const isAnalyze = process.env.ANALYZE === 'true'

export default defineConfig({
    plugins: [
        react(),
        ...(isAnalyze ? [visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true })] : []),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            // No shared alias needed - resolves via node_modules
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
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // React core + scheduler - rarely changes
                    if (id.includes('node_modules/react-dom') ||
                        id.includes('node_modules/react/') ||
                        id.includes('node_modules/scheduler')) {
                        return 'vendor-react';
                    }
                    // i18n - moderate size, stable
                    if (id.includes('node_modules/i18next') ||
                        id.includes('node_modules/react-i18next')) {
                        return 'vendor-i18n';
                    }
                    // State management - small, stable
                    if (id.includes('node_modules/zustand') ||
                        id.includes('node_modules/use-sync-external-store')) {
                        return 'vendor-state';
                    }
                },
            },
        },
    },
})