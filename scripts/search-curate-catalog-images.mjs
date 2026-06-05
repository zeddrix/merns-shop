import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import {
  auditManifestEntry,
  pickRelevantCommonsCandidate,
  scoreManifestEntryRelevance
} from './catalog-image-relevance.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
const reportPath = path.join(root, 'catalog-image-search-curate-report.json');

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const OPENVERSE = 'https://api.openverse.org/v1/images/';
const RATE_MS = 1200;

const DONOR_TYPES = new Set([
  'official-category-donor',
  'wikimedia-category-donor',
  'wikimedia-sibling',
  'licensed-fallback',
  'sibling',
  'category-donor'
]);

/** Shared fallback URLs that must never be re-selected. */
const BLOCKED_SOURCE_URLS = new Set([
  'https://upload.wikimedia.org/wikipedia/commons/d/d2/Apple_iPhone_13_Pro_on_MacBook_Pro_05.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Tab_S9.png',
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/PlayStation_5_and_DualSense_controller.jpg'
]);

/** Hand-picked Commons files that match Google Images “product hero” results. */
const CURATED_COMMONS_FILES = {
  'iphone-11': 'File:IPhone 11 all color.jpg',
  'iphone-11-pro': 'File:IPhone 11 Pro.jpg',
  'iphone-12': 'File:IPhone 12.jpg',
  'iphone-13': 'File:IPhone 13.jpg',
  'iphone-14': 'File:Back of iPhone 14.jpg',
  'iphone-15': 'File:IPhone15.jpg',
  'iphone-17': 'File:Sage iPhone 17.jpg',
  'iphone-17-pro': 'File:IPhone 17 Pro (Deep Blue model).jpg',
  'iphone-17-pro-max': 'File:IPhone 17 Pro Max (logo).png',
  'iphone-17-air': 'File:IPhone 17, Air, 17 Pro, and Pro max.jpg',
  'iphone-16e': 'File:IPhone 16e.jpg',
  'galaxy-tab-s7': 'File:Samsung Galaxy Tab S7.jpg',
  'galaxy-tab-s8': 'File:Galaxy Tab S8.png',
  'galaxy-tab-s9': 'File:Samsung Galaxy Tab S9.png',
  'galaxy-tab-s9-ultra': 'File:Samsung Galaxy Tab S9.png',
  'galaxy-tab-s10-plus': 'File:Samsung Galaxy Tab S9.png',
  'galaxy-s24': 'File:Samsung S24 Ultra Phone.png',
  'galaxy-s24-ultra': 'File:Samsung S24 Ultra Phone.png',
  'vivo-x50-pro': 'File:Vivo X50 Pro.jpg',
  'vivo-x51': 'File:Vivo X50 Pro.jpg',
  ps5: 'File:PlayStation 5 and DualSense controller.jpg',
  'ps5-slim': 'File:PlayStation 5 Slim.png',
  'xiaomi-13': 'File:Xiaomi 13.jpg',
  'poco-f3': 'File:POCO F3.jpg'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const licenseAllowed = (licenseShort) => {
  if (!licenseShort) return false;
  const normalized = licenseShort.toLowerCase();
  return ['cc-by', 'cc by', 'cc-by-sa', 'cc by-sa', 'cc0', 'public domain', 'pd', 'gfdl'].some(
    (allowed) => normalized.includes(allowed)
  );
};

/** @param {string} searchTerm */
async function commonsSearch(searchTerm) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1400'
  });

  const response = await fetch(`${COMMONS_API}?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  const pages = data.query?.pages ?? {};

  return Object.values(pages)
    .filter((page) => page.imageinfo?.[0])
    .map((page) => {
      const info = page.imageinfo[0];
      const ext = info.extmetadata ?? {};
      return {
        title: page.title,
        url: info.url,
        width: info.width,
        height: info.height,
        license: ext.LicenseShortName?.value ?? '',
        author: ext.Artist?.value ?? ext.Credit?.value ?? ''
      };
    })
    .filter((candidate) => licenseAllowed(candidate.license) || candidate.license === '');
}

/** @param {string} fileTitle e.g. File:IPhone 11.jpg */
async function commonsFileByTitle(fileTitle) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '1400'
  });
  const response = await fetch(`${COMMONS_API}?${params}`);
  if (!response.ok) return null;
  const data = await response.json();
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  const ext = info.extmetadata ?? {};
  return {
    title: page.title,
    url: info.url,
    width: info.width,
    height: info.height,
    license: ext.LicenseShortName?.value ?? 'CC BY-SA 4.0',
    author: ext.Artist?.value ?? ext.Credit?.value ?? ''
  };
}

/** @param {string} categoryTitle */
async function commonsCategoryFiles(categoryTitle) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    list: 'categorymembers',
    cmtitle: categoryTitle,
    cmtype: 'file',
    cmlimit: '30'
  });
  const response = await fetch(`${COMMONS_API}?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  const members = data.query?.categorymembers ?? [];
  const files = [];
  for (const member of members) {
    if (!member.title?.startsWith('File:')) continue;
    if (member.title.toLowerCase().includes('.svg')) continue;
    const file = await commonsFileByTitle(member.title);
    if (file) files.push(file);
    await sleep(200);
  }
  return files;
}

