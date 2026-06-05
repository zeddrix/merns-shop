import { describe, expect, it } from 'vitest';
import { enrichDescription } from '../../../backend/data/catalog/copy.js';
import { getCatalogDrafts } from '../../../backend/data/catalog/index.js';

describe('catalog copy', () => {
  it('enriches_every_parent_description', () => {
    for (const parent of getCatalogDrafts()) {
      const description = enrichDescription(parent);
      expect(description.length).toBeGreaterThan(120);
      expect(description).toContain(parent.brand);
      expect(description).toContain(parent.name);
    }
  });
});
