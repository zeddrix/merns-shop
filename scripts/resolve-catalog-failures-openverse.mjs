import fs from 'node:fs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const manifestPath = catalogImagePaths.manifest;
const overridesPath = catalogImagePaths.sources.overrides;
const reportPath = catalogImagePaths.reports.resolve;

const OPENVERSE = 'https://api.openverse.org/v1/images/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadOverrides = () => {
  if (!fs.existsSync(overridesPath)) return {};
  const raw = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  return raw.overrides ?? raw;
};

const scoreOpenverse = (result, query) => {
  let score = 0;
  const title = (result.title ?? '').toLowerCase();
  const q = query.toLowerCase();
  if (title.includes(q.split(' ')[0] ?? '')) score += 2;
  if ((result.width ?? 0) >= 600 && (result.height ?? 0) >= 400) score += 3;
  if (result.filetype === 'jpg' || result.filetype === 'jpeg' || result.filetype === 'webp') {
    score += 1;
  }
  if (title.includes('logo') || title.includes('icon') || title.includes('manual')) score -= 5;
  return score;
};

const openverseSearch = async (query) => {
  const params = new URLSearchParams({
    q: query,
    license: 'by,by-sa,cc0,pdm',
    page_size: '10'
  });
  const response = await fetch(`${OPENVERSE}?${params}`);
  if (!response.ok) {
    throw new Error(`Openverse HTTP ${response.status}`);
  }
  const data = await response.json();
  return (data.results ?? [])
    .map((result) => ({ ...result, score: scoreOpenverse(result, query) }))
    .sort((a, b) => b.score - a.score);
};

async function main() {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const overrides = loadOverrides();
  const failed = report.failed ?? [];

  for (const item of failed) {
    const queries = [`${item.brand} ${item.name}`, item.name, item.modelKey.replace(/-/g, ' ')];
    let picked = null;
    for (const query of queries) {
      const candidates = await openverseSearch(query);
      picked = candidates.find((c) => c.score >= 3 && c.url);
      if (picked) break;
      await sleep(400);
    }
    if (picked) {
      overrides[item.modelKey] = {
        sourceUrl: picked.url,
        license: `${picked.license?.toUpperCase() ?? 'CC'} ${picked.license_version ?? ''}`.trim(),
        author: picked.creator ?? '',
        commonsTitle: picked.title ?? picked.foreign_landing_url ?? ''
      };
      const entry = manifest.entries.find((e) => e.modelKey === item.modelKey);
      if (entry) {
        entry.sourceUrl = picked.url;
        entry.license = overrides[item.modelKey].license;
        entry.author = overrides[item.modelKey].author;
        entry.commonsTitle = overrides[item.modelKey].commonsTitle;
      }
      console.log(`OK ${item.modelKey} → ${picked.title}`);
    } else {
      console.log(`FAIL ${item.modelKey}`);
    }
    await sleep(500);
  }

  fs.writeFileSync(overridesPath, JSON.stringify({ overrides }, null, 2));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Openverse overrides: ${Object.keys(overrides).length}`);
}

await main();
