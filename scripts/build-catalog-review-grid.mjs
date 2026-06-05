import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const reviewDir = path.join(root, '.catalog-visual-review');

const batchArg = process.argv.find((a) => a.startsWith('--batch='));
const batchNum = Number(batchArg?.split('=')[1] ?? '1');
const meta = JSON.parse(fs.readFileSync(path.join(reviewDir, `batch-${batchNum}.json`), 'utf8'));

const COLS = 4;
const CELL = 280;
const LABEL_H = 36;
const rows = Math.ceil(meta.entries.length / COLS);
const width = COLS * CELL;
const height = rows * (CELL + LABEL_H);

const composites = [];
for (let i = 0; i < meta.entries.length; i += 1) {
  const entry = meta.entries[i];
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const pngPath = path.join(reviewDir, entry.png);
  if (!fs.existsSync(pngPath)) continue;
  const tile = await sharp(pngPath)
    .resize(CELL, CELL, { fit: 'contain', background: { r: 32, g: 32, b: 36 } })
    .toBuffer();
  composites.push({
    input: tile,
    left: col * CELL,
    top: row * (CELL + LABEL_H)
  });
  const label = entry.modelKey.replace(/-/g, ' ').slice(0, 22);
  const svg = `<svg width="${CELL}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#202124"/><text x="6" y="22" font-family="monospace" font-size="11" fill="#e8eaed">${label}</text></svg>`;
  composites.push({
    input: Buffer.from(svg),
    left: col * CELL,
    top: row * (CELL + LABEL_H) + CELL
  });
}

await sharp({
  create: { width, height, channels: 3, background: { r: 32, g: 32, b: 36 } }
})
  .composite(composites)
  .png()
  .toFile(path.join(reviewDir, `grid-batch-${batchNum}.png`));

console.log(`Wrote grid-batch-${batchNum}.png (${meta.entries.length} tiles)`);
