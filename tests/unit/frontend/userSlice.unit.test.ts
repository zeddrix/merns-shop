import { describe, expect, it } from 'vitest';
import { login, logout } from '../../../frontend/src/features/userSlice';

describe('userSlice action types', () => {
  it('login async thunk has expected type prefix', () => {
    expect(login.pending.type).toBe('userLogin/login/pending');
    expect(login.fulfilled.type).toBe('userLogin/login/fulfilled');
  });

  it('logout async thunk has expected type prefix', () => {
    expect(logout.pending.type).toBe('user/logout/pending');
  });
});
