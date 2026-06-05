import { test, expect } from '@playwright/test';
import { openProductByExactName, selectVariantAndAddToCart } from '../fixtures/test-helpers';

test.describe('desktop cart popover', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('desktop_cart_popover_lists_items', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page).not.toHaveURL(/\/cart/);
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover-checkout"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover"]')).toContainText('iPhone 15 Pro');
  });
});
