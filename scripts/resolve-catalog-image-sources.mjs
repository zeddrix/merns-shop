import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const overridesPath = path.join(root, 'catalog-image-overrides.json');
const reportPath = path.join(root, 'catalog-image-resolve-report.json');

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const RATE_MS = 2000;
const MAX_RETRIES = 6;

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

const scoreCandidate = (title, meta) => {
  const lower = title.toLowerCase();
  let score = 0;
  if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) score += 3;
  if (lower.includes('product') || lower.includes('smartphone') || lower.includes('phone')) {
    score += 2;
  }
  if (lower.includes('logo') || lower.includes('icon') || lower.includes('diagram')) {
    score -= 4;
  }
  if (lower.includes('svg')) score -= 5;
  const width = meta?.width ?? 0;
  const height = meta?.height ?? 0;
  if (width >= 400 && height >= 400) score += 3;
  if (width >= 800) score += 2;
  return score;
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
          author: ext.Artist?.value ?? ext.Credit?.value ?? '',
          score: scoreCandidate(page.title, info)
        };
      })
      .sort((a, b) => b.score - a.score);
  }
  throw new Error('Commons API rate limit exceeded after retries');
};

const pickCandidate = (candidates) => {
  for (const candidate of candidates) {
    if (candidate.score < 0) continue;
    if (!licenseAllowed(candidate.license)) continue;
    return candidate;
  }
  return candidates.find((c) => c.score >= 2 && c.url);
};

const buildSearchQueries = (product) => {
  const queries = [
    `${product.brand} ${product.name}`,
    product.name,
    `${product.name} ${product.brand}`
  ];
  if (product.brand === 'Apple' && product.name.startsWith('iPhone')) {
    queries.push(`Apple ${product.name.replace('iPhone', 'iPhone ')}`);
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
  const report = { resolved: [], failed: [], overridden: [] };

  for (const entry of manifest.entries) {
    if (entry.sourceUrl) {
      report.resolved.push({ modelKey: entry.modelKey, title: entry.commonsTitle, skipped: true });
      continue;
    }

    const override = overrides[entry.modelKey];
    if (override?.sourceUrl) {
      entry.sourceUrl = override.sourceUrl;
      entry.license = override.license ?? entry.license;
      entry.author = override.author ?? entry.author;
      entry.commonsTitle = override.commonsTitle ?? entry.commonsTitle;
      report.overridden.push(entry.modelKey);
      continue;
    }

    let picked = null;
    for (const query of buildSearchQueries(entry)) {
      const candidates = await commonsSearch(query);
      picked = pickCandidate(candidates);
      if (picked) break;
      await sleep(RATE_MS);
    }

    if (picked) {
      entry.sourceUrl = picked.url;
      entry.license = picked.license.replace(/<[^>]+>/g, '').trim();
      entry.author = picked.author.replace(/<[^>]+>/g, '').trim();
      entry.commonsTitle = picked.title;
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
    `Resolved ${report.resolved.length}, overrides ${report.overridden.length}, failed ${report.failed.length}.`
  );
  console.log(`Report: ${reportPath}`);
  if (report.failed.length > 0) {
    console.error('Add catalog-image-overrides.json entries for failed modelKeys.');
    process.exitCode = 1;
  }
}

await main();
