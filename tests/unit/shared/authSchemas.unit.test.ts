import { describe, expect, it } from 'vitest';
import {
  loginUserSchema,
  registerFormSchema,
  registerUserSchema,
  strongPasswordSchema,
  profileFormSchema
} from '../../../shared/validators/auth';

describe('shared auth schemas', () => {
  it('registerUserSchema rejects empty name', () => {
    const result = registerUserSchema.safeParse({
      name: '',
      email: 'user@example.com',
      password: 'TestPass1!'
    });
    expect(result.success).toBe(false);
  });

  it('registerUserSchema rejects invalid email', () => {
    const result = registerUserSchema.safeParse({
      name: 'User',
      email: 'not-an-email',
      password: 'TestPass1!'
    });
    expect(result.success).toBe(false);
  });

  it('registerUserSchema rejects weak password', () => {
    const result = registerUserSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: '12345'
    });
    expect(result.success).toBe(false);
  });

  it('registerUserSchema accepts strong password', () => {
    const result = registerUserSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'TestPass1!'
    });
    expect(result.success).toBe(true);
  });

  it('strongPasswordSchema requires mixed character classes', () => {
    expect(strongPasswordSchema.safeParse('TestPass1!').success).toBe(true);
    expect(strongPasswordSchema.safeParse('testpass1!').success).toBe(false);
    expect(strongPasswordSchema.safeParse('TestPass!').success).toBe(false);
  });

  it('registerFormSchema rejects mismatched passwords', () => {
    const result = registerFormSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'TestPass1!',
      confirmPassword: 'WrongPass1!'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('confirmPassword'))).toBe(
        true
      );
    }
  });

  it('profileFormSchema allows empty password', () => {
    const result = profileFormSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: '',
      confirmPassword: ''
    });
    expect(result.success).toBe(true);
  });

  it('profileFormSchema rejects weak non-empty password', () => {
    const result = profileFormSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: '123456',
      confirmPassword: '123456'
    });
    expect(result.success).toBe(false);
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
