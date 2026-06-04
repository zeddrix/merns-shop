import { describe, expect, it, vi } from 'vitest';
import { notFound, errorHandler } from '../../../backend/middleware/errorMiddleware.js';
import type { NextFunction, Request, Response } from 'express';

describe('errorMiddleware', () => {
  it('notFound sets 404 and forwards error to next', () => {
    const req = { originalUrl: '/missing' } as Request;
    const res = { status: vi.fn().mockReturnThis() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    notFound(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not Found - /missing' }));
  });

  it('errorHandler returns json message', () => {
    const err = new Error('Test error');
    const req = {} as Request;
    const res = {
      statusCode: 400,
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test error' }));
  });
});
