import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPollutedOfficialUrl } from './is-polluted-official-url.mjs';
import { SUBCATEGORY_LICENSED_FALLBACK, categoryKey } from './official-category-donors.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = path.join(root, 'catalog-image-official-sources.json');

const PLAYSTATION_PS5 =
  'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21';

const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = raw.entries ?? raw;
let fixed = 0;

for (const [modelKey, entry] of Object.entries(entries)) {
  let nextUrl = null;

  if (modelKey.startsWith('galaxy-tab-')) {
    nextUrl = SUBCATEGORY_LICENSED_FALLBACK[categoryKey('Samsung', 'Tablets')].sourceUrl;
  } else if (['ps4-slim', 'ps4-pro', 'ps5', 'ps5-slim', 'ps5-pro'].includes(modelKey)) {
    nextUrl = PLAYSTATION_PS5;
  } else if (modelKey.startsWith('poco-') && entry.sourceUrl?.includes('404')) {
    nextUrl = entries['poco-f3']?.sourceUrl;
  }

  if (
    !nextUrl &&
    (isPollutedOfficialUrl(entry.sourceUrl) ||
      entry.sourceUrl?.includes('Samsung_Galaxy_Tab_S6_Lite') ||
      entry.sourceUrl?.includes('PS5_console_transparent'))
  ) {
    if (modelKey.startsWith('galaxy-tab-')) {
      nextUrl = SUBCATEGORY_LICENSED_FALLBACK[categoryKey('Samsung', 'Tablets')].sourceUrl;
    } else if (modelKey.startsWith('ps')) {
      nextUrl = PLAYSTATION_PS5;
    }
  }

  if (nextUrl && entry.sourceUrl !== nextUrl) {
    entry.sourceUrl = nextUrl;
    fixed += 1;
  }
}

for (const modelKey of ['poco-x3', 'poco-x4-pro']) {
  const donor = entries['poco-f3'];
  if (donor?.sourceUrl && entries[modelKey]) {
    entries[modelKey].sourceUrl = donor.sourceUrl;
    entries[modelKey].sourceType = 'wikimedia-category-donor';
    entries[modelKey].donorModelKey = 'poco-f3';
    fixed += 1;
  }
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
console.log(`Fixed ${fixed} broken official URLs.`);
