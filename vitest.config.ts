import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import react from './frontend/node_modules/@vitejs/plugin-react/dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendNodeModules = path.resolve(__dirname, 'frontend/node_modules');

dotenv.config({ path: path.join(__dirname, '.env.test') });
dotenv.config({ path: path.join(__dirname, '.env'), override: false });

const frontendResolveAlias = {
  react: path.join(frontendNodeModules, 'react'),
  'react-dom': path.join(frontendNodeModules, 'react-dom'),
  'react-dom/client': path.join(frontendNodeModules, 'react-dom/client'),
  'react-router-dom': path.join(frontendNodeModules, 'react-router-dom'),
  'react-redux': path.join(frontendNodeModules, 'react-redux'),
  '@reduxjs/toolkit': path.join(frontendNodeModules, '@reduxjs/toolkit'),
  'react-bootstrap': path.join(frontendNodeModules, 'react-bootstrap'),
  bootstrap: path.join(frontendNodeModules, 'bootstrap')
};

export default defineConfig({
  resolve: {
    alias: {
      '@types': path.resolve(__dirname, './types'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  test: {
    setupFiles: ['tests/vitest-setup.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
    maxWorkers: 1,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: [
            'tests/unit/backend/**/*.{test,spec}.ts',
            'tests/unit/scripts/**/*.{test,spec}.ts',
            'tests/unit/e2e/**/*.{test,spec}.ts',
            'tests/unit/smoke/**/*.{test,spec}.ts',
            'tests/unit/types/**/*.{test,spec}.ts',
            'tests/unit/shared/**/*.{test,spec}.ts',
            'tests/integration/**/*.{test,spec}.ts'
          ],
          environment: 'node'
        }
      },
      {
        extends: true,
        plugins: [react()],
        resolve: {
          alias: {
            ...frontendResolveAlias,
            '@types': path.resolve(__dirname, './types'),
            '@shared': path.resolve(__dirname, './shared')
          }
        },
        test: {
          name: 'happy-dom',
          include: ['tests/unit/frontend/**/*.{test,spec}.{ts,tsx}'],
          environment: 'happy-dom'
        }
      }
    ]
  }
});
