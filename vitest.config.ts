import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.test') });
dotenv.config({ path: path.join(__dirname, '.env'), override: false });

export default defineConfig({
  resolve: {
    alias: {
      '@types': path.resolve(__dirname, './types')
    }
  },
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts', 'tests/integration/**/*.{test,spec}.ts'],
    setupFiles: ['tests/vitest-setup.ts'],
    environment: 'node',
    environmentMatchGlobs: [['tests/unit/frontend/**', 'happy-dom']],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
    maxWorkers: 1
  }
});
