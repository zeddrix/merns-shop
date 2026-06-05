import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(rootDir, '../shared')
    }
  },
  server: {
    port: 5020,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5021',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost'
      },
      '/robots.txt': {
        target: 'http://localhost:5021',
        changeOrigin: true
      },
      '/sitemap.xml': {
        target: 'http://localhost:5021',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
