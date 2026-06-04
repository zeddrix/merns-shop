import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

vi.mock('../../../backend/models/User.js', () => ({
  default: {
    findById: vi.fn()
  }
}));

import User from '../../../backend/models/User.js';
import { admin } from '../../../backend/middleware/authMiddleware.js';

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

describe('authMiddleware protect user lookup', () => {
  it('User.findById is available', () => {
    expect(User.findById).toBeDefined();
  });
});
