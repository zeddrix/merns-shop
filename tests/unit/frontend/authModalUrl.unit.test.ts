import { describe, expect, it } from 'vitest';
import {
  buildAuthSearch,
  buildAuthUrl,
  buildLoginRedirectUrl,
  buildRegisterRedirectUrl,
  getCatalogSearchString,
  parseAuthModalSearch,
  stripAuthSearch
} from '../../../frontend/src/utils/authModalUrl';

describe('authModalUrl', () => {
  it('parseAuthModalSearch reads auth mode and redirect', () => {
    expect(parseAuthModalSearch('?auth=login&redirect=%2Fshipping')).toEqual({
      mode: 'login',
      redirect: '/shipping'
    });
    expect(parseAuthModalSearch('?auth=register')).toEqual({
      mode: 'register',
      redirect: '/'
    });
    expect(parseAuthModalSearch('')).toEqual({
      mode: null,
      redirect: '/'
    });
  });

  it('buildAuthUrl encodes auth and redirect on pathname', () => {
    expect(buildAuthUrl('/shipping', 'login', '/shipping')).toBe(
      '/shipping?auth=login&redirect=%2Fshipping'
    );
    expect(buildAuthUrl('/', 'register')).toBe('/?auth=register');
  });

  it('stripAuthSearch removes auth query keys', () => {
    expect(stripAuthSearch('?auth=login&redirect=%2Fprofile&brand=Apple')).toBe('?brand=Apple');
    expect(stripAuthSearch('?auth=register')).toBe('');
  });

  it('buildAuthSearch preserves unrelated params', () => {
    expect(buildAuthSearch('login', '/cart', '?brand=Apple')).toBe(
      '?brand=Apple&auth=login&redirect=%2Fcart'
    );
  });

  it('buildLoginRedirectUrl uses auth query instead of login route', () => {
    expect(buildLoginRedirectUrl('/shipping')).toBe('/?auth=login&redirect=%2Fshipping');
    expect(buildLoginRedirectUrl('shipping', '/cart')).toBe(
      '/cart?auth=login&redirect=%2Fshipping'
    );
  });

  it('buildRegisterRedirectUrl uses auth query instead of register route', () => {
    expect(buildRegisterRedirectUrl('/payment')).toBe('/?auth=register&redirect=%2Fpayment');
  });

  it('getCatalogSearchString strips auth params for catalog listKey', () => {
    expect(getCatalogSearchString('?auth=login&brand=Apple')).toBe('brand=Apple');
    expect(getCatalogSearchString('?auth=register')).toBe('');
  });
});
