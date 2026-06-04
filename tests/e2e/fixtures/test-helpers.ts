import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TEST_USERS } from './test-users';

export async function loginAs(
  page: Page,
  user: keyof typeof TEST_USERS = 'customer'
): Promise<void> {
  const creds = TEST_USERS[user];
  await page.goto('/login');
  await page.locator('[data-testid="login-email"]').fill(creds.email);
  await page.locator('[data-testid="login-password"]').fill(creds.password);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/users/login') && response.status() === 200
    ),
    page.locator('[data-testid="login-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, 'admin');
}

export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem('userInfo'));
  await page.goto('/login');
  await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
}

export async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('[data-testid="product-list"]').waitFor({ state: 'visible' });
  const firstCard = page.locator('[data-testid^="product-card-"]').first();
  await firstCard.locator('a').first().click();
  await page.locator('[data-testid="product-add-cart"]').click();
}

export async function completeShippingStep(page: Page): Promise<void> {
  await page.goto('/shipping');
  await page.locator('[data-testid="shipping-address"]').fill('123 Test St');
  await page.locator('[data-testid="shipping-city"]').fill('Testville');
  await page.locator('[data-testid="shipping-postal-code"]').fill('12345');
  await page.locator('[data-testid="shipping-country"]').fill('United States');
  await page.locator('[data-testid="shipping-submit"]').click();
  await page.locator('[data-testid="payment-heading"]').waitFor({ state: 'visible' });
}

export async function completePaymentStep(page: Page): Promise<void> {
  await page.locator('[data-testid="payment-method-paypal"]').check();
  await page.locator('[data-testid="payment-submit"]').click();
  await page.locator('[data-testid="place-order-screen"]').waitFor({ state: 'visible' });
}