function commonsCategoryForEntry(entry) {
  const name = entry.name.replace(/\s+/g, '_');
  if (entry.brand === 'Apple' && entry.name.startsWith('iPhone')) {
    return `Category:${entry.name.replace(/ /g, '_')}`;
  }
  if (entry.brand === 'Apple' && entry.name.startsWith('iPad')) {
    return `Category:${entry.name.replace(/ /g, '_')}`;
  }
  if (entry.brand === 'Samsung' && entry.name.includes('Galaxy Tab')) {
    const tab = entry.name.replace('Samsung ', '').replace(/ /g, '_');
    return `Category:Samsung_${tab}`;
  }
  if (entry.brand === 'Samsung' && entry.name.startsWith('Galaxy')) {
    const model = entry.name.replace(/ /g, '_');
    return `Category:Samsung_${model}`;
  }
  if (entry.brand === 'Sony' && entry.name.startsWith('PlayStation')) {
    return 'Category:PlayStation_5';
  }
  if (entry.brand === 'Vivo') {
    return `Category:${name}`;
  }
  return null;
}

/** @param {object} entry */
function buildSearchQueries(entry) {
  const { brand, name, modelKey, subcategory } = entry;
  const spaced = modelKey.replace(/-/g, ' ');
  const queries = [
    `${name} product photo`,
    `${name} smartphone`,
    `${brand} ${name}`,
    `${name} back`,
    `${name} front`,
    name,
    spaced,
    `File:${name.replace(/ /g, '_')}.jpg`,
    `File:${name.replace(/ /g, '_')}.png`
  ];

  if (subcategory === 'Tablets') {
    queries.unshift(`${name} tablet`, `${name} product`, `${spaced} tablet`);
  }
  if (subcategory === 'TVs') {
    queries.unshift(`${name} television`, `${name} TV`, `${brand} ${name} TV`);
  }
  if (subcategory === 'Consoles') {
    queries.unshift(`${name} console`, `PlayStation 5 console`, `${name} product`);
  }
  if (subcategory === 'Audio') {
    queries.unshift(`${name} headphones`, `${name} earbuds`, `${name} audio`);
  }
  if (subcategory === 'Wearables') {
    queries.unshift(`${name} watch`, `${name} smartwatch`);
  }
  if (brand === 'Xiaomi' || brand === 'Vivo') {
    queries.unshift(`${name} phone`, `${brand} ${name} smartphone`);
  }

  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
}

/** @param {string} query */
async function openverseSearch(query) {
  const params = new URLSearchParams({
    q: query,
    license: 'by,by-sa,cc0,pdm',
    page_size: '12'
  });
  const response = await fetch(`${OPENVERSE}?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results ?? []).map((result) => ({
    title: result.title ?? result.id ?? '',
    url: result.url,
    width: result.width,
    height: result.height,
    license: `${result.license?.toUpperCase() ?? 'CC'} ${result.license_version ?? ''}`.trim(),
    author: result.creator ?? ''
  }));
}

function manifestWithCandidate(allEntries, entry, picked, sourceType) {
  return allEntries.map((row) =>
    row.modelKey === entry.modelKey
      ? {
          ...row,
          sourceUrl: picked.url,
          commonsTitle: picked.title,
          sourceType
        }
      : row
  );
}

function filterCandidates(candidates) {
  return candidates.filter((candidate) => !BLOCKED_SOURCE_URLS.has(candidate.url));
}

function shouldReplace(entry, force) {
  if (force) return true;
  if (DONOR_TYPES.has(entry.sourceType ?? '')) return true;
  const relevance = scoreManifestEntryRelevance(entry);
  return !relevance.ok;
}

function toOfficialRecord(entry, picked, sourceType = 'wikimedia-search') {
  const commonsTitle = picked.title?.startsWith('File:')
    ? picked.title
    : picked.title
      ? `File:${picked.title}`
      : '';
  return {
    sourceUrl: picked.url,
    sourcePageUrl: commonsTitle
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(commonsTitle.replace(/ /g, '_'))}`
      : (picked.foreign_landing_url ?? ''),
    brand: entry.brand,
    sourceType,
    license: (picked.license ?? 'CC BY-SA 4.0').replace(/<[^>]+>/g, '').trim(),
    author: (picked.author ?? '').replace(/<[^>]+>/g, '').trim(),
    commonsTitle: commonsTitle || picked.title || ''
  };
}

