import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildApplePageUrl,
  buildSamsungPageUrl,
  buildSonyPageUrl
} from './official-source-helpers.mjs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = catalogImagePaths.sources.official;

execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'pipe' });
const manifest = JSON.parse(fs.readFileSync(catalogImagePaths.manifest, 'utf8'));
const official = fs.existsSync(officialPath)
  ? (JSON.parse(fs.readFileSync(officialPath, 'utf8')).entries ?? {})
  : {};

for (const entry of manifest.entries) {
  if (!['Apple', 'Samsung', 'Sony'].includes(entry.brand)) continue;
  if (official[entry.modelKey]?.sourceUrl) continue;
  let page = '';
  if (entry.brand === 'Apple') {
    page = buildApplePageUrl(entry.modelKey, entry.subcategory ?? '');
  } else if (entry.brand === 'Samsung') {
    page = buildSamsungPageUrl(entry.modelKey, entry.subcategory ?? '');
  } else {
    page = buildSonyPageUrl(entry.modelKey, entry.subcategory ?? '');
  }
  console.log(`${entry.modelKey}\t${entry.name}\t${page}`);
}
