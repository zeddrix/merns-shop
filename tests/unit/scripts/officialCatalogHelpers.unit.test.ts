import { describe, expect, it } from 'vitest';
import { isPollutedOfficialUrl } from '../../../scripts/is-polluted-official-url.mjs';
import {
  CATEGORY_DONOR_MODEL_KEY,
  SUBCATEGORY_LICENSED_FALLBACK
} from '../../../scripts/official-category-donors.mjs';

describe('official catalog source helpers', () => {
  it('flags polluted donor URLs', () => {
    expect(isPollutedOfficialUrl('https://example.com/galaxy-s26-ultra.png')).toBe(true);
    expect(
      isPollutedOfficialUrl('https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail')
    ).toBe(false);
    expect(
      isPollutedOfficialUrl(
        'https://store.storeimages.cdn-apple.com/is/iphone-14-finish-select-202209-6-1inch-purple'
      )
    ).toBe(false);
    expect(
      isPollutedOfficialUrl(
        'https://images.samsung.com/is/image/samsung/p6pim/us/s2602/gallery/us-galaxy-s26-ultra'
      )
    ).toBe(true);
    expect(isPollutedOfficialUrl('https://images.samsung.com/galaxy-s24-highlights.jpg')).toBe(
      false
    );
  });

  it('defines category donors for each major brand subcategory', () => {
    expect(CATEGORY_DONOR_MODEL_KEY['Apple:Phones']).toBe('iphone-15');
    expect(CATEGORY_DONOR_MODEL_KEY['Samsung:Phones']).toBe('galaxy-s24');
    expect(CATEGORY_DONOR_MODEL_KEY['Sony:Consoles']).toBe('ps5');
    expect(SUBCATEGORY_LICENSED_FALLBACK['Samsung:Tablets']?.sourceUrl).toMatch(
      /wikimedia|upload\.wikimedia/
    );
  });
});
