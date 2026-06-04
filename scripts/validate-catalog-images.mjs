import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../frontend/public');

const raw = execSync('pnpm exec tsx scripts/list-catalog-image-paths.ts', {
  cwd: path.join(__dirname, '..'),
  encoding: 'utf8'
});
const imagePaths = JSON.parse(raw);

let missing = 0;

for (const webPath of imagePaths) {
  const relative = webPath.replace(/^\//, '');
  const filePath = path.join(publicDir, relative);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing image: ${webPath} (${filePath})`);
    missing += 1;
  }
}

if (missing > 0) {
  process.exit(1);
}

console.log(`All ${imagePaths.length} catalog image paths exist.`);
