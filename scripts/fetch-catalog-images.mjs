import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { toCatalogWebp, validateCatalogImageFile } from './catalog-image-quality.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'frontend/public');
const manifestPath = path.join(root, 'catalog-image-manifest.json');

const shouldFetch = process.argv.includes('--fetch');
const shouldForce = process.argv.includes('--force');
const useWebp = process.argv.includes('--webp') || shouldFetch;
const CONCURRENCY = 1;
const DOWNLOAD_DELAY_MS = 400;
const MAX_DOWNLOAD_RETRIES = 6;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fileIsValid(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    const result = await validateCatalogImageFile(filePath);
    return result.ok;
  } catch {
    return false;
  }
}

async function downloadAndConvert(sourceUrl) {
  for (let attempt = 0; attempt <= MAX_DOWNLOAD_RETRIES; attempt += 1) {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent':
          'merns-shop-catalog/1.0 (https://github.com/zeddrix/merns-shop; educational demo)'
      }
    });
    if (response.status === 429) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${sourceUrl}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (useWebp) {
      return toCatalogWebp(buffer);
    }
    return buffer;
  }
  throw new Error(`HTTP 429 rate limit for ${sourceUrl}`);
}

async function main() {
  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', {
    cwd: root,
    stdio: 'inherit'
  });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const failures = [];

  const processEntry = async (entry) => {
    const relative = entry.file.replace(/^\//, '');
    const filePath = path.join(publicDir, relative);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const legacyJpg = filePath.replace(/\.webp$/i, '.jpg');
    if (fs.existsSync(legacyJpg)) {
      fs.unlinkSync(legacyJpg);
    }

    if (!shouldForce && (await fileIsValid(filePath))) {
      return { status: 'skipped' };
    }

    if (!shouldFetch) {
      if (!(await fileIsValid(filePath))) {
        failures.push({ file: entry.file, reason: 'missing or invalid (run with --fetch)' });
      }
      return { status: 'noop' };
    }

    if (!entry.sourceUrl) {
      failures.push({ file: entry.file, reason: 'no sourceUrl in manifest' });
      return { status: 'failed' };
    }

    try {
      await sleep(DOWNLOAD_DELAY_MS);
      const output = await downloadAndConvert(entry.sourceUrl);
      fs.writeFileSync(filePath, output);
      const check = await validateCatalogImageFile(filePath);
      if (!check.ok) {
        fs.unlinkSync(filePath);
        throw new Error(check.reason);
      }
      return { status: 'downloaded' };
    } catch (error) {
      failures.push({
        file: entry.file,
        reason: error instanceof Error ? error.message : String(error)
      });
      return { status: 'failed' };
    }
  };

  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < manifest.entries.length; i += CONCURRENCY) {
    const batch = manifest.entries.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((entry) => processEntry(entry)));
    for (const result of results) {
      if (result.status === 'downloaded') downloaded += 1;
      if (result.status === 'skipped') skipped += 1;
    }
    if ((i / CONCURRENCY) % 25 === 0 && i > 0) {
      console.log(`Progress: ${i}/${manifest.entries.length}…`);
    }
  }

  console.log(`Catalog images: ${downloaded} downloaded, ${skipped} valid/skipped.`);

  if (failures.length > 0) {
    console.error('Failures:');
    for (const failure of failures.slice(0, 20)) {
      console.error(`  ${failure.file}: ${failure.reason}`);
    }
    if (failures.length > 20) {
      console.error(`  ... and ${failures.length - 20} more`);
    }
    process.exit(1);
  }
}

await main();
