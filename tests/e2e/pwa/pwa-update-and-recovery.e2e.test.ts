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
    await expect(page.locator('[data-testid="pwa-update-message"]')).toContainText(
      "A new version of MERN's Shop is ready."
    );
    await page.locator('[data-testid="pwa-update-dismiss"]').click();
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toHaveCount(0);

    await simulateSwUpdate(page);
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toBeVisible();
    await Promise.all([
      page.waitForEvent('load'),
      page.locator('[data-testid="pwa-update-reload"]').click()
    ]);
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible({ timeout: 15000 });
  });

  test('pwa_update_banner_layout_message_and_actions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await waitForSWAndCaching(page);
    await suppressUpdateBanner(page);

    await simulateSwUpdate(page);
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="pwa-update-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="pwa-update-actions"]')).toBeVisible();
    await expect(page.locator('[data-testid="pwa-update-reload"]')).toBeVisible();
    await expect(page.locator('[data-testid="pwa-update-dismiss"]')).toBeVisible();

    const layout = await page.evaluate(() => {
      const banner = document.querySelector('[data-testid="pwa-update-banner"]');
      const message = document.querySelector('[data-testid="pwa-update-message"]');
      const actions = document.querySelector('[data-testid="pwa-update-actions"]');
      if (!banner || !message || !actions) {
        return null;
      }
      const bannerBox = banner.getBoundingClientRect();
      const messageBox = message.getBoundingClientRect();
      const actionsBox = actions.getBoundingClientRect();
      const groupLeft = messageBox.left;
      const groupRight = actionsBox.right;
      const groupCenter = (groupLeft + groupRight) / 2;
      const bannerCenter = (bannerBox.left + bannerBox.right) / 2;
      return {
        sameRow: Math.abs(messageBox.top - actionsBox.top) < 24,
        verticallyCentered:
          Math.abs(
            messageBox.top + messageBox.height / 2 - (bannerBox.top + bannerBox.height / 2)
          ) < 24,
        groupCentered: Math.abs(groupCenter - bannerCenter) < 48
      };
    });

    expect(layout).not.toBeNull();
    expect(layout?.sameRow).toBe(true);
    expect(layout?.verticallyCentered).toBe(true);
    expect(layout?.groupCentered).toBe(true);

    await page.locator('[data-testid="pwa-update-dismiss"]').click();
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toHaveCount(0);
  });
});
