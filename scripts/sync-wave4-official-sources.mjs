import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = catalogImagePaths.manifest;
const officialPath = catalogImagePaths.sources.official;

const WAVE4_BRANDS = new Set(['Vivo', 'Xiaomi', 'Amazon']);

const isBadCommonsTitle = (title, productName, brand) => {
  const lower = `${title} ${productName}`.toLowerCase();
  const reject = ['soup', 'food', 'yatra', 'village', 'sunset', 'egg', 'duck'];
  if (reject.some((word) => lower.includes(word))) return true;
  const nameTokens = productName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const brandToken = brand.toLowerCase();
  const titleLower = title.toLowerCase();
  const matched = nameTokens.filter((token) => titleLower.includes(token)).length;
  return matched < 1 && !titleLower.includes(brandToken);
};

try {
  execSync('pnpm catalog:sources:official', { cwd: root, stdio: 'inherit' });
} catch {
  // Wave 4 entries may still be missing before Wikimedia resolve runs.
}
execSync('node scripts/resolve-catalog-image-sources.mjs', { cwd: root, stdio: 'inherit' });

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = officialRaw.entries ?? officialRaw;

const synced = [];
const rejected = [];

for (const entry of manifest.entries) {
  if (!WAVE4_BRANDS.has(entry.brand)) continue;
  if (!entry.sourceUrl) {
    rejected.push({ modelKey: entry.modelKey, reason: 'missing sourceUrl' });
    continue;
  }
  if (isBadCommonsTitle(entry.commonsTitle ?? entry.name, entry.name, entry.brand)) {
    rejected.push({ modelKey: entry.modelKey, reason: 'irrelevant commons title' });
    continue;
  }
  entries[entry.modelKey] = {
    sourceUrl: entry.sourceUrl,
    sourcePageUrl: entry.commonsTitle
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(entry.commonsTitle.replace(/ /g, '_'))}`
      : '',
    brand: entry.brand,
    sourceType: entry.sourceType ?? 'wikimedia',
    license: entry.license,
    author: entry.author,
    commonsTitle: entry.commonsTitle
  };
  synced.push(entry.modelKey);
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
console.log(
  `Synced ${synced.length} Wave 4 entries to official sources. Rejected ${rejected.length}.`
);
if (rejected.length > 0) {
  process.exitCode = 1;
}
