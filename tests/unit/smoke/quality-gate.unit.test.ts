import { execSync } from 'node:child_process';
import { describe, it } from 'vitest';

describe('quality gate smoke', () => {
  it('pnpm quality:fast passes', () => {
    execSync('pnpm quality:fast', {
      stdio: 'inherit',
      env: process.env
    });
  });
});
