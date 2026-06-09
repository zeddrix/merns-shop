/** Mobile viewport cart/checkout journeys: tests/e2e/misc/responsive-layout.e2e.test.ts */
import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeCheckoutStep,
  loginWithCredentials,
  loginAs,
  selectAppOption
} from '../fixtures/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

interface ApiProduct {
  _id: string;
  name: string;
  variants: Array<{
    sku: string;
    label: string;
    countInStock: number;
  }>;
}

async function fetchInStockProduct(page: import('@playwright/test').Page): Promise<{
  productId: string;
  variantSku: string;
  productName: string;
}> {
  const response = await page.request.get('/api/products');
  expect(response.ok()).toBeTruthy();
  const { products } = (await response.json()) as { products: ApiProduct[] };
  const product = products.find((p) => p.variants.some((v) => v.countInStock > 0));
  expect(product).toBeTruthy();
  const variant = product!.variants.find((v) => v.countInStock > 0)!;
  return { productId: product!._id, variantSku: variant.sku, productName: product!.name };
}

async function fetchCheapInStockProduct(page: import('@playwright/test').Page): Promise<{
  productId: string;
  variantSku: string;
}> {
  const response = await page.request.get('/api/products?maxPrice=100');
  expect(response.ok()).toBeTruthy();
  const { products } = (await response.json()) as {
    products: Array<
      ApiProduct & { variants: Array<{ sku: string; countInStock: number; price: number }> }
    >;
  };
  const product = products.find((p) => p.variants.some((v) => v.countInStock > 0));
  expect(product).toBeTruthy();
  const variant = product!.variants.find((v) => v.countInStock > 0)!;
  return { productId: product!._id, variantSku: variant.sku };
}

async function fetchHighSubtotalInStockProduct(page: import('@playwright/test').Page): Promise<{
  productId: string;
  variantSku: string;
}> {
  const response = await page.request.get('/api/products?minPrice=101');
  expect(response.ok()).toBeTruthy();
  const { products } = (await response.json()) as {
    products: Array<
      ApiProduct & { variants: Array<{ sku: string; countInStock: number; price: number }> }
    >;
  };
  const product = products.find((p) => p.variants.some((v) => v.countInStock > 0 && v.price > 100));
  expect(product).toBeTruthy();
  const variant = product!.variants.find((v) => v.countInStock > 0 && v.price > 100)!;
  return { productId: product!._id, variantSku: variant.sku };
}

async function addProductViaCartDeepLink(
  page: import('@playwright/test').Page,
  productId: string,
  variantSku: string,
  qty = 1
): Promise<void> {
  const countLocator = page.locator('[data-testid="nav-cart-count"]');
  const countBefore = (await countLocator.count()) > 0 ? Number(await countLocator.innerText()) : 0;

  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes(`/api/products/${productId}`) && response.ok()
    ),
    page.goto(`/cart/${productId}?qty=${qty}&variantSku=${variantSku}`)
  ]);
  await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
  await expect
    .poll(async () => {
      if ((await countLocator.count()) === 0) {
        return 0;
      }
      return Number(await countLocator.innerText());
    })
    .toBeGreaterThanOrEqual(countBefore + qty);
  await expect(page.locator('[data-testid="cart-screen"] .cart-line-item').first()).toBeVisible();
}

async function fetchTwoDistinctInStockProducts(
  page: import('@playwright/test').Page
): Promise<
  [
    { productId: string; variantSku: string; productName: string },
    { productId: string; variantSku: string; productName: string }
  ]
> {
  const response = await page.request.get('/api/products');
  expect(response.ok()).toBeTruthy();
  const { products } = (await response.json()) as { products: ApiProduct[] };
  const inStock = products.filter((p) => p.variants.some((v) => v.countInStock > 0));
  expect(inStock.length).toBeGreaterThanOrEqual(2);
  const first = inStock[0]!;
  const second = inStock.find((p) => p._id !== first._id)!;
  const firstVariant = first.variants.find((v) => v.countInStock > 0)!;
  const secondVariant = second.variants.find((v) => v.countInStock > 0)!;
  return [
    { productId: first._id, variantSku: firstVariant.sku, productName: first.name },
    { productId: second._id, variantSku: secondVariant.sku, productName: second.name }
  ];
}

