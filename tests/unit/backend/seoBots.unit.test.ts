import { describe, expect, it } from 'vitest';
import { isSeoBot } from '../../../backend/utils/seoBots.js';

describe('seoBots', () => {
  it('detects Facebook crawler', () => {
    expect(isSeoBot('facebookexternalhit/1.1')).toBe(true);
  });

  it('rejects normal browser agents', () => {
    expect(
      isSeoBot(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      )
    ).toBe(false);
  });
});
