import { afterEach, describe, expect, it } from 'vitest';
import {
  hasPayPalSandboxCreds,
  payPalSkipReason,
  shouldRunPayPalE2e
} from '../../e2e/fixtures/paypal-env';

describe('paypal-env', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns false for placeholder credentials', () => {
    process.env.PAYPAL_CLIENT_ID = 'your-paypal-sandbox-client-id';
    process.env.PAYPAL_SANDBOX_BUYER_EMAIL = 'your-sandbox-buyer@email.com';
    process.env.PAYPAL_SANDBOX_BUYER_PASSWORD = 'your-sandbox-buyer-password';

    expect(hasPayPalSandboxCreds()).toBe(false);
    expect(shouldRunPayPalE2e()).toBe(false);
  });

  it('returns true when all sandbox credentials are real', () => {
    process.env.PAYPAL_CLIENT_ID = 'Abcd1234-live-client-id';
    process.env.PAYPAL_SANDBOX_BUYER_EMAIL = 'buyer@personal.example.com';
    process.env.PAYPAL_SANDBOX_BUYER_PASSWORD = 'sandbox-secret';

    expect(hasPayPalSandboxCreds()).toBe(true);
    expect(shouldRunPayPalE2e()).toBe(true);
  });

  it('exposes a skip reason message for missing credentials', () => {
    delete process.env.PAYPAL_CLIENT_ID;
    expect(payPalSkipReason).toMatch(/credentials missing/i);
  });
});