async function placeOrderFromCheckout(page: import('@playwright/test').Page): Promise<string> {
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/orders') && response.status() === 201
    ),
    page.locator('[data-testid="checkout-place-order-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
  const orderId = page.url().split('/order/')[1]?.split(/[/?#]/)[0];
  expect(orderId).toBeTruthy();
  return orderId as string;
}

test.describe('checkout cart shipping payment', () => {
  test('cart_qty_checkout_form_persisted', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();

    const qtySelect = page.locator('[data-testid^="cart-qty-"]').first();
    const lineTestId = (await qtySelect.getAttribute('data-testid'))?.replace('-trigger', '') ?? '';
    await selectAppOption(page, lineTestId, '2');
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/checkout/);

    await completeCheckoutStep(page);
    await expect(page.locator('[data-testid="checkout-payment-note"]')).toContainText('PayPal');
    await expect(page.locator('[data-testid="checkout-summary-card"]')).toBeVisible();
  });

  test('cart_remove_item_updates_total', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/cart');
    const item = page.locator('[data-testid^="cart-item-"]').first();
    await item.locator('[data-testid^="cart-remove-"]').click();
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
  });

  test('empty_cart_checkout_blocked', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-checkout"]')).toHaveCount(0);
  });

  test('checkout_payment_method_defaults_paypal_on_order', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="checkout-place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.getByText('PayPal')).toBeVisible();
  });

  test('checkout_progress_hides_sign_in_sign_up', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-step-signin"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="checkout-step-sign-up"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="checkout-progress-order-details"]')).toBeVisible();
  });

  test('checkout_sign_up_honors_cart_redirect', async ({ page }) => {
    const unique = Date.now();
    const email = `checkout-signup-${unique}@example.com`;

    await addFirstProductToCart(page);
    await page.goto('/cart');
    await page.locator('[data-testid="cart-checkout"]').click();

    await expect(page).toHaveURL(/auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-checkout-sign-up-hint"]')).toBeVisible();
    await page.locator('[data-testid="login-register-link"]').click();
    await expect(page).toHaveURL(/auth=register/);

    await page.locator('[data-testid="register-name"]').fill('Checkout Signup User');
    await page.locator('[data-testid="register-email"]').fill(email);
    await page.locator('[data-testid="register-password"]').fill('TestPass1!');
    await page.locator('[data-testid="register-confirm-password"]').fill('TestPass1!');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-heading"]')).toBeVisible();
  });

  test('checkout_submit_blocked_until_shipping_valid', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await page.locator('[data-testid="checkout-address"]').fill('');
    await page.locator('[data-testid="checkout-place-order-submit"]').click();
    await expect(page.locator('[data-testid="checkout-address-error"]')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('checkout_country_shows_placeholder_before_selection', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-country-trigger"]')).toContainText(
      'Select country'
    );
    await selectAppOption(page, 'checkout-country', 'United States', 'united');
    await expect(page.locator('[data-testid="checkout-country-trigger"]')).toContainText(
      'United States'
    );
  });

  test('checkout_country_searchable_select_filters_and_selects', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await page.locator('[data-testid="checkout-address"]').fill('Lot 3 Test St');
    await page.locator('[data-testid="checkout-city"]').fill('Tanza');
    await page.locator('[data-testid="checkout-postal-code"]').fill('4108');
    await selectAppOption(page, 'checkout-country', 'Philippines', 'phil');
    await expect(page.locator('[data-testid="checkout-country-trigger"]')).toContainText(
      'Philippines'
    );

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="checkout-place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-shipping"]')).toContainText('Philippines');
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-payment"]')).toBeVisible();
    const itemsBox = await page.locator('[data-testid="order-items"]').boundingBox();
    const paymentBox = await page.locator('[data-testid="order-payment"]').boundingBox();
    expect(itemsBox!.y).toBeLessThan(paymentBox!.y);
  });

  test('checkout_only_to_pay_items_shows_pending_not_empty', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);
    await placeOrderFromCheckout(page);

    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-empty"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="checkout-pending-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-to-pay-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-place-order-submit"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
  });

  test('logout_clears_to_pay_cart_items', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);
    await placeOrderFromCheckout(page);
    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();

    const { logout } = await import('../fixtures/test-helpers');
    await logout(page);
    await page.goto('/');
    await expect(page.locator('[data-testid="nav-cart-count"]')).toHaveCount(0);
  });

  test('cart_deep_link_adds_variant_qty', async ({ page }) => {
    const { productId, variantSku } = await fetchInStockProduct(page);
    await page.goto(`/cart/${productId}?qty=2&variantSku=${variantSku}`);
    await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
    const lineItem = page.locator('[data-testid^="cart-item-"]').first();
    await expect(lineItem).toBeVisible();
    await expect(lineItem).toContainText('2');
    await expect(page.locator('[data-testid="nav-cart-count"]')).toHaveText('2');
  });

  test('logged_in_customer_completes_unified_checkout_places_order', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    const { productId, variantSku } = await fetchInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page).toHaveURL(/\/checkout/);
    await completeCheckoutStep(page);
    await expect(page.locator('[data-testid="checkout-place-order-submit"]')).toBeEnabled();

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="checkout-place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });

  test('checkout_shows_shipping_fee_for_low_subtotal', async ({ page }) => {
    await loginAs(page, 'customer');
    const { productId, variantSku } = await fetchCheapInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.goto('/checkout');

    const itemsPrice = Number(
      (await page.locator('[data-testid="checkout-items-price"]').innerText()).replace('$', '')
    );
    expect(itemsPrice).toBeLessThanOrEqual(100);
    await expect(page.locator('[data-testid="checkout-shipping-price"]')).toHaveText('$100.00');
    await expect(page.locator('[data-testid="checkout-tax-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-total-price"]')).toBeVisible();
  });

  test('checkout_free_shipping_for_high_subtotal', async ({ page }) => {
    await loginAs(page, 'customer');
    const { productId, variantSku } = await fetchHighSubtotalInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.goto('/checkout');

    const itemsPrice = Number(
      (await page.locator('[data-testid="checkout-items-price"]').innerText()).replace('$', '')
    );
    expect(itemsPrice).toBeGreaterThan(100);
    await expect(page.locator('[data-testid="checkout-shipping-price"]')).toHaveText('$0.00');
  });

  test('unified_checkout_no_multi_page_breadcrumb', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-summary-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-heading"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="shipping-heading"]')).toHaveCount(0);
  });

  test('legacy_shipping_route_redirects_to_checkout', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/shipping');
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('[data-testid="checkout-heading"]')).toBeVisible();
  });

  test('empty_cart_blocks_checkout_submit', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-empty"]')).toBeVisible();
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-place-order-submit"]')).toHaveCount(0);
  });

  test('placed_order_keeps_cart_with_to_pay_badge', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);
    await placeOrderFromCheckout(page);

    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
    await page.locator('[data-testid="nav-cart"]').click();
    await expect(page.locator('[data-testid="cart-popover"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-to-pay-badge"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="cart-popover"] a').first()).toHaveAttribute(
      'href',
      /\/order\//
    );
  });

  test('new_items_checkout_separately_while_to_pay_items_remain', async ({ page }) => {
    await loginAs(page, 'customer');
    const [firstProduct, secondProduct] = await fetchTwoDistinctInStockProducts(page);

    await addProductViaCartDeepLink(page, firstProduct.productId, firstProduct.variantSku);
    await page.goto('/checkout');
    await completeCheckoutStep(page);
    const firstOrderId = await placeOrderFromCheckout(page);

    await addProductViaCartDeepLink(page, secondProduct.productId, secondProduct.variantSku);
    await expect
      .poll(async () => page.locator('[data-testid="cart-screen"] .cart-line-item').count())
      .toBe(2);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="checkout-pending-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-summary-card"]')).toContainText(
      secondProduct.productName.split(' ')[0] ?? secondProduct.productName
    );
    await expect(
      page.locator('[data-testid="checkout-summary-card"] [data-testid="order-line-qty-price"]')
    ).toHaveCount(1);

    await page.locator('[data-testid="checkout-address"]').fill('456 Second St');
    await page.locator('[data-testid="checkout-city"]').fill('Testville');
    await page.locator('[data-testid="checkout-postal-code"]').fill('54321');
    await selectAppOption(page, 'checkout-country', 'United States', 'united');
    const secondOrderId = await placeOrderFromCheckout(page);
    expect(secondOrderId).not.toBe(firstOrderId);
  });

  test('cart_clears_to_pay_items_after_payment', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);
    const orderId = await placeOrderFromCheckout(page);

    await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
    const { payOrderViaApi } = await import('../fixtures/test-helpers');
    await payOrderViaApi(page, orderId);
    await page.goto(`/order/${orderId}`);
    await expect(page.locator('[data-testid="order-paid-message"]')).toBeVisible();
    await expect.poll(async () => page.locator('[data-testid="nav-cart-count"]').count()).toBe(0);
  });

  test('order_line_item_shows_single_price_line', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="order-line-qty-price"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="order-line-total"]')).toHaveCount(1);
  });

  test('order_detail_sections_follow_items_payment_shipping_order', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeCheckoutStep(page);
    await placeOrderFromCheckout(page);

    const itemsBox = await page.locator('[data-testid="order-items"]').boundingBox();
    const paymentBox = await page.locator('[data-testid="order-payment"]').boundingBox();
    const shippingBox = await page.locator('[data-testid="order-shipping"]').boundingBox();
    expect(itemsBox).toBeTruthy();
    expect(paymentBox).toBeTruthy();
    expect(shippingBox).toBeTruthy();
    expect(itemsBox!.y).toBeLessThan(paymentBox!.y);
    expect(paymentBox!.y).toBeLessThan(shippingBox!.y);
    await expect(page.locator('[data-testid="order-payment-badge"]')).toContainText('To Pay');
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });
});
