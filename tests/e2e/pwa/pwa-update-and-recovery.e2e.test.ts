import { test, expect } from '@playwright/test';
import { assertHomeCatalogHealthy } from '../fixtures/test-helpers';
import { simulateSwUpdate, suppressUpdateBanner, waitForSWAndCaching } from './pwa-test-helpers';

test.describe('PWA update lifecycle', () => {
  test('pwa_update_banner_and_reload', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await waitForSWAndCaching(page);
    await suppressUpdateBanner(page);

    await simulateSwUpdate(page);
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toBeVisible();
    await page.locator('[data-testid="pwa-update-dismiss"]').click();
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toHaveCount(0);

    await simulateSwUpdate(page);
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toBeVisible();
    await page.locator('[data-testid="pwa-update-reload"]').click();
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible({ timeout: 15000 });
  });
});
