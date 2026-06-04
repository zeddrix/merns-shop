import { describe, expect, it, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import generateToken from '../../../backend/utils/generateToken.js';

describe('generateToken', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  it('returns a valid JWT containing user id', () => {
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.verify(token, 'unit-test-secret') as { id: string };
    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
  });
});
