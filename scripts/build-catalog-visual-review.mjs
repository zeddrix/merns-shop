import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalogImageFile } from './catalog-image-quality.mjs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = catalogImagePaths.manifest;
const auditPath = catalogImagePaths.reports.audit;
const outPath = catalogImagePaths.reports.visualReview;

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const auditByKey = new Map(audit.results.map((row) => [row.modelKey, row]));

const entries = [];
let failed = 0;

for (const item of manifest.entries) {
  const diskPath = path.join(root, 'frontend/public', item.file.replace(/^\//, ''));
  let fileOk = false;
  let fileReason = 'missing file';
  if (fs.existsSync(diskPath)) {
    const check = await validateCatalogImageFile(diskPath);
    fileOk = check.ok;
    fileReason = check.ok ? 'valid canvas webp' : (check.reason ?? 'invalid file');
  }

  const audited = auditByKey.get(item.modelKey);
  const metadataOk = audited?.ok ?? false;
  const pass = fileOk && metadataOk;
  if (!pass) failed += 1;

  entries.push({
    modelKey: item.modelKey,
    name: item.name,
    brand: item.brand,
    subcategory: item.subcategory,
    file: item.file,
    status: pass ? 'pass' : 'fail',
    reason: pass ? 'audit+file validation pass' : `${fileReason}; audit=${metadataOk}`,
    reviewedAt: new Date().toISOString()
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  total: entries.length,
  passed: entries.length - failed,
  failed,
  entries
};

fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Visual review file: ${outPath} (${report.passed}/${report.total} pass)`);
if (failed > 0) process.exitCode = 1;
