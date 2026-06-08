#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { WEBP_QUALITY } from './catalog-image-canvas.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.join(__dirname, '../frontend/public/images/catalog');
const widths = [400, 800];

async function generateVariants(filePath) {
  const base = path.basename(filePath, '.webp');
  if (base.endsWith('-400') || base.endsWith('-800')) {
    return { skipped: true };
  }

  let created = 0;
  for (const width of widths) {
    const outPath = path.join(path.dirname(filePath), `${base}-${width}.webp`);
    if (fs.existsSync(outPath)) {
      continue;
    }
    await sharp(filePath)
      .resize(width, Math.round(width * 0.75), { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(outPath);
    created += 1;
  }
  return { created };
}

function walkWebpFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkWebpFiles(fullPath, files);
    } else if (
      entry.name.endsWith('.webp') &&
      !entry.name.includes('-400') &&
      !entry.name.includes('-800')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  if (!fs.existsSync(catalogDir)) {
    console.log('No catalog directory — skipping responsive variants.');
    return;
  }

  const sources = walkWebpFiles(catalogDir);
  let totalCreated = 0;

  for (const filePath of sources) {
    const result = await generateVariants(filePath);
    if (result.created) {
      totalCreated += result.created;
    }
  }

  console.log(
    `Responsive catalog variants: ${totalCreated} files created from ${sources.length} sources.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
