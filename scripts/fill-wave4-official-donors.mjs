import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');

const WAVE4_BRANDS = new Set(['Vivo', 'Xiaomi', 'Amazon']);
const WAVE4_DONOR = {
  'Vivo:Phones': 'vivo-x50-pro',
  'Xiaomi:Phones': 'xiaomi-13',
  'Xiaomi:Wearables': 'xiaomi-watch-s1',
  'Xiaomi:Audio': 'redmi-buds-4-pro',
  'Amazon:Smart Speakers': 'amazon-echo-dot-3-fixture'
};

execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = officialRaw.entries ?? officialRaw;

const filled = [];
for (const product of manifest.entries) {
  if (!WAVE4_BRANDS.has(product.brand)) continue;
  if (entries[product.modelKey]?.sourceUrl) continue;

  const donorKey = WAVE4_DONOR[`${product.brand}:${product.subcategory}`];
  const donor = donorKey ? entries[donorKey] : null;
  if (!donor?.sourceUrl) continue;

  entries[product.modelKey] = {
    sourceUrl: donor.sourceUrl,
    sourcePageUrl: donor.sourcePageUrl ?? '',
    brand: product.brand,
    sourceType: 'wikimedia-category-donor',
    license: donor.license,
    author: donor.author,
    commonsTitle: donor.commonsTitle,
    donorModelKey: donorKey
  };
  filled.push(product.modelKey);
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
console.log(`Filled ${filled.length} Wave 4 category-donor entries.`);
