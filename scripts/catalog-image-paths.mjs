import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.join(scriptsDir, '..');
export const catalogImagesRoot = path.join(repoRoot, 'catalog', 'images');

export const catalogImagePaths = {
  manifest: path.join(catalogImagesRoot, 'manifest.json'),
  sources: {
    official: path.join(catalogImagesRoot, 'sources', 'official.json'),
    curated: path.join(catalogImagesRoot, 'sources', 'curated.json'),
    webCurated: path.join(catalogImagesRoot, 'sources', 'web-curated.json'),
    overrides: path.join(catalogImagesRoot, 'sources', 'overrides.json')
  },
  prune: {
    severeModelKeys: path.join(catalogImagesRoot, 'prune', 'severe-model-keys.json')
  },
  reviews: {
    agentVisualReview: path.join(catalogImagesRoot, 'reviews', 'agent-visual-review.json')
  },
  reports: {
    audit: path.join(catalogImagesRoot, 'reports', 'audit-report.json'),
    visualReview: path.join(catalogImagesRoot, 'reports', 'visual-review.json'),
    fix: path.join(catalogImagesRoot, 'reports', 'fix-report.json'),
    resolve: path.join(catalogImagesRoot, 'reports', 'resolve-report.json'),
    searchCurate: path.join(catalogImagesRoot, 'reports', 'search-curate-report.json'),
    webCurated: path.join(catalogImagesRoot, 'reports', 'web-curated-report.json'),
    officialHarvest: path.join(catalogImagesRoot, 'reports', 'official-harvest-report.json'),
    officialResolve: path.join(catalogImagesRoot, 'reports', 'official-resolve-report.json'),
    officialRepair: path.join(catalogImagesRoot, 'reports', 'official-repair-report.json'),
    repair: path.join(catalogImagesRoot, 'reports', 'repair-report.json'),
    wave4Harvest: path.join(catalogImagesRoot, 'reports', 'wave4-harvest-report.json')
  }
};
