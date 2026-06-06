import { test, expect } from '@playwright/test';
import {
  assertHomeCatalogHealthy,
  clickProductCardToPdp,
  isProductDetailsApiResponse,
  openProductByExactName,
  productCardByExactName,
  fillSearchAndSubmit,
  searchProducts,
  selectAppOption,
  selectProductVariant,
  selectVariantAndAddToCart
} from '../fixtures/test-helpers';
import { MOBILE_VIEWPORT } from '../fixtures/viewports';

const IPHONE_15_PRO = 'iPhone 15 Pro';

test.describe('catalog browse and search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await assertHomeCatalogHealthy(page);
  });

  test('product_browse_search', async ({ page }) => {
    await searchProducts(page, IPHONE_15_PRO);
    await expect(page.locator('[data-testid="product-savings-badge"]').first()).toBeVisible();
    const card = productCardByExactName(page, IPHONE_15_PRO);
    await clickProductCardToPdp(card);
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page).toHaveTitle(/iPhone 15 Pro/);
    await expect(page.locator('meta[name="description"][content*="Titanium"]')).toHaveAttribute(
      'content',
      /Titanium design/i
    );
    const jsonLdRaw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLdRaw).toBeTruthy();
    const jsonLd = JSON.parse(jsonLdRaw ?? '{}') as {
      '@type': string;
      name: string;
      offers: unknown;
    };
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe(IPHONE_15_PRO);
    expect(jsonLd.offers).toBeTruthy();
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await expect(
      page.locator('input[data-testid^="product-variant-"]:checked:not(:disabled)')
    ).toHaveCount(1);
    await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-variant-details"]')).toBeVisible();
  });

  test('default_variant_preselected_on_product_load', async ({ page }) => {
    await openProductByExactName(page, 'iPad Air (M2)', 'iPad Air');

    await expect(page.locator('[data-testid="product-variant-error"]')).toHaveCount(0);
    await expect(
      page.locator('input[data-testid^="product-variant-"]:checked:not(:disabled)')
    ).toHaveCount(1);
    await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
  });

  test('add_to_cart_stays_on_pdp_with_success_state', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    const productUrl = page.url();

    await page.locator('[data-testid="product-add-cart"]').click();
    await expect(page).toHaveURL(productUrl);
    await expect(page.locator('[data-testid="product-add-cart-added"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
  });

  test('guest_add_to_cart_never_opens_auth_modal', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    const productUrl = page.url();

    await selectVariantAndAddToCart(page);

    await expect(page).toHaveURL(productUrl);
    await expect(page.locator('[data-testid="product-add-cart-added"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
  });

  test('add_to_cart_shows_loading_spinner_while_pending', async ({ page, context }) => {
    await openProductByExactName(page, IPHONE_15_PRO);

    let delayAdds = false;
    await context.route('**/api/products/**', async (route) => {
      if (delayAdds) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      await route.continue();
    });

    delayAdds = true;
    await page.locator('[data-testid="product-add-cart"]').click();
    await expect(page.locator('[data-testid="product-add-cart-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart-added"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
  });

  test('add_to_cart_shows_error_when_api_fails', async ({ page, context }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    const productUrl = page.url();

    let failAdds = false;
    await context.route('**/api/products/**', async (route) => {
      if (failAdds && route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'API error'
        });
        return;
      }
      await route.continue();
    });

    failAdds = true;
    await page.locator('[data-testid="product-add-cart"]').click();
    await expect(page).toHaveURL(productUrl);
    await expect(page.locator('[data-testid="product-add-cart-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-add-cart-error"]')).toContainText(
      "Couldn't add — try again"
    );
    await expect(page.locator('[data-testid="nav-cart-count"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeVisible({ timeout: 5000 });
  });

  test('add_to_cart_button_bounding_box_stable_on_error', async ({ page, context }) => {
    await openProductByExactName(page, IPHONE_15_PRO);

    let failAdds = false;
    await context.route('**/api/products/**', async (route) => {
      if (failAdds && route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'API error'
        });
        return;
      }
      await route.continue();
    });

    const addButton = page.locator('.product-add-cart-btn');
    await addButton.scrollIntoViewIfNeeded();
    const boxBefore = await addButton.boundingBox();
    expect(boxBefore).not.toBeNull();

    failAdds = true;
    await addButton.click();
    await expect(page.locator('[data-testid="product-add-cart-error"]')).toBeVisible();

    const boxAfter = await page.locator('.product-add-cart-btn').boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(Math.abs(boxAfter!.width - boxBefore!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter!.height - boxBefore!.height)).toBeLessThanOrEqual(1);
  });

  test('product_card_whole_surface_navigates_to_pdp', async ({ page }) => {
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    const card = page.locator('[data-testid^="product-card-"]').first();
    await clickProductCardToPdp(card);
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
  });

  test('product_card_nav_from_scrolled_catalog_scrolls_pdp_into_view', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const card = page.locator('[data-testid^="product-card-"]').first();
    await clickProductCardToPdp(card);
    await expect(page).toHaveURL(/\/product\//);

    await expect
      .poll(async () =>
        page.locator('[data-testid="product-details"]').evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight;
        })
      )
      .toBe(true);
  });

  test('pagination_scrolls_to_catalog_top_on_page_change', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);

    await expect
      .poll(async () =>
        page.locator('[data-testid="home-heading"]').evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight;
        })
      )
      .toBe(true);
  });

  test('add_to_cart_button_bounding_box_stable_on_success', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    const productUrl = page.url();
    const addButton = page.locator('.product-add-cart-btn');
    await addButton.scrollIntoViewIfNeeded();

    const boxBefore = await addButton.boundingBox();
    expect(boxBefore).not.toBeNull();

    await addButton.click();
    await expect(page.locator('[data-testid="product-add-cart-added"]')).toBeVisible();
    await expect(page).toHaveURL(productUrl);

    const boxAfter = await page.locator('.product-add-cart-btn').boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(Math.abs(boxAfter!.width - boxBefore!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxAfter!.height - boxBefore!.height)).toBeLessThanOrEqual(1);
  });

  test('pagination_has_spacing_and_detached_controls', async ({ page }) => {
    await expect(page.locator('[data-testid="pagination-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-summary"]')).toBeVisible();

    const sectionStyles = await page
      .locator('[data-testid="pagination-section"]')
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          marginTop: parseFloat(style.marginTop),
          marginBottom: parseFloat(style.marginBottom)
        };
      });
    expect(sectionStyles.marginTop).toBeGreaterThanOrEqual(24);
    expect(sectionStyles.marginBottom).toBeGreaterThanOrEqual(24);

    const paginationGap = await page.locator('[data-testid="pagination"]').evaluate((el) => {
      const style = getComputedStyle(el);
      return parseFloat(style.gap) || parseFloat(style.columnGap);
    });
    expect(paginationGap).toBeGreaterThanOrEqual(8);

    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('product_card_media_uniform_height', async ({ page }) => {
    await selectAppOption(page, 'filter-category', 'Electronics');
    await selectAppOption(page, 'filter-subcategory', 'Tablets');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const mediaBoxes = page.locator(
      '[data-testid^="product-card-"] [data-testid="catalog-card-media"]'
    );
    await expect(mediaBoxes.first()).toBeVisible();
    const heights = await mediaBoxes.evaluateAll((nodes) =>
      nodes.slice(0, 4).map((el) => el.getBoundingClientRect().height)
    );
    expect(heights.length).toBeGreaterThanOrEqual(2);
    const max = Math.max(...heights);
    const min = Math.min(...heights);
    expect(max - min).toBeLessThanOrEqual(2);
    const objectFits = await mediaBoxes.evaluateAll((nodes) =>
      nodes.slice(0, 4).map((el) => getComputedStyle(el.querySelector('img') ?? el).objectFit)
    );
    expect(objectFits.every((fit) => fit === 'contain')).toBe(true);
  });

  test('product_image_loads_offline', async ({ page }) => {
    await fillSearchAndSubmit(page, 'Galaxy Tab');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const cardMedia = page.locator('[data-testid="catalog-card-media"] img').first();
    await expect(cardMedia).toHaveAttribute('src', /\/images\/catalog\/.*\.webp$/);
    await expect
      .poll(async () =>
        cardMedia.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth >= 200)
      )
      .toBe(true);

    await openProductByExactName(page, IPHONE_15_PRO);

    const productImage = page.locator('[data-testid="product-details"] img');
    await expect(productImage).toHaveAttribute('src', /\/images\/catalog\/.*\.webp$/);
    await expect(productImage).toHaveAttribute('alt', IPHONE_15_PRO);
    await expect
      .poll(async () =>
        productImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth >= 200)
      )
      .toBe(true);
  });

  test('qty_capped_at_10', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    await page.locator('input[data-testid="product-variant-iphone-15-pro-256gb"]').check();

    await page.locator('[data-testid="product-qty-trigger"]').click();
    await expect(page.locator('[data-testid="product-qty-option-10"]')).toBeVisible();
    await expect(page.locator('[data-testid^="product-qty-option-"]')).toHaveCount(10);
  });

  test('cart_supports_two_variants_same_product', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openProductByExactName(page, IPHONE_15_PRO);
    await selectProductVariant(page, 'iphone-15-pro-128gb');
    await selectVariantAndAddToCart(page);

    await selectProductVariant(page, 'iphone-15-pro-256gb');
    await selectVariantAndAddToCart(page);

    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover"]')).toContainText('128GB');
    await expect(page.locator('[data-testid="cart-popover"]')).toContainText('256GB');
  });

  test('homepage_shows_carousel_and_pagination', async ({ page }) => {
    await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.locator('[data-testid="pagination-next"]').click();
    await expect(page).toHaveURL(/\/page\/2/);
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });

  test('all_variants_oos_no_default', async ({ page }) => {
    await searchProducts(page, 'Amazon Echo');
    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await expect(page.locator('input[data-testid^="product-variant-"]')).toHaveCount(2);
    await expect(page.locator('input[data-testid^="product-variant-"]:checked')).toHaveCount(0);
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeDisabled();
  });

  test('out_of_stock_disables_add_to_cart', async ({ page }) => {
    await searchProducts(page, 'Amazon Echo');
    await clickProductCardToPdp(page.locator('[data-testid^="product-card-"]').first());
    await expect(page.locator('[data-testid="product-variant-picker"]')).toBeVisible();
    await expect(page.locator('input[data-testid^="product-variant-"]')).toHaveCount(2);
    await expect(page.locator('input[data-testid^="product-variant-"]:checked')).toHaveCount(0);
    await expect(page.locator('[data-testid="product-add-cart"]')).toBeDisabled();
    await expect(page.getByText('No Reviews')).toBeVisible();
  });

  test('search_no_results_shows_empty_state', async ({ page }) => {
    await fillSearchAndSubmit(page, 'zzzz-no-match-product-xyz');
    await expect(page.locator('[data-testid="search-empty"]')).toBeVisible();
  });

  test('stale_product_id_shows_not_found_recovery', async ({ page }) => {
    await page.goto('/product/000000000000000000000000');
    await expect(page.locator('[data-testid="product-not-found"]')).toBeVisible();
    await page.locator('[data-testid="product-go-back"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();
  });

  test('cart_prunes_stale_items_on_reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'cartItems',
        JSON.stringify([
          {
            product: '000000000000000000000000',
            variantSku: 'stale-128gb',
            variantLabel: '128GB',
            name: 'Stale Product (128GB)',
            image: '/images/sample.jpg',
            price: 99,
            countInStock: 1,
            qty: 1
          }
        ])
      );
    });

    await page.goto('/');
    await assertHomeCatalogHealthy(page);
    await expect.poll(async () => page.locator('[data-testid="nav-cart-count"]').count()).toBe(0);
    await expect(page.locator('[data-testid="cart-stale-pruned-notice"]')).toBeVisible();
    await page.locator('[data-testid="cart-stale-pruned-dismiss"]').click();
    await expect(page.locator('[data-testid="cart-stale-pruned-notice"]')).toHaveCount(0);
  });

  test('nav_category_tablets_filters_catalog', async ({ page }) => {
    await page.locator('[data-testid="nav-category-tablets"]').click();
    await expect(page).toHaveURL(/category=Electronics/);
    await expect(page).toHaveURL(/subcategory=Tablets/);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid^="product-card-"]').first()).toContainText(
      /iPad|Galaxy Tab|Tab/
    );
  });

  test('carousel_slide_opens_pdp', async ({ page }) => {
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toBeVisible();
    const activeSlide = page.locator('.carousel-item.active a.product-carousel__slide');
    await expect(activeSlide).toBeVisible();
    const caption = await activeSlide.locator('.carousel-caption h2').innerText();
    const productName = caption.replace(/\s*\(from \$[\d,.]+\)\s*$/, '').trim();
    await Promise.all([page.waitForURL(/\/product\//), activeSlide.click()]);
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details"] h3')).toContainText(productName);
  });

  test('variant_switch_updates_display', async ({ page }) => {
    await openProductByExactName(page, IPHONE_15_PRO);
    await expect(page.locator('[data-testid="product-variant-details"]')).toContainText('128GB');

    const price128 = await page.locator('[data-testid="product-price-display"]').innerText();
    await selectProductVariant(page, 'iphone-15-pro-256gb');
    await expect(page.locator('[data-testid="product-variant-details"]')).toContainText('256GB');
    await expect(page.locator('[data-testid="product-variant-details"]')).not.toContainText(
      '128GB storage'
    );

    const price256 = await page.locator('[data-testid="product-price-display"]').innerText();
    expect(price256).not.toBe(price128);
  });

  test('pdp_robots_canonical_meta', async ({ page }) => {
    const response = await page.request.get(
      `/api/products?keyword=${encodeURIComponent(IPHONE_15_PRO)}`
    );
    expect(response.ok()).toBeTruthy();
    const { products } = (await response.json()) as {
      products: Array<{ _id: string; name: string }>;
    };
    const product =
      products.find((p) => p.name === IPHONE_15_PRO) ??
      products.find((p) => p.name.includes('iPhone 15 Pro'));
    expect(product).toBeTruthy();

    const detailsResponse = page.waitForResponse(isProductDetailsApiResponse);
    await page.goto(`/product/${product!._id}`);
    await detailsResponse;
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/product/${product!._id}$`)
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      new RegExp(`/product/${product!._id}$`)
    );
  });

  test('mobile_search_results_pagination', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await assertHomeCatalogHealthy(page);

    await page.locator('[data-testid="navbar-toggle"]').click();
    await searchProducts(page, 'Phone');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();

    const pagination = page.locator('[data-testid="pagination"]');
    if ((await pagination.count()) > 0) {
      await page.locator('[data-testid="pagination-page-2"]').click();
      await expect(page).toHaveURL(/\/page\/2|pageNumber/);
    }
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });
});
