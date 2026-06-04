import { describe, expect, it } from 'vitest';
import {
  buildLoginRedirectUrl,
  buildRegisterRedirectUrl,
  getRedirectPath,
  isRegisterWelcomeState,
  normalizeRedirectPath
} from '../../../frontend/src/utils/authRedirect';

describe('authRedirect', () => {
  it('normalizeRedirectPath adds leading slash', () => {
    expect(normalizeRedirectPath('shipping')).toBe('/shipping');
    expect(normalizeRedirectPath('/profile')).toBe('/profile');
  });

  it('getRedirectPath returns slash for missing redirect', () => {
    expect(getRedirectPath('')).toBe('/');
    expect(getRedirectPath('?foo=bar')).toBe('/');
  });

  it('getRedirectPath normalizes redirect query', () => {
    expect(getRedirectPath('?redirect=shipping')).toBe('/shipping');
    expect(getRedirectPath('?redirect=%2Fshipping')).toBe('/shipping');
  });

  it('buildLoginRedirectUrl encodes redirect path', () => {
    expect(buildLoginRedirectUrl('/shipping')).toBe('/login?redirect=%2Fshipping');
    expect(buildLoginRedirectUrl('shipping')).toBe('/login?redirect=%2Fshipping');
  });

  it('buildRegisterRedirectUrl encodes redirect path', () => {
    expect(buildRegisterRedirectUrl('/payment')).toBe('/register?redirect=%2Fpayment');
  });

  it('isRegisterWelcomeState validates location state', () => {
    expect(isRegisterWelcomeState({ registerWelcome: 'Jane' })).toBe(true);
    expect(isRegisterWelcomeState({ registerWelcome: '' })).toBe(false);
    expect(isRegisterWelcomeState(null)).toBe(false);
    expect(isRegisterWelcomeState({ other: 'x' })).toBe(false);
  });
});
