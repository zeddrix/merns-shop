import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPollutedOfficialUrl } from './is-polluted-official-url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = path.join(root, 'catalog-image-official-sources.json');

const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = raw.entries ?? raw;
const polluted = [];

for (const [modelKey, entry] of Object.entries(entries)) {
  if (isPollutedOfficialUrl(entry.sourceUrl)) {
    polluted.push(modelKey);
  }
}

if (polluted.length > 0) {
  console.error(`Polluted official URLs (${polluted.length}):`);
  for (const key of polluted.slice(0, 20)) {
    console.error(`  - ${key}`);
  }
  process.exitCode = 1;
} else {
  console.log(`All ${Object.keys(entries).length} official source URLs pass pollution check.`);
}
