import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import buildSeedProducts from '../backend/data/catalog/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const entries = buildSeedProducts().map((product) => ({
  modelKey: product.modelKey,
  name: product.name,
  brand: product.brand,
  file: product.image,
  sourceUrl: '',
  license: 'placeholder — replace with press kit or Wikimedia Commons asset'
}));

const manifest = {
  generatedAt: new Date().toISOString(),
  note: 'Run pnpm catalog:images to ensure files exist. Set sourceUrl and run with --fetch to download.',
  entries
};

writeFileSync(join(root, 'catalog-image-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Wrote ${entries.length} manifest entries to catalog-image-manifest.json`);
