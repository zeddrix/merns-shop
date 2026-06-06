import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const apiPort = process.env.PORT ?? '5021';
const clientPort = Number(process.env.VITE_DEV_PORT ?? 5020);
const apiOrigin = `http://localhost:${apiPort}`;

export default defineConfig({
  plugins: [react()],
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
