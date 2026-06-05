import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import buildSeedProducts from '../backend/data/catalog/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const manifestPath = join(root, 'catalog-image-manifest.json');

const existingEntries = new Map();
if (existsSync(manifestPath)) {
  const prior = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const entry of prior.entries ?? []) {
    existingEntries.set(entry.modelKey, entry);
  }
}

const entries = buildSeedProducts().map((product) => {
  const prior = existingEntries.get(product.modelKey);
  return {
    modelKey: product.modelKey,
    name: product.name,
    brand: product.brand,
    subcategory: product.subcategory,
    file: product.image,
    sourceUrl: prior?.sourceUrl ?? '',
    sourceType: prior?.sourceType ?? '',
    sourcePageUrl: prior?.sourcePageUrl ?? '',
    license: prior?.license ?? '',
    author: prior?.author ?? '',
    commonsTitle: prior?.commonsTitle ?? ''
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  note: 'Run pnpm catalog:sources then pnpm catalog:images to populate WebP assets from Wikimedia Commons.',
  entries
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Wrote ${entries.length} manifest entries to catalog-image-manifest.json`);
