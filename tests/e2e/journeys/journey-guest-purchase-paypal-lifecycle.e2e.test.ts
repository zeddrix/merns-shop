import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
  loginWithCredentials
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';
import { resetE2eDatabase } from '../fixtures/reset-db';

test.describe('journey guest purchase lifecycle', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test('guest_completes_checkout_after_login_prompt', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.locator('[data-testid="nav-cart"]').click();
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/\/login\?redirect=shipping/);
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/shipping/);

    await completeShippingStep(page);
    await completePaymentStep(page);
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });
});
