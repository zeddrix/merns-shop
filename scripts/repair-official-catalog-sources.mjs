import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { isPollutedOfficialUrl } from './is-polluted-official-url.mjs';
import {
  CATEGORY_DONOR_MODEL_KEY,
  SUBCATEGORY_LICENSED_FALLBACK,
  categoryKey,
  donorUrlFromModelKey
} from './official-category-donors.mjs';
import {
  buildApplePageUrl,
  buildSamsungPageUrl,
  buildSonyPageUrl
} from './official-source-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
const reportPath = path.join(root, 'catalog-image-official-repair-report.json');

execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = officialRaw.entries ?? officialRaw;

const repaired = [];
const licensedFallback = [];

for (const product of manifest.entries) {
  if (!['Apple', 'Samsung', 'Sony'].includes(product.brand)) continue;

  const current = entries[product.modelKey];
  if (!current?.sourceUrl || !isPollutedOfficialUrl(current.sourceUrl)) continue;

  const key = categoryKey(product.brand, product.subcategory);
  const donorModelKey = CATEGORY_DONOR_MODEL_KEY[key];
  let sourceUrl = donorModelKey ? donorUrlFromModelKey(entries, donorModelKey) : null;

  if (!sourceUrl || isPollutedOfficialUrl(sourceUrl)) {
    const licensed = SUBCATEGORY_LICENSED_FALLBACK[key];
    if (licensed) {
      entries[product.modelKey] = {
        sourceUrl: licensed.sourceUrl,
        sourcePageUrl: pageUrlFor(product),
        brand: product.brand,
        sourceType: 'licensed-fallback',
        license: licensed.license,
        author: licensed.author,
        commonsTitle: licensed.commonsTitle
      };
      licensedFallback.push(product.modelKey);
      continue;
    }
  }

  if (sourceUrl && !isPollutedOfficialUrl(sourceUrl)) {
    entries[product.modelKey] = {
      ...current,
      sourceUrl,
      sourcePageUrl: pageUrlFor(product),
      brand: product.brand,
      sourceType: 'official-category-donor',
      donorModelKey
    };
    repaired.push(product.modelKey);
  }
}

function pageUrlFor(product) {
  if (product.brand === 'Apple') {
    return buildApplePageUrl(product.modelKey, product.subcategory ?? '');
  }
  if (product.brand === 'Samsung') {
    return buildSamsungPageUrl(product.modelKey, product.subcategory ?? '');
  }
  return buildSonyPageUrl(product.modelKey, product.subcategory ?? '');
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      repaired,
      licensedFallback,
      generatedAt: new Date().toISOString()
    },
    null,
    2
  )
);

console.log(
  `Repaired ${repaired.length} category-donor URLs, ${licensedFallback.length} licensed fallbacks.`
);
