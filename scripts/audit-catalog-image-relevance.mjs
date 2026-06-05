import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditManifestEntry } from './catalog-image-relevance.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const reportPath = path.join(root, 'catalog-image-audit-report.json');

/** URLs intentionally shared across products (category fallbacks). */
const ALLOWED_DUPLICATE_URLS = new Set([
  'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
  'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
  'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f8/Sony_WF-1000XM4.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
  'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Tab_S9.png',
  'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Watch_4.jpg'
]);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = manifest.entries ?? [];

const results = entries.map((entry) => auditManifestEntry(entry, entries, ALLOWED_DUPLICATE_URLS));
const failures = results.filter((result) => !result.ok);

const report = {
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
  results
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(
  `Catalog image audit: ${report.passed}/${report.total} passed, ${report.failed} failed.`
);
console.log(`Report: ${reportPath}`);

if (failures.length > 0) {
  for (const failure of failures.slice(0, 25)) {
    console.error(`  FAIL ${failure.modelKey}: ${failure.reasons.join('; ')}`);
  }
  if (failures.length > 25) {
    console.error(`  ... and ${failures.length - 25} more`);
  }
  process.exitCode = 1;
}
