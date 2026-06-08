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
      const message = document.querySelector('[data-testid="pwa-update-message"]');
      const actions = document.querySelector('[data-testid="pwa-update-actions"]');
      if (!message || !actions) {
        return null;
      }
      const messageBox = message.getBoundingClientRect();
      const actionsBox = actions.getBoundingClientRect();
      return {
        messageLeft: messageBox.left,
        actionsRight: actionsBox.right,
        actionsLeft: actionsBox.left,
        messageRight: messageBox.right,
        sameRow: Math.abs(messageBox.top - actionsBox.top) < 24
      };
    });

    expect(layout).not.toBeNull();
    expect(layout?.sameRow).toBe(true);
    expect(layout!.messageLeft).toBeLessThan(layout!.actionsLeft);
    expect(layout!.actionsRight).toBeGreaterThan(layout!.messageRight);

    await page.locator('[data-testid="pwa-update-dismiss"]').click();
    await expect(page.locator('[data-testid="pwa-update-banner"]')).toHaveCount(0);
  });
});
