#!/usr/bin/env node
import { createGzip } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distAssets = path.resolve(__dirname, '../frontend/dist/assets');
const maxGzipBytes = Number(process.env.BUNDLE_MAX_GZIP_KB ?? 250) * 1024;

const gzipSize = (buffer) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const gzip = createGzip({ level: 9 });
    gzip.on('data', (chunk) => chunks.push(chunk));
    gzip.on('error', reject);
    gzip.on('end', () => resolve(Buffer.concat(chunks).length));
    gzip.end(buffer);
  });

const findEntryChunk = (files) => {
  const jsFiles = files.filter((f) => f.endsWith('.js') && !f.includes('legacy'));
  const indexChunk = jsFiles.find((f) => f.startsWith('index-'));
  if (indexChunk) return indexChunk;
  if (jsFiles.length === 0) {
    throw new Error(`No JS chunks found in ${distAssets}. Run pnpm build first.`);
  }
  return jsFiles.sort()[0];
};

const main = async () => {
  const files = await readdir(distAssets);
  const entryFile = findEntryChunk(files);
  const raw = await readFile(path.join(distAssets, entryFile));
  const gzipped = await gzipSize(raw);

  const rawKb = (raw.length / 1024).toFixed(1);
  const gzipKb = (gzipped / 1024).toFixed(1);
  const limitKb = (maxGzipBytes / 1024).toFixed(0);

  console.log(`Entry chunk: ${entryFile}`);
  console.log(`Raw: ${rawKb} KB | Gzip: ${gzipKb} KB | Limit: ${limitKb} KB`);

  if (gzipped > maxGzipBytes) {
    console.error(`Bundle exceeds gzip budget (${gzipKb} KB > ${limitKb} KB).`);
    process.exit(1);
  }

  console.log('Bundle size check passed.');
};

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
