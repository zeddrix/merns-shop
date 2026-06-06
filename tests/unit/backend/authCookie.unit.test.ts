import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  setAuthCookie
} from '../../../backend/utils/authCookie.js';

describe('authCookie utilities', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('setAuthCookie sets httpOnly cookie with token', () => {
    const res = {
      cookie: vi.fn()
    } as unknown as Response;

    setAuthCookie(res, 'test-jwt-token');

    expect(res.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'test-jwt-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
    );
  });

  it('setAuthCookie uses secure flag in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = {
      cookie: vi.fn()
    } as unknown as Response;

    setAuthCookie(res, 'prod-token');

    expect(res.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'prod-token',
      expect.objectContaining({ secure: true })
    );
  });

  it('clearAuthCookie clears auth cookie', () => {
    const res = {
      clearCookie: vi.fn()
    } as unknown as Response;

    clearAuthCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      })
    );
  });
});
