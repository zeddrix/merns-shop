const PLACEHOLDER_VALUES = new Set([
  'your-paypal-sandbox-client-id',
  'your-paypal-sandbox-buyer-email',
  'your-paypal-sandbox-buyer-password',
  'e2e-placeholder-paypal-client-id',
  'ci-placeholder-paypal-client-id'
]);

function isRealCredential(value: string | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed || PLACEHOLDER_VALUES.has(trimmed)) {
    return false;
  }
  return true;
}

export function hasPayPalSandboxCreds(): boolean {
  return (
    isRealCredential(process.env.PAYPAL_CLIENT_ID) &&
    isRealCredential(process.env.PAYPAL_SANDBOX_BUYER_EMAIL) &&
    isRealCredential(process.env.PAYPAL_SANDBOX_BUYER_PASSWORD)
  );
}

/** Alias used by PayPal E2E specs — runs when real sandbox creds are loaded from `.env.test`. */
export function shouldRunPayPalE2e(): boolean {
  return hasPayPalSandboxCreds();
}

export const payPalSkipReason =
  'PayPal sandbox credentials missing (set PAYPAL_CLIENT_ID, PAYPAL_SANDBOX_BUYER_EMAIL, PAYPAL_SANDBOX_BUYER_PASSWORD in .env.test)';
