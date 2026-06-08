import { describe, expect, it, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import generateToken from '../../../backend/utils/generateToken.js';

describe('generateToken', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  it('returns a valid JWT containing user claims', () => {
    const token = generateToken({
      _id: '507f1f77bcf86cd799439011',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    });
    const decoded = jwt.verify(token, 'unit-test-secret') as {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
    expect(decoded.name).toBe('John');
    expect(decoded.email).toBe('john@gmail.com');
    expect(decoded.isAdmin).toBe(false);
  });
});
