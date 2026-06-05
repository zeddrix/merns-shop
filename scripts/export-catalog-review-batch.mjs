import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const outDir = path.join(root, '.catalog-visual-review');

const BRAND_ORDER = ['Apple', 'Samsung', 'Vivo', 'Xiaomi', 'Sony', 'Amazon'];
const BATCH_SIZE = 19;
const TOTAL_BATCHES = 12;

const batchArg = process.argv.find((a) => a.startsWith('--batch='));
const batchNum = Number(batchArg?.split('=')[1] ?? '1');
if (!Number.isInteger(batchNum) || batchNum < 1 || batchNum > TOTAL_BATCHES) {
  console.error(`Usage: --batch=1..${TOTAL_BATCHES}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const ordered = [...manifest.entries].sort((a, b) => {
  const bi = BRAND_ORDER.indexOf(a.brand) - BRAND_ORDER.indexOf(b.brand);
  if (bi !== 0) return bi;
  return a.modelKey.localeCompare(b.modelKey);
});

const start = (batchNum - 1) * BATCH_SIZE;
const slice = ordered.slice(start, start + BATCH_SIZE);

fs.mkdirSync(outDir, { recursive: true });

const index = [];
for (const entry of slice) {
  const rel = entry.file.replace(/^\//, '');
  const webpPath = path.join(root, 'frontend/public', rel);
  const pngName = `${entry.modelKey}.png`;
  const pngPath = path.join(outDir, pngName);
  if (!fs.existsSync(webpPath)) {
    index.push({ ...entry, png: pngName, status: 'missing-webp' });
    continue;
  }
  await sharp(webpPath).resize(560).png().toFile(pngPath);
  index.push({
    modelKey: entry.modelKey,
    name: entry.name,
    brand: entry.brand,
    subcategory: entry.subcategory,
    file: entry.file,
    sourceUrl: entry.sourceUrl,
    sourceType: entry.sourceType,
    commonsTitle: entry.commonsTitle,
    png: pngName
  });
}

const meta = {
  batch: batchNum,
  totalBatches: TOTAL_BATCHES,
  batchSize: BATCH_SIZE,
  count: index.length,
  range: `${start + 1}-${start + slice.length} of ${ordered.length}`,
  generatedAt: new Date().toISOString(),
  entries: index
};

fs.writeFileSync(path.join(outDir, `batch-${batchNum}.json`), JSON.stringify(meta, null, 2));
console.log(`Batch ${batchNum}/${TOTAL_BATCHES}: exported ${index.length} PNGs to ${outDir}`);
