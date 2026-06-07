import { test, expect } from '@playwright/test';
import { assertGuestDeepLinkAuthGate } from '../fixtures/test-helpers';

test.describe('checkout auth guard', () => {
  test('guest_cannot_deep_link_to_checkout', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/checkout', { reopenSignIn: true });
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('guest_legacy_placeorder_redirects_to_checkout_auth_gate', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/placeorder', {
      resolvedPath: '/checkout',
      reopenSignIn: true
    });
  });

  test('guest_legacy_shipping_redirects_to_checkout_auth_gate', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/shipping', {
      resolvedPath: '/checkout',
      reopenSignIn: true
    });
  });

  test('guest_legacy_payment_redirects_to_checkout_auth_gate', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/payment', {
      resolvedPath: '/checkout',
      reopenSignIn: true
    });
  });

  test('profile_auth_gate_after_modal_dismiss', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/profile', { reopenSignIn: true });
  });

  test('profile_requires_login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="login-register-link"]').click();
    await expect(page.locator('[data-testid="register-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  });
});
