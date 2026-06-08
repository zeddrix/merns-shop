import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'frontend/public');

const { modelKeys } = JSON.parse(fs.readFileSync(catalogImagePaths.prune.severeModelKeys, 'utf8'));
const pruneSet = new Set(modelKeys);

const removeKeysFromObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return 0;
  }
  let removed = 0;
  for (const key of [...Object.keys(obj)]) {
    if (pruneSet.has(key)) {
      delete obj[key];
      removed += 1;
    }
  }
  return removed;
};

const pruneJsonFile = (filePath, mutator) => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const removed = mutator(raw);
  fs.writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`);
  console.log(`${path.relative(root, filePath)}: pruned ${removed} key(s)`);
};

const manifestPath = catalogImagePaths.manifest;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const imagePaths = new Set();

for (const entry of manifest.entries ?? []) {
  if (pruneSet.has(entry.modelKey) && entry.file) {
    imagePaths.add(entry.file);
  }
}

let deletedImages = 0;
for (const webPath of imagePaths) {
  const filePath = path.join(publicDir, webPath.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    deletedImages += 1;
    console.log(`deleted ${webPath}`);
  }
}

pruneJsonFile(catalogImagePaths.sources.official, (raw) => removeKeysFromObject(raw.entries));
pruneJsonFile(catalogImagePaths.sources.webCurated, (raw) => {
  let removed = removeKeysFromObject(raw.direct);
  removed += removeKeysFromObject(raw.commonsByModelKey);
  removed += removeKeysFromObject(raw.files);
  return removed;
});
pruneJsonFile(catalogImagePaths.sources.curated, (raw) => removeKeysFromObject(raw.entries));
pruneJsonFile(catalogImagePaths.sources.overrides, (raw) => removeKeysFromObject(raw.entries));

for (const reportFilePath of [
  catalogImagePaths.reports.audit,
  catalogImagePaths.reports.visualReview,
  catalogImagePaths.reports.searchCurate,
  catalogImagePaths.reports.webCurated,
  catalogImagePaths.reports.fix,
  catalogImagePaths.reviews.agentVisualReview
]) {
  pruneJsonFile(reportFilePath, (raw) => {
    if (Array.isArray(raw.entries)) {
      const before = raw.entries.length;
      raw.entries = raw.entries.filter((entry) => !pruneSet.has(entry.modelKey));
      const removed = before - raw.entries.length;
      if (typeof raw.total === 'number') {
        raw.total = raw.entries.length;
      }
      if (typeof raw.passed === 'number') {
        raw.passed = raw.entries.length;
      }
      if (typeof raw.reviewed === 'number') {
        raw.reviewed = raw.entries.length;
      }
      return removed;
    }
    if (typeof raw.total === 'number' && pruneSet.size > 0) {
      raw.total = Math.max(0, raw.total - pruneSet.size);
      if (typeof raw.reviewed === 'number') {
        raw.reviewed = raw.total;
      }
      return pruneSet.size;
    }
    if (Array.isArray(raw.failed)) {
      const before = raw.failed.length;
      raw.failed = raw.failed.filter((entry) => !pruneSet.has(entry.modelKey));
      return before - raw.failed.length;
    }
    if (Array.isArray(raw.updated)) {
      const before = raw.updated.length;
      raw.updated = raw.updated.filter((entry) => !pruneSet.has(entry.modelKey));
      return before - raw.updated.length;
    }
    return removeKeysFromObject(raw);
  });
}

execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });

const manifestAfter = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const parentCount = manifestAfter.entries.length;

console.log(
  `Pruned ${modelKeys.length} severe SKUs, deleted ${deletedImages} image(s), catalog now has ${parentCount} products.`
);

if (parentCount !== 212) {
  console.error(`Expected 212 catalog parents after prune, got ${parentCount}`);
  process.exit(1);
}
