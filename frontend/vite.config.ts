import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import { PWA_MANIFEST } from './src/pwa/manifest';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const apiPort = process.env.PORT ?? '5021';
const clientPort = Number(process.env.VITE_DEV_PORT ?? 5020);
const apiOrigin = `http://localhost:${apiPort}`;

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze'
      ? [
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
            open: false
          })
        ]
      : []),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      manifest: PWA_MANIFEST,
      devOptions: {
        enabled: false
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3_000_000
      }
    })
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(rootDir, '../shared')
    }
  },
  server: {
    port: clientPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiOrigin,
        changeOrigin: true,
        cookieDomainRewrite: 'localhost'
      },
      '/robots.txt': {
        target: apiOrigin,
        changeOrigin: true
      },
      '/sitemap.xml': {
        target: apiOrigin,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('@paypal/react-paypal-js')) {
            return 'paypal';
          }
          if (
            id.includes('node_modules/react-bootstrap') ||
            id.includes('node_modules/bootstrap')
          ) {
            return 'bootstrap-ui';
          }
        }
      }
    }
  }
}));
