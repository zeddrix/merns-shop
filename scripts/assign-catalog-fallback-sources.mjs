import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const overridesPath = path.join(root, 'catalog-image-overrides.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const byKey = (modelKey) => manifest.entries.find((e) => e.modelKey === modelKey);

const fromSibling = (modelKey) => {
  const entry = byKey(modelKey);
  if (!entry?.sourceUrl) {
    throw new Error(`Sibling ${modelKey} has no sourceUrl`);
  }
  return {
    sourceUrl: entry.sourceUrl,
    license: entry.license,
    author: entry.author,
    commonsTitle: entry.commonsTitle
  };
};

const fallbackMap = {
  'macbook-pro-16-m3-max': () => fromSibling('macbook-pro-16-m4-max')
};

const overrides = {};

for (const entry of manifest.entries) {
  if (entry.sourceUrl) continue;
  if (['Apple', 'Samsung', 'Sony', 'Vivo', 'Xiaomi', 'Amazon'].includes(entry.brand)) {
    console.error(
      `Missing official source for ${entry.modelKey} — run pnpm catalog:harvest:official or catalog:harvest:wave4`
    );
    process.exitCode = 1;
    continue;
  }
  const resolver = fallbackMap[entry.modelKey];
  if (!resolver) {
    console.error(`No fallback for ${entry.modelKey}`);
    process.exitCode = 1;
    continue;
  }
  const meta = resolver();
  overrides[entry.modelKey] = meta;
  Object.assign(entry, meta);
  console.log(`Fallback ${entry.modelKey}`);
}

fs.writeFileSync(overridesPath, JSON.stringify({ overrides }, null, 2));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Assigned ${Object.keys(overrides).length} fallbacks.`);
