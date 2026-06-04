import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @deprecated Use pnpm catalog:validate. Kept for backward compatibility; does not create placeholders. */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

execSync('node scripts/validate-catalog-images.mjs', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});
