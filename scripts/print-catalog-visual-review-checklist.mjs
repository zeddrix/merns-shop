import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = (manifest.entries ?? []).map((entry) => ({
  modelKey: entry.modelKey,
  name: entry.name,
  brand: entry.brand,
  subcategory: entry.subcategory,
  file: entry.file,
  diskPath: path.join(root, 'frontend/public', entry.file.replace(/^\//, ''))
}));

console.log(
  JSON.stringify({ generatedAt: new Date().toISOString(), count: entries.length, entries }, null, 2)
);
