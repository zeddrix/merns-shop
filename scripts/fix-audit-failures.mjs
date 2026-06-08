import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { auditManifestEntry, pickRelevantCommonsCandidate } from './catalog-image-relevance.mjs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = catalogImagePaths.manifest;
const officialPath = catalogImagePaths.sources.official;
const overridesPath = catalogImagePaths.sources.overrides;
const reportPath = catalogImagePaths.reports.fix;

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const OFFICIAL_BRANDS = new Set(['Apple', 'Samsung', 'Sony']);
const WAVE4_BRANDS = new Set(['Vivo', 'Xiaomi', 'Amazon']);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ALLOWED_LICENSES = ['cc-by', 'cc by', 'cc-by-sa', 'cc by-sa', 'cc0', 'public domain', 'pd'];

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
    gsrlimit: '10',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1200'
  });
  const response = await fetch(`${COMMONS_API}?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  const pages = data.query?.pages ?? {};
  return Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info?.url) return null;
      return {
        title: page.title ?? '',
        url: info.url,
        width: info.width ?? 0,
        height: info.height ?? 0,
        license: info.extmetadata?.LicenseShortName?.value ?? '',
        author: info.extmetadata?.Artist?.value ?? ''
      };
    })
    .filter(Boolean);
};

const buildQueries = (entry) => [
  `${entry.brand} ${entry.name} smartphone`,
  `${entry.brand} ${entry.name}`,
  `${entry.name} ${entry.brand}`,
  entry.name
];

const loadJson = (filePath, fallback) => {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });

const manifest = loadJson(manifestPath, { entries: [] });
const officialRaw = loadJson(officialPath, { entries: {} });
const official = officialRaw.entries ?? officialRaw;
const overridesRaw = loadJson(overridesPath, { overrides: {} });
const overrides = overridesRaw.overrides ?? overridesRaw;

const fixed = [];
const stillFailed = [];

for (const entry of manifest.entries) {
  const audited = auditManifestEntry(entry, manifest.entries);
  if (audited.ok) continue;

  await sleep(1200);
  let picked = null;
  for (const query of buildQueries(entry)) {
    const candidates = await commonsSearch(query);
    const licensed = candidates.filter((candidate) => licenseAllowed(candidate.license));
    picked = pickRelevantCommonsCandidate(licensed, entry);
    if (picked) break;
  }

  if (!picked) {
    stillFailed.push({ modelKey: entry.modelKey, reasons: audited.reasons });
    console.log('FAIL', entry.modelKey);
    continue;
  }

  const payload = {
    sourceUrl: picked.url,
    sourcePageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(picked.title.replace(/ /g, '_'))}`,
    brand: entry.brand,
    sourceType: 'wikimedia',
    license: picked.license.replace(/<[^>]+>/g, '').trim(),
    author: picked.author.replace(/<[^>]+>/g, '').trim(),
    commonsTitle: picked.title
  };

  if (OFFICIAL_BRANDS.has(entry.brand)) {
    official[entry.modelKey] = payload;
  } else if (WAVE4_BRANDS.has(entry.brand)) {
    official[entry.modelKey] = payload;
  } else {
    overrides[entry.modelKey] = {
      sourceUrl: payload.sourceUrl,
      license: payload.license,
      author: payload.author,
      commonsTitle: payload.commonsTitle,
      sourceType: 'wikimedia'
    };
  }

  entry.sourceUrl = payload.sourceUrl;
  entry.license = payload.license;
  entry.author = payload.author;
  entry.commonsTitle = payload.commonsTitle;
  entry.sourceType = payload.sourceType;

  fixed.push(entry.modelKey);
  console.log('FIX', entry.modelKey, picked.title);
}

fs.writeFileSync(officialPath, JSON.stringify({ entries: official }, null, 2));
fs.writeFileSync(overridesPath, JSON.stringify({ overrides }, null, 2));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(
  reportPath,
  JSON.stringify({ fixed, stillFailed, generatedAt: new Date().toISOString() }, null, 2)
);

console.log(`Fixed ${fixed.length}, still failed ${stillFailed.length}`);
if (stillFailed.length > 0) process.exitCode = 1;
