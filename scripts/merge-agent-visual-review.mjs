import fs from 'node:fs';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const reviewPath = catalogImagePaths.reviews.agentVisualReview;

const batchArg = process.argv.find((a) => a.startsWith('--batch='));
const batchFile = process.argv.find((a) => a.endsWith('.json') && !a.startsWith('--'));
if (!batchArg || !batchFile) {
  console.error('Usage: --batch=N path/to/batch-results.json');
  process.exit(1);
}

const batchNum = Number(batchArg.split('=')[1]);
const incoming = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));

for (const row of incoming) {
  review.entries[row.modelKey] = {
    ...row,
    batch: batchNum,
    reviewedAt: new Date().toISOString()
  };
}

const values = Object.values(review.entries);
review.reviewed = values.length;
review.passed = values.filter((r) => r.verdict === 'pass').length;
review.weak = values.filter((r) => r.verdict === 'weak').length;
review.failed = values.filter((r) => r.verdict === 'fail').length;

fs.writeFileSync(reviewPath, JSON.stringify(review, null, 2));
console.log(
  `Merged batch ${batchNum}: ${incoming.length} entries (total ${review.reviewed}, fail ${review.failed})`
);
