import { test, expect } from '@playwright/test';
import {
  clickProductCardToPdp,
  fillSearchAndSubmit,
  loginAs,
  openProductByExactName,
  selectAppOption
} from '../fixtures/test-helpers';
import { findProductById } from '../fixtures/mongo-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';

const IPHONE_15_PRO = 'iPhone 15 Pro';
const IPAD_AIR_M2 = 'iPad Air (M2)';

test.describe('product reviews', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('eligible_customer_sees_review_form', async ({ page }) => {
    await loginAs(page, 'customer');
    await openProductByExactName(page, IPHONE_15_PRO);
    await expect(page.locator('[data-testid="review-form"]')).toBeVisible();
  });

  test('logged_in_user_can_submit_review', async ({ page }) => {
    await loginAs(page, 'customer');
    await openProductByExactName(page, IPHONE_15_PRO);
    const productId = page.url().split('/product/')[1]?.split(/[/?#]/)[0];
    expect(productId).toBeTruthy();

    await page.locator('[data-testid="review-form"]').waitFor({ state: 'visible' });
    await selectAppOption(page, 'review-rating', '5');
    await expect(page.locator('[data-testid="review-rating-trigger"]')).toContainText('Excellent');
    await page.locator('[data-testid="review-comment"]').fill('Great product from E2E test');
    const reviewResponse = page.waitForResponse(
      (response) => response.url().includes('/reviews') && response.request().method() === 'POST'
    );
    await page.locator('[data-testid="review-submit"]').click();
    const response = await reviewResponse;
    expect(response.status()).toBe(201);

    await expect(page.getByText('Review submitted successfully')).toBeVisible();
    await expect(
      page.locator('[data-testid="review-item"]').filter({ hasText: 'Great product from E2E test' })
    ).toHaveCount(1);

    const dbProduct = await findProductById(productId as string);
    expect(
      dbProduct?.reviews?.filter((review) => review.comment === 'Great product from E2E test')
        .length
    ).toBe(1);
  });

  test('guest_no_write_review_section', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    const productUrl = page.url();
    await expect(page.locator('[data-testid="review-form"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="review-sign-in-cta"]')).toBeVisible();
    await page.locator('[data-testid="review-sign-in-cta"]').click();
    await expect(page).toHaveURL(/\/product\/.*auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.url()).toContain(new URL(productUrl).pathname);
  });

  test('seeded_reviews_visible_on_pdp', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    await expect(page.locator('[data-testid="review-item"]').first()).toBeVisible();
  });

  test('zero_review_product_shows_empty_state', async ({ page }) => {
    await page.goto('/');
    await fillSearchAndSubmit(page, 'Amazon Echo');
    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());
    await expect(page.getByText('No Reviews')).toBeVisible();
    await expect(page.locator('[data-testid="review-item"]')).toHaveCount(0);
  });

  test('duplicate_review_shows_error', async ({ page }) => {
    await loginAs(page, 'customer');
    await openProductByExactName(page, IPAD_AIR_M2, 'iPad Air');
    const productId = page.url().split('/product/')[1]?.split(/[/?#]/)[0];
    expect(productId).toBeTruthy();

    await page.locator('[data-testid="review-form"]').waitFor({ state: 'visible' });
    await selectAppOption(page, 'review-rating', '4');
    await page.locator('[data-testid="review-comment"]').fill('First review');
    await page.locator('[data-testid="review-submit"]').click();
    await expect(page.getByText('Review submitted successfully')).toBeVisible();
    await expect(page.locator('[data-testid="review-form"]')).toHaveCount(0);

    const duplicate = await page.request.post(`/api/products/${productId}/reviews`, {
      data: { rating: 3, comment: 'Duplicate review attempt' }
    });
    expect(duplicate.status()).toBe(400);
    const body = (await duplicate.json()) as { message?: string };
    expect(body.message).toContain('already reviewed');
  });
});
