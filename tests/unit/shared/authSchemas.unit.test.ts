import { describe, expect, it } from 'vitest';
import {
  loginUserSchema,
  registerFormSchema,
  registerUserSchema
} from '../../../shared/validators/auth';

describe('shared auth schemas', () => {
  it('registerUserSchema rejects empty name', () => {
    const result = registerUserSchema.safeParse({
      name: '',
      email: 'user@example.com',
      password: '123456'
    });
    expect(result.success).toBe(false);
  });

  it('registerUserSchema rejects invalid email', () => {
    const result = registerUserSchema.safeParse({
      name: 'User',
      email: 'not-an-email',
      password: '123456'
    });
    expect(result.success).toBe(false);
  });

  it('registerUserSchema rejects short password', () => {
    const result = registerUserSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('registerFormSchema rejects mismatched passwords', () => {
    const result = registerFormSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: '123456',
      confirmPassword: '654321'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('confirmPassword'))).toBe(
        true
      );
    }
  });

  it('loginUserSchema requires password', () => {
    const result = loginUserSchema.safeParse({
      email: 'user@example.com',
      password: ''
    });
    expect(result.success).toBe(false);
  });

  it('loginUserSchema accepts valid credentials', () => {
    const result = loginUserSchema.safeParse({
      email: 'user@example.com',
      password: 'secret'
    });
    expect(result.success).toBe(true);
  });
});
