import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
const reportPath = path.join(root, 'catalog-image-official-resolve-report.json');

const loadOfficial = () => {
  if (!fs.existsSync(officialPath)) {
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
  return raw.entries ?? raw;
};

const main = () => {
  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const official = loadOfficial();
  const missingOfficial = [];
  let merged = 0;

  for (const entry of manifest.entries) {
    const officialEntry = official[entry.modelKey];
    if (!officialEntry?.sourceUrl) {
      if (['Apple', 'Samsung', 'Sony', 'Vivo', 'Xiaomi', 'Amazon'].includes(entry.brand)) {
        missingOfficial.push({
          modelKey: entry.modelKey,
          brand: entry.brand,
          name: entry.name
        });
      }
      continue;
    }
    entry.sourceUrl = officialEntry.sourceUrl;
    entry.sourceType = officialEntry.sourceType ?? 'official';
    entry.sourcePageUrl = officialEntry.sourcePageUrl ?? '';
    if (
      officialEntry.sourceType === 'wikimedia' ||
      officialEntry.sourceType === 'licensed-fallback'
    ) {
      entry.license = officialEntry.license ?? entry.license;
      entry.author = officialEntry.author ?? entry.author;
      entry.commonsTitle = officialEntry.commonsTitle ?? entry.commonsTitle;
    } else {
      entry.license = 'Official brand marketing asset';
      entry.author = officialEntry.brand ?? entry.brand;
      entry.commonsTitle = '';
    }
    merged += 1;
  }

  manifest.note =
    'Official CDN URLs merged from catalog-image-official-sources.json. Run pnpm catalog:sources:official then pnpm catalog:images.';
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ merged, missingOfficial, generatedAt: new Date().toISOString() }, null, 2)
  );

  console.log(`Merged ${merged} official sources. Missing: ${missingOfficial.length}`);
  if (missingOfficial.length > 0) {
    for (const item of missingOfficial.slice(0, 15)) {
      console.log(`  - ${item.modelKey} (${item.brand})`);
    }
    if (missingOfficial.length > 15) {
      console.log(`  ... and ${missingOfficial.length - 15} more`);
    }
    process.exitCode = 1;
  }
};

main();