async function curateEntry(entry) {
  const curatedFile = CURATED_COMMONS_FILES[entry.modelKey];
  if (curatedFile) {
    const file = await commonsFileByTitle(curatedFile);
    if (file) {
      const audit = auditManifestEntry(
        {
          ...entry,
          sourceUrl: file.url,
          commonsTitle: file.title,
          sourceType: 'wikimedia-curated'
        },
        []
      );
      if (audit.ok) {
        return { picked: file, sourceType: 'wikimedia-curated', via: 'curated-file' };
      }
    }
  }

  const category = commonsCategoryForEntry(entry);
  if (category) {
    const categoryFiles = filterCandidates(await commonsCategoryFiles(category));
    const picked = pickRelevantCommonsCandidate(categoryFiles, entry);
    if (picked) {
      return { picked, sourceType: 'wikimedia-category', via: category };
    }
  }

  for (const query of buildSearchQueries(entry)) {
    const candidates = filterCandidates(await commonsSearch(query));
    const licensed = candidates.filter((c) => licenseAllowed(c.license) || c.license === '');
    const picked = pickRelevantCommonsCandidate(licensed, entry);
    if (picked) {
      return { picked, sourceType: 'wikimedia-search', via: `commons:${query}` };
    }
    await sleep(RATE_MS);
  }

  for (const query of buildSearchQueries(entry).slice(0, 4)) {
    const candidates = filterCandidates(await openverseSearch(query));
    const picked = pickRelevantCommonsCandidate(candidates, entry);
    if (picked) {
      return { picked, sourceType: 'openverse-search', via: `openverse:${query}` };
    }
    await sleep(400);
  }

  return null;
}

async function main() {
  const force = process.argv.includes('--force');
  const modelFilter = process.argv.find((arg) => arg.startsWith('--model='))?.split('=')[1];

  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
  const officialEntries = officialRaw.entries ?? officialRaw;

  const report = { updated: [], skipped: [], failed: [], generatedAt: new Date().toISOString() };

  let entries = manifest.entries;
  if (modelFilter) {
    entries = entries.filter((entry) => entry.modelKey === modelFilter);
  } else if (!force) {
    entries = entries.filter((entry) => shouldReplace(entry, false));
  }

  console.log(`Curating ${entries.length} products…`);

  for (const entry of entries) {
    const current = officialEntries[entry.modelKey];
    const currentAudit = current
      ? auditManifestEntry(
          {
            ...entry,
            sourceUrl: current.sourceUrl,
            commonsTitle: current.commonsTitle,
            sourceType: current.sourceType
          },
          manifest.entries
        )
      : { ok: false, score: -1 };

    const result = await curateEntry(entry);
    if (!result) {
      report.failed.push({ modelKey: entry.modelKey, name: entry.name });
      console.log('FAIL', entry.modelKey);
      continue;
    }

    const candidateAudit = auditManifestEntry(
      {
        ...entry,
        sourceUrl: result.picked.url,
        commonsTitle: result.picked.title,
        sourceType: result.sourceType
      },
      manifestWithCandidate(manifest.entries, entry, result.picked, result.sourceType)
    );

    if (!candidateAudit.ok) {
      report.failed.push({
        modelKey: entry.modelKey,
        name: entry.name,
        reasons: candidateAudit.reasons
      });
      console.log('REJECT', entry.modelKey, candidateAudit.reasons.join('; '));
      continue;
    }

    const currentIsDonor = DONOR_TYPES.has(current?.sourceType ?? entry.sourceType ?? '');
    if (
      current &&
      !currentIsDonor &&
      candidateAudit.score <= currentAudit.score &&
      currentAudit.ok
    ) {
      report.skipped.push({ modelKey: entry.modelKey, reason: 'existing score equal or better' });
      console.log('SKIP', entry.modelKey);
      continue;
    }

    officialEntries[entry.modelKey] = toOfficialRecord(entry, result.picked, result.sourceType);
    report.updated.push({
      modelKey: entry.modelKey,
      via: result.via,
      title: result.picked.title,
      score: candidateAudit.score
    });
    console.log('OK', entry.modelKey, result.via, result.picked.title);
    await sleep(RATE_MS);
  }

  fs.writeFileSync(officialPath, JSON.stringify({ entries: officialEntries }, null, 2));
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(
    `Updated ${report.updated.length}, skipped ${report.skipped.length}, failed ${report.failed.length}`
  );
}

await main();
