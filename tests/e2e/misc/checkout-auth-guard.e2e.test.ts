import { test, expect } from '@playwright/test';
import { assertGuestDeepLinkAuthGate } from '../fixtures/test-helpers';

test.describe('checkout auth guard', () => {
  test('guest_cannot_deep_link_to_placeorder', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/placeorder', { reopenSignIn: true });
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_shipping', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/shipping', { reopenSignIn: true });
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('guest_cannot_deep_link_to_payment', async ({ page }) => {
    await assertGuestDeepLinkAuthGate(page, '/payment', { reopenSignIn: true });
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
