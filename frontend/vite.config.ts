import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { PWA_MANIFEST } from './src/pwa/manifest';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const apiPort = process.env.PORT ?? '5021';
const clientPort = Number(process.env.VITE_DEV_PORT ?? 5020);
const apiOrigin = `http://localhost:${apiPort}`;

export default defineConfig({
  plugins: [
    react(),
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
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
    outDir: 'dist'
  }
});
