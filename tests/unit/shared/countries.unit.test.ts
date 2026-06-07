import { describe, expect, it } from 'vitest';
import { COUNTRY_NAMES, countryOptions } from '../../../shared/constants/countries';

describe('countries constants', () => {
  it('country list is non-empty and sorted', () => {
    expect(COUNTRY_NAMES.length).toBeGreaterThan(100);
    const sorted = [...COUNTRY_NAMES].sort((a, b) => a.localeCompare(b));
    expect(COUNTRY_NAMES).toEqual(sorted);
  });

  it('country options have no duplicate values', () => {
    const values = countryOptions.map((option) => option.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes Philippines and United States', () => {
    expect(COUNTRY_NAMES).toContain('Philippines');
    expect(COUNTRY_NAMES).toContain('United States');
  });
});
