import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
execSync('pnpm exec tsx scripts/validate-catalog-prices.ts', { cwd: root, stdio: 'inherit' });
