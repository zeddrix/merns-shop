import { describe, expect, it } from 'vitest';
import {
  authModalReducer,
  closeAuthModal,
  openLogin,
  openRegister,
  setAuthModalFromUrl,
  switchAuthMode
} from '../../../frontend/src/features/authModalSlice';

describe('authModalSlice', () => {
  it('openLogin opens modal in login mode', () => {
    const state = authModalReducer(undefined, openLogin('/shipping'));
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('login');
    expect(state.redirectPath).toBe('/shipping');
  });

  it('openRegister opens modal in register mode with default redirect', () => {
    const state = authModalReducer(undefined, openRegister(undefined));
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('register');
    expect(state.redirectPath).toBe('/');
  });

  it('closeAuthModal closes without resetting mode', () => {
    const open = authModalReducer(undefined, openLogin());
    const closed = authModalReducer(open, closeAuthModal());
    expect(closed.isOpen).toBe(false);
    expect(closed.mode).toBe('login');
  });

  it('switchAuthMode changes mode while staying open', () => {
    const open = authModalReducer(undefined, openLogin());
    const switched = authModalReducer(open, switchAuthMode('register'));
    expect(switched.isOpen).toBe(true);
    expect(switched.mode).toBe('register');
  });

  it('setAuthModalFromUrl syncs from URL parse result', () => {
    const state = authModalReducer(
      undefined,
      setAuthModalFromUrl({ mode: 'login', redirect: '/profile' })
    );
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('login');
    expect(state.redirectPath).toBe('/profile');
  });
});
