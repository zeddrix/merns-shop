import { describe, expect, it } from 'vitest';
import {
  buildCatalogSrcSet,
  catalogVariantPath,
  CATALOG_IMAGE_WIDTHS
} from '../../../frontend/src/utils/catalogImage';

describe('catalogImage', () => {
  it('builds width variant paths', () => {
    expect(catalogVariantPath('/images/catalog/apple/iphone.webp', 400)).toBe(
      '/images/catalog/apple/iphone-400.webp'
    );
    expect(catalogVariantPath('/images/catalog/apple/iphone.webp', 1200)).toBe(
      '/images/catalog/apple/iphone.webp'
    );
  });

  it('builds srcset for all catalog widths', () => {
    const srcSet = buildCatalogSrcSet('/images/catalog/apple/iphone.webp');
    for (const width of CATALOG_IMAGE_WIDTHS) {
      expect(srcSet).toContain(`${width}w`);
    }
  });
});
