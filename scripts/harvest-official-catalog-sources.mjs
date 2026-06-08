import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { appleAssetCandidates, APPLE_OFFICIAL_SIBLING } from './official-apple-cdn-assets.mjs';
import {
  appleCdnCandidates,
  buildApplePageUrl,
  buildSamsungPageUrl,
  buildSonyPageUrl,
  isReachableImage,
  pickSamsungImageUrl,
  pickSonyImageUrl,
  sleep
} from './official-source-helpers.mjs';
import { isPollutedOfficialUrl } from './is-polluted-official-url.mjs';
import {
  CATEGORY_DONOR_MODEL_KEY,
  SUBCATEGORY_LICENSED_FALLBACK,
  categoryKey,
  donorUrlFromModelKey
} from './official-category-donors.mjs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = catalogImagePaths.manifest;
const officialPath = catalogImagePaths.sources.official;
const reportPath = catalogImagePaths.reports.officialHarvest;

const USER_AGENT = 'merns-shop-catalog/1.0 (educational demo)';
const brandFilter = process.argv.find((arg) => arg.startsWith('--brand='))?.split('=')[1];
const force = process.argv.includes('--force');

const loadExisting = () => {
  if (!fs.existsSync(officialPath)) {
    return { entries: {} };
  }
  const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
  return { entries: raw.entries ?? raw };
};

const saveOfficial = (data) => {
  fs.writeFileSync(officialPath, JSON.stringify(data, null, 2));
};

/** @param {import('./official-source-helpers.mjs').APPLE_CDN_BASES} _ignored */
async function harvestApple(entry, officialEntries) {
  for (const asset of appleAssetCandidates(entry.modelKey)) {
    for (const url of appleCdnCandidates(asset)) {
      if (await isReachableImage(url)) {
        return {
          sourceUrl: url,
          sourcePageUrl: buildApplePageUrl(entry.modelKey, entry.subcategory ?? ''),
          brand: entry.brand
        };
      }
    }
  }
  const siblingKey = APPLE_OFFICIAL_SIBLING[entry.modelKey];
  if (siblingKey && officialEntries[siblingKey]?.sourceUrl) {
    return {
      sourceUrl: officialEntries[siblingKey].sourceUrl,
      sourcePageUrl: buildApplePageUrl(entry.modelKey, entry.subcategory ?? ''),
      brand: entry.brand
    };
  }
  return null;
}

async function harvestSamsung(entry) {
  const pageUrl = buildSamsungPageUrl(entry.modelKey, entry.subcategory ?? '');
  try {
    const response = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const html = await response.text();
    const imageUrl = pickSamsungImageUrl(html, entry.modelKey);
    if (!imageUrl || !(await isReachableImage(imageUrl))) return null;
    return { sourceUrl: imageUrl, sourcePageUrl: pageUrl, brand: entry.brand };
  } catch {
    return null;
  }
}

async function harvestSony(entry) {
  const pageUrl = buildSonyPageUrl(entry.modelKey, entry.subcategory ?? '');
  try {
    const response = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const html = await response.text();
    const imageUrl = pickSonyImageUrl(html);
    if (!imageUrl || !(await isReachableImage(imageUrl))) return null;
    return { sourceUrl: imageUrl, sourcePageUrl: pageUrl, brand: entry.brand };
  } catch {
    return null;
  }
}

async function harvestEntry(entry) {
  if (entry.brand === 'Apple') return harvestApple(entry);
  if (entry.brand === 'Samsung') return harvestSamsung(entry);
  if (entry.brand === 'Sony') return harvestSony(entry);
  return null;
}

async function main() {
  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const official = loadExisting();
  const failed = [];
  const harvested = [];

  let entries = manifest.entries;
  if (brandFilter) {
    entries = entries.filter((entry) => entry.brand.toLowerCase() === brandFilter.toLowerCase());
  }

  for (const entry of entries) {
    if (['Amazon'].includes(entry.brand)) continue;
    const existing = official.entries[entry.modelKey];
    if (existing?.sourceUrl && !force && !isPollutedOfficialUrl(existing.sourceUrl)) {
      continue;
    }
    await sleep(entry.brand === 'Samsung' ? 800 : 300);
    const result =
      entry.brand === 'Apple'
        ? await harvestApple(entry, official.entries)
        : await harvestEntry(entry);
    if (result) {
      official.entries[entry.modelKey] = result;
      harvested.push(entry.modelKey);
      console.log('OK', entry.modelKey);
    } else {
      failed.push({ modelKey: entry.modelKey, brand: entry.brand, name: entry.name });
      console.log('FAIL', entry.modelKey);
    }
    saveOfficial(official);
  }

  for (const item of [...failed]) {
    const entry = entries.find((e) => e.modelKey === item.modelKey);
    if (!entry) continue;

    const key = categoryKey(entry.brand, entry.subcategory ?? '');
    const donorModelKey = CATEGORY_DONOR_MODEL_KEY[key];
    let sourceUrl = donorModelKey ? donorUrlFromModelKey(official.entries, donorModelKey) : null;

    if (!sourceUrl || isPollutedOfficialUrl(sourceUrl)) {
      const licensed = SUBCATEGORY_LICENSED_FALLBACK[key];
      if (licensed) {
        official.entries[entry.modelKey] = {
          sourceUrl: licensed.sourceUrl,
          sourcePageUrl: pageUrlForEntry(entry),
          brand: entry.brand,
          sourceType: 'licensed-fallback'
        };
        harvested.push(entry.modelKey);
        console.log('LICENSED', entry.modelKey);
        continue;
      }
    }

    if (!sourceUrl || isPollutedOfficialUrl(sourceUrl)) continue;

    official.entries[entry.modelKey] = {
      sourceUrl,
      sourcePageUrl: pageUrlForEntry(entry),
      brand: entry.brand,
      sourceType: 'official-category-donor',
      donorModelKey
    };
    harvested.push(entry.modelKey);
    console.log('CATEGORY', entry.modelKey, 'from', donorModelKey);
  }

  function pageUrlForEntry(entry) {
    if (entry.brand === 'Apple') {
      return buildApplePageUrl(entry.modelKey, entry.subcategory ?? '');
    }
    if (entry.brand === 'Samsung') {
      return buildSamsungPageUrl(entry.modelKey, entry.subcategory ?? '');
    }
    return buildSonyPageUrl(entry.modelKey, entry.subcategory ?? '');
  }

  const finalFailed = entries
    .filter((entry) => !['Amazon'].includes(entry.brand))
    .filter((entry) => !official.entries[entry.modelKey]?.sourceUrl)
    .map((entry) => ({ modelKey: entry.modelKey, brand: entry.brand, name: entry.name }));

  saveOfficial(official);
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { harvested, failed: finalFailed, generatedAt: new Date().toISOString() },
      null,
      2
    )
  );
  console.log(`Harvested ${harvested.length}, failed ${finalFailed.length}`);
}

await main();
