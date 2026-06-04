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
            'tests/unit/types/**/*.{test,spec}.ts',
            'tests/integration/**/*.{test,spec}.ts'
          ],
          environment: 'node'
        }
      },
      {
        extends: true,
        test: {
          name: 'happy-dom',
          include: ['tests/unit/frontend/**/*.{test,spec}.ts'],
          environment: 'happy-dom'
        }
      }
    ]
  }
});
