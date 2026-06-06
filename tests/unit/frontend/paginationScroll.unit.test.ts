import { describe, expect, it, beforeEach } from 'vitest';
import {
  consumePaginationScrollTarget,
  hasPaginationScrollTarget,
  markPaginationScrollTarget
} from '../../../frontend/src/utils/paginationScroll';

describe('paginationScroll', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('marks_and_consumes_matching_scroll_target', () => {
    markPaginationScrollTarget('home-heading');
    expect(hasPaginationScrollTarget('home-heading')).toBe(true);
    expect(consumePaginationScrollTarget('home-heading')).toBe(true);
    expect(hasPaginationScrollTarget('home-heading')).toBe(false);
  });

  it('does_not_consume_mismatched_scroll_target', () => {
    markPaginationScrollTarget('home-heading');
    expect(consumePaginationScrollTarget('admin-product-list-heading')).toBe(false);
    expect(hasPaginationScrollTarget('home-heading')).toBe(true);
  });
});
