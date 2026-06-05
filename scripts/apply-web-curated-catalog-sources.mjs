import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { auditManifestEntry } from './catalog-image-relevance.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const curatedPath = path.join(root, 'catalog-image-web-curated-sources.json');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
const reportPath = path.join(root, 'catalog-image-web-curated-report.json');

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const RATE_MS = 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {string} fileTitle */
async function resolveCommonsFile(fileTitle) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1400'
  });

  let text = '';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${COMMONS_API}?${params}`);
    if (!response.ok) {
      await sleep(RATE_MS * (attempt + 1));
      continue;
    }
    text = await response.text();
    if (text.startsWith('You are making')) {
      await sleep(RATE_MS * (attempt + 2));
      continue;
    }
    break;
  }
  if (!text || text.startsWith('You are making')) return null;

  const data = JSON.parse(text);
  const page = Object.values(data.query?.pages ?? {})[0];
  if (page?.missing) return null;
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  const ext = info.extmetadata ?? {};
  return {
    title: page.title,
    url: info.url,
    width: info.width,
    height: info.height,
    license: (ext.LicenseShortName?.value ?? 'CC BY-SA 4.0').replace(/<[^>]+>/g, '').trim(),
    author: (ext.Artist?.value ?? ext.Credit?.value ?? '').replace(/<[^>]+>/g, '').trim()
  };
}

async function main() {
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only='))?.split('=')[1];
  const modelArg = process.argv.find((arg) => arg.startsWith('--model='))?.split('=')[1];

  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });

  const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
  const official = officialRaw.entries ?? officialRaw;

  const direct = curated.direct ?? {};
  const fileMap = curated.files ?? {};
  const allKeys = new Set([...Object.keys(fileMap), ...Object.keys(direct)]);
  let targets = [...allKeys].map((modelKey) => [modelKey, fileMap[modelKey] ?? '']);
  if (modelArg) {
    targets = targets.filter(([modelKey]) => modelKey === modelArg);
  } else if (onlyArg === 'missing') {
    const prior = path.join(root, 'catalog-image-web-curated-report.json');
    if (fs.existsSync(prior)) {
      const missing = new Set(
        JSON.parse(fs.readFileSync(prior, 'utf8')).missing.map((row) => row.modelKey)
      );
      targets = targets.filter(([modelKey]) => missing.has(modelKey));
    }
  } else if (onlyArg === 'failures') {
    const failReport = path.join(root, 'catalog-image-search-curate-report.json');
    if (fs.existsSync(failReport)) {
      const failed = new Set(
        JSON.parse(fs.readFileSync(failReport, 'utf8')).failed.map((row) => row.modelKey)
      );
      targets = targets.filter(([modelKey]) => failed.has(modelKey));
    }
  }

  const report = { applied: [], missing: [], rejected: [], generatedAt: new Date().toISOString() };

  for (const [modelKey, fileTitle] of targets) {
    const entry = manifest.entries.find((row) => row.modelKey === modelKey);
    if (!entry) {
      report.missing.push({ modelKey, reason: 'not in manifest' });
      continue;
    }

    const preset = direct[modelKey];
    const file = preset
      ? {
          title: preset.commonsTitle,
          url: preset.sourceUrl,
          license: preset.license ?? 'CC BY-SA 4.0',
          author: preset.author ?? ''
        }
      : await resolveCommonsFile(fileTitle);
    if (!file) {
      report.missing.push({ modelKey, fileTitle });
      console.log('MISSING', modelKey, fileTitle);
      await sleep(RATE_MS);
      continue;
    }

    const candidate = {
      ...entry,
      sourceUrl: file.url,
      commonsTitle: file.title,
      sourceType: 'wikimedia-web-curated'
    };
    const entriesForAudit = manifest.entries.map((row) =>
      row.modelKey === modelKey ? candidate : row
    );
    const audit = auditManifestEntry(candidate, entriesForAudit);
    if (!audit.ok) {
      report.rejected.push({ modelKey, fileTitle, reasons: audit.reasons });
      console.log('REJECT', modelKey, audit.reasons.join('; '));
      await sleep(RATE_MS);
      continue;
    }

    official[modelKey] = {
      sourceUrl: file.url,
      sourcePageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(file.title.replace(/ /g, '_'))}`,
      brand: entry.brand,
      sourceType: 'wikimedia-web-curated',
      license: file.license,
      author: file.author,
      commonsTitle: file.title
    };
    report.applied.push({ modelKey, fileTitle, title: file.title, score: audit.score });
    console.log('APPLY', modelKey, file.title);
    await sleep(RATE_MS);
  }

  fs.writeFileSync(officialPath, JSON.stringify({ entries: official }, null, 2));
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(
    `Applied ${report.applied.length}, missing ${report.missing.length}, rejected ${report.rejected.length}`
  );
}

await main();
