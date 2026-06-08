import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

const jwtVerify = vi.hoisted(() => vi.fn());

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: jwtVerify
  }
}));

import { admin, optionalAuth, protect } from '../../../backend/middleware/authMiddleware.js';
import { AUTH_COOKIE_NAME } from '../../../backend/utils/authCookie.js';

describe('authMiddleware admin', () => {
  it('calls next for admin user', async () => {
    const req = { user: { isAdmin: true } } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await admin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('forwards unauthorized error to next for non-admin user', async () => {
    const req = { user: { isAdmin: false } } as Request;
    const res = { status: vi.fn().mockReturnThis() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await admin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Not authorized') })
    );
  });
});

describe('authMiddleware protect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  it('rejects request without token', async () => {
    const req = { headers: {}, cookies: {} } as Request;
    const res = { status: vi.fn().mockReturnThis() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token' })
    );
  });

  it('attaches user from bearer token claims without database lookup', async () => {
    jwtVerify.mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      cookies: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await protect(req, res, next);

    expect(req.user).toEqual({
      _id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    });
    expect(next).toHaveBeenCalled();
  });

  it('attaches user from auth cookie claims', async () => {
    jwtVerify.mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: true
    });

    const req = {
      headers: {},
      cookies: { [AUTH_COOKIE_NAME]: 'cookie-token' }
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await protect(req, res, next);

    expect(jwtVerify).toHaveBeenCalledWith('cookie-token', 'unit-test-secret');
    expect(req.user?.isAdmin).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it('rejects when token payload is incomplete', async () => {
    jwtVerify.mockReturnValue({ id: '507f1f77bcf86cd799439011' });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      cookies: {}
    } as Request;
    const res = { status: vi.fn().mockReturnThis() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, token failed' })
    );
  });
});

describe('authMiddleware optionalAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  it('calls next without user when no token', async () => {
    const req = { headers: {}, cookies: {} } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('attaches user when token is valid', async () => {
    jwtVerify.mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    });

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      cookies: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await optionalAuth(req, res, next);

    expect(req.user?.email).toBe('john@gmail.com');
    expect(next).toHaveBeenCalled();
  });

  it('continues without user when token is invalid', async () => {
    jwtVerify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const req = {
      headers: { authorization: 'Bearer bad-token' },
      cookies: {}
    } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
