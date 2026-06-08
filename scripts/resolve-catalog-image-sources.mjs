import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { auditManifestEntry, pickRelevantCommonsCandidate } from './catalog-image-relevance.mjs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = catalogImagePaths.manifest;
const overridesPath = catalogImagePaths.sources.overrides;
const reportPath = catalogImagePaths.reports.resolve;

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const RATE_MS = 2000;
const MAX_RETRIES = 6;
const reaudit = process.argv.includes('--reaudit');

const saveManifest = (manifest) => {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};

const ALLOWED_LICENSES = [
  'cc-by',
  'cc by',
  'cc-by-sa',
  'cc by-sa',
  'cc0',
  'public domain',
  'pd',
  'gfdl',
  'free art license'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadOverrides = () => {
  if (!fs.existsSync(overridesPath)) {
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  return raw.overrides ?? raw;
};

const licenseAllowed = (licenseShort) => {
  if (!licenseShort) return false;
  const normalized = licenseShort.toLowerCase();
  return ALLOWED_LICENSES.some((allowed) => normalized.includes(allowed));
};

const commonsSearch = async (searchTerm) => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1200'
  });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(`${COMMONS_API}?${params}`);
    if (response.status === 429) {
      const waitMs = RATE_MS * (attempt + 2) * 2;
      console.warn(`Commons rate limit; waiting ${waitMs}ms…`);
      await sleep(waitMs);
      continue;
    }
    if (!response.ok) {
      throw new Error(`Commons API HTTP ${response.status}`);
    }
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return [];

    return Object.values(pages)
      .filter((page) => page.imageinfo?.[0])
      .map((page) => {
        const info = page.imageinfo[0];
        const ext = info.extmetadata ?? {};
        return {
          title: page.title,
          url: info.url,
          thumbUrl: info.thumburl ?? info.url,
          width: info.width,
          height: info.height,
          license: ext.LicenseShortName?.value ?? '',
          author: ext.Artist?.value ?? ext.Credit?.value ?? ''
        };
      });
  }
  throw new Error('Commons API rate limit exceeded after retries');
};

const buildSearchQueries = (product) => {
  const queries = [
    `${product.brand} ${product.name} smartphone`,
    `${product.brand} ${product.name}`,
    `${product.name} ${product.brand}`,
    product.name
  ];
  if (product.brand === 'Apple' && product.name.startsWith('iPhone')) {
    queries.push(`Apple ${product.name}`);
  }
  return [...new Set(queries.map((q) => q.trim()))];
};

async function main() {
  if (!process.argv.includes('--skip-manifest')) {
    execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', {
      cwd: root,
      stdio: 'inherit'
    });
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const overrides = loadOverrides();
  const report = { resolved: [], failed: [], overridden: [], reaudited: [] };

  if (reaudit) {
    for (const entry of manifest.entries) {
      const audited = auditManifestEntry(entry, manifest.entries);
      if (!audited.ok && !overrides[entry.modelKey]?.sourceUrl) {
        entry.sourceUrl = '';
        entry.license = '';
        entry.author = '';
        entry.commonsTitle = '';
        entry.sourceType = '';
        report.reaudited.push(entry.modelKey);
      }
    }
  }

  for (const entry of manifest.entries) {
    const override = overrides[entry.modelKey];
    if (override?.sourceUrl) {
      entry.sourceUrl = override.sourceUrl;
      entry.license = override.license ?? entry.license;
      entry.author = override.author ?? entry.author;
      entry.commonsTitle = override.commonsTitle ?? entry.commonsTitle;
      entry.sourceType = override.sourceType ?? 'override';
      report.overridden.push(entry.modelKey);
      continue;
    }

    if (entry.sourceUrl) {
      report.resolved.push({ modelKey: entry.modelKey, title: entry.commonsTitle, skipped: true });
      continue;
    }

    let picked = null;
    for (const query of buildSearchQueries(entry)) {
      const candidates = await commonsSearch(query);
      const licensed = candidates.filter((candidate) => licenseAllowed(candidate.license));
      picked = pickRelevantCommonsCandidate(licensed, entry);
      if (picked) break;
      await sleep(RATE_MS);
    }

    if (picked) {
      entry.sourceUrl = picked.url;
      entry.license = picked.license.replace(/<[^>]+>/g, '').trim();
      entry.author = picked.author.replace(/<[^>]+>/g, '').trim();
      entry.commonsTitle = picked.title;
      entry.sourceType = 'wikimedia';
      report.resolved.push({
        modelKey: entry.modelKey,
        title: picked.title,
        license: entry.license
      });
    } else {
      report.failed.push({ modelKey: entry.modelKey, name: entry.name, brand: entry.brand });
    }

    saveManifest(manifest);
    await sleep(RATE_MS);
  }

  manifest.generatedAt = new Date().toISOString();
  manifest.note =
    'sourceUrl populated via pnpm catalog:sources (Wikimedia Commons). Run pnpm catalog:images to download WebP assets.';
  saveManifest(manifest);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(
    `Resolved ${report.resolved.length}, overrides ${report.overridden.length}, reaudited ${report.reaudited.length}, failed ${report.failed.length}.`
  );
  console.log(`Report: ${reportPath}`);
  if (report.failed.length > 0) {
    console.error('Add catalog/images/sources/overrides.json entries for failed modelKeys.');
    process.exitCode = 1;
  }
}

await main();
