import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  catalogImagePaths,
  catalogImagesRoot,
  repoRoot
} from '../../../scripts/catalog-image-paths.mjs';

describe('catalog image paths', () => {
  it('resolves repo root and catalog/images directory', () => {
    expect(repoRoot).toBe(path.join(process.cwd()));
    expect(catalogImagesRoot).toBe(path.join(process.cwd(), 'catalog', 'images'));
  });

  it('maps manifest and source files under catalog/images', () => {
    expect(catalogImagePaths.manifest).toBe(path.join(catalogImagesRoot, 'manifest.json'));
    expect(catalogImagePaths.sources.official).toBe(
      path.join(catalogImagesRoot, 'sources', 'official.json')
    );
    expect(catalogImagePaths.sources.curated).toBe(
      path.join(catalogImagesRoot, 'sources', 'curated.json')
    );
    expect(catalogImagePaths.sources.webCurated).toBe(
      path.join(catalogImagesRoot, 'sources', 'web-curated.json')
    );
    expect(catalogImagePaths.sources.overrides).toBe(
      path.join(catalogImagesRoot, 'sources', 'overrides.json')
    );
  });

  it('maps report files under catalog/images/reports', () => {
    expect(catalogImagePaths.reports.audit).toBe(
      path.join(catalogImagesRoot, 'reports', 'audit-report.json')
    );
    expect(catalogImagePaths.reports.visualReview).toBe(
      path.join(catalogImagesRoot, 'reports', 'visual-review.json')
    );
    expect(catalogImagePaths.reports.resolve).toBe(
      path.join(catalogImagesRoot, 'reports', 'resolve-report.json')
    );
  });

  it('committed pipeline JSON files exist at resolved paths', () => {
    const requiredPaths = [
      catalogImagePaths.manifest,
      catalogImagePaths.sources.official,
      catalogImagePaths.sources.curated,
      catalogImagePaths.sources.webCurated,
      catalogImagePaths.sources.overrides,
      catalogImagePaths.prune.severeModelKeys,
      catalogImagePaths.reviews.agentVisualReview,
      catalogImagePaths.reports.audit,
      catalogImagePaths.reports.visualReview
    ];

    for (const filePath of requiredPaths) {
      expect(fs.existsSync(filePath), `missing ${path.relative(process.cwd(), filePath)}`).toBe(
        true
      );
    }
  });
});
