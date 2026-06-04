import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/test-helpers';
import { findProductById } from '../fixtures/mongo-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

test.describe('product reviews', () => {
  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test('logged_in_user_can_submit_review', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/');
    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();
    const productUrl = page.url();
    const productId = productUrl.split('/product/')[1]?.split(/[/?#]/)[0];
    expect(productId).toBeTruthy();
    await page.locator('[data-testid="product-add-cart"]').click();
    await page.goto(productUrl);

    await page.locator('[data-testid="review-form"]').waitFor({ state: 'visible' });
    await page.locator('[data-testid="review-rating"]').selectOption('5');
    await page.locator('[data-testid="review-comment"]').fill('Great product from E2E test');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/reviews') && response.status() === 201
      ),
      page.locator('[data-testid="review-submit"]').click()
    ]);

    await expect(page.getByText('Review submitted successfully')).toBeVisible();

    const dbProduct = await findProductById(productId as string);
    expect(
      dbProduct?.reviews?.some((review) => review.comment === 'Great product from E2E test')
    ).toBe(true);
  });

  test('duplicate_review_shows_error', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/');
    await page.locator('[data-testid^="product-card-"]').first().locator('a').first().click();

    await page.locator('[data-testid="review-form"]').waitFor({ state: 'visible' });
    await page.locator('[data-testid="review-rating"]').selectOption('4');
    await page.locator('[data-testid="review-comment"]').fill('First review');
    await page.locator('[data-testid="review-submit"]').click();
    await expect(page.getByText('Review submitted successfully')).toBeVisible();

    await page.locator('[data-testid="review-comment"]').fill('Duplicate review attempt');
    await page.locator('[data-testid="review-submit"]').click();
    await expect(page.getByText('Product already reviewed')).toBeVisible();
  });
});
