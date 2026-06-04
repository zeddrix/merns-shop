import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
