import { test, expect, type Page } from '@playwright/test';
import { assertHomeCatalogHealthy, assertNoHorizontalOverflow } from '../fixtures/test-helpers';
import { DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from '../fixtures/viewports';

const assertAboutPageContent = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('[data-testid="about-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="about-heading"]')).toContainText('Zeddrix Fabian');
  await expect(page.locator('[data-testid="about-developer"]')).toContainText('Zeddrix Fabian');
  await expect(page.locator('[data-testid="about-github-link"]')).toHaveAttribute(
    'href',
    'https://github.com/zeddrix/merns-shop'
  );
  await expect(page.locator('[data-testid="about-linkedin-link"]')).toHaveAttribute(
    'href',
    /linkedin\.com\/in\/zeddrix-fabian/
  );
  await expect(page.locator('[data-testid="about-portfolio-link"]')).toHaveAttribute(
    'href',
    'https://github.com/zeddrix/portfolio'
  );
};

test.describe('about page', () => {
  test('about_footer_link_journey', async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="footer-developer-link"]').click();
    await assertAboutPageContent(page);
  });

  test('about_header_link_desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="nav-about"]').click();
    await assertAboutPageContent(page);
  });

  test('about_header_link_mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await page.locator('[data-testid="navbar-toggle"]').click();
    await page.locator('[data-testid="nav-about"]').click();
    await assertAboutPageContent(page);
    await assertNoHorizontalOverflow(page);
  });

  test('about_timeline_cards_visible', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('[data-testid="about-timeline-2021"]')).toBeVisible();
    await expect(page.locator('[data-testid="about-timeline-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="about-timeline-2021"]')).toContainText('2021');
    await expect(page.locator('[data-testid="about-timeline-2021"]')).toContainText(/Udemy|MERN/i);
    await expect(page.locator('[data-testid="about-timeline-2026"]')).toContainText('2026');
    await expect(page.locator('[data-testid="about-timeline-2026"]')).toContainText(/ATDD/i);
  });

  test('about_app_highlights_visible', async ({ page }) => {
    await page.goto('/about');
    const highlights = page.locator('[data-testid="about-highlights"]');
    await expect(highlights).toBeVisible();
    await expect(highlights).toContainText(/Storefront/i);
    await expect(highlights).toContainText(/Checkout/i);
    await expect(highlights).toContainText(/Admin/i);
    await expect(highlights).toContainText(/PWA/i);
  });

  test('about_tech_stack_visible', async ({ page }) => {
    await page.goto('/about');
    const stack = page.locator('[data-testid="about-tech-stack"]');
    await expect(stack).toBeVisible();
    await expect(stack).toContainText('React');
    await expect(stack).toContainText('19');
    await expect(stack).toContainText('Express');
    await expect(stack).toContainText('5');
    await expect(stack).toContainText('MongoDB');
    await expect(stack).toContainText('Vite');
    await expect(stack).toContainText('Playwright');
  });

  test('about_deployment_visible', async ({ page }) => {
    await page.goto('/about');
    const deployment = page.locator('[data-testid="about-deployment"]');
    await expect(deployment).toBeVisible();
    await expect(deployment).toContainText(/MongoDB Atlas/i);
    await expect(deployment).toContainText(/Render/i);
  });

  test('about_connect_links_are_navigable_anchors', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('[data-testid="about-page"]')).toBeVisible();

    for (const testId of ['about-linkedin-link', 'about-portfolio-link', 'about-github-link']) {
      const link = page.locator(`[data-testid="${testId}"]`);
      await expect(link).toHaveAttribute('target', '_blank');
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }

    const githubPopup = page.waitForEvent('popup');
    await page.locator('[data-testid="about-github-link"]').click();
    const popup = await githubPopup;
    await expect(popup).toHaveURL('https://github.com/zeddrix/merns-shop');
    await popup.close();
  });

  test('about_seo_meta_indexable', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('[data-testid="about-page"]')).toBeVisible();
    await expect(page).toHaveTitle(/Zeddrix Fabian/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/about$/);
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      'content',
      /MERN|portfolio/i
    );
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      'content',
      /Zeddrix Fabian/
    );
    await expect(page.locator('meta[name="keywords"]')).toHaveAttribute(
      'content',
      /Zeddrix Fabian/
    );
    const jsonLdTexts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasPerson = jsonLdTexts.some((raw) => {
      const parsed = JSON.parse(raw) as { '@type'?: string; name?: string };
      return parsed['@type'] === 'Person' && parsed.name === 'Zeddrix Fabian';
    });
    expect(hasPerson).toBe(true);
  });
});
