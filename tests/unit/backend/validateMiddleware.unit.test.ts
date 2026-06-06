import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../../../backend/middleware/validateMiddleware.js';

describe('validateBody middleware', () => {
  it('calls next and assigns parsed body on valid input', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
    const middleware = validateBody(schema);

    const req = { body: { email: 'john@gmail.com', password: '123456' } } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ email: 'john@gmail.com', password: '123456' });
  });

  it('sets 400 and forwards validation message on invalid input', () => {
    const schema = z.object({
      rating: z.coerce.number().min(1).max(5),
      comment: z.string().trim().min(1, 'Comment is required')
    });
    const middleware = validateBody(schema);

    const req = { body: { rating: 0, comment: '' } } as Request;
    const res = { status: vi.fn().mockReturnThis() } as unknown as Response;
    const nextFn = vi.fn();

    middleware(req, res, nextFn);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorArg = nextFn.mock.calls[0]?.[0] as Error | undefined;
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg?.message.length).toBeGreaterThan(0);
  });
});
