/** Mobile viewport cart/checkout journeys: tests/e2e/misc/responsive-layout.e2e.test.ts */
import { test, expect } from '@playwright/test';
import {
  addFirstProductToCart,
  completeShippingStep,
  completePaymentStep,
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
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes(`/api/products/${productId}`) && response.ok()
    ),
    page.goto(`/cart/${productId}?qty=${qty}&variantSku=${variantSku}`)
  ]);
  await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
  await expect(page.locator('[data-testid^="cart-item-"]').first()).toBeVisible();
}

test.describe('checkout cart shipping payment', () => {
  test('cart_qty_shipping_payment_persisted', async ({ page }) => {
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
    await expect(page).toHaveURL(/\/shipping/);

    await completeShippingStep(page);
    await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();

    await completePaymentStep(page);
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await expect(page.getByText('PayPal')).toBeVisible();
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

  test('payment_paypal_selected_persists', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeShippingStep(page);
    await page.locator('[data-testid="payment-method-paypal"]').check();
    await page.locator('[data-testid="payment-submit"]').click();
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await page.goto('/payment');
    await expect(page.locator('[data-testid="payment-method-paypal"]')).toBeChecked();
  });

  test('checkout_step_sign_up_from_shipping_breadcrumb', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
    const signUpHref = await page
      .locator('[data-testid="checkout-step-sign-up"]')
      .getAttribute('href');
    expect(signUpHref).toContain('auth=register');
    expect(signUpHref).toContain('redirect=%2Fshipping');
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
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);

    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
  });

  test('shipping_requires_all_fields', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    await page.locator('[data-testid="shipping-address"]').fill('');
    await page.locator('[data-testid="shipping-submit"]').click();
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
    await expect(page).toHaveURL(/\/shipping/);
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

  test('logged_in_customer_places_order', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    const { productId, variantSku } = await fetchInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.locator('[data-testid="cart-checkout"]').click();
    await expect(page).toHaveURL(/\/shipping/);
    await completeShippingStep(page);
    await completePaymentStep(page);
    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await expect(page.locator('[data-testid="place-order-submit"]')).toBeEnabled();

    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.status() === 201
      ),
      page.locator('[data-testid="place-order-submit"]').click()
    ]);

    await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
  });

  test('place_order_shows_shipping_fee_for_low_subtotal', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    const { productId, variantSku } = await fetchCheapInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.locator('[data-testid="cart-checkout"]').click();
    await completeShippingStep(page);
    await completePaymentStep(page);

    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    const itemsPrice = Number(
      (await page.locator('[data-testid="place-order-items-price"]').innerText()).replace('$', '')
    );
    expect(itemsPrice).toBeLessThanOrEqual(100);
    await expect(page.locator('[data-testid="place-order-shipping-price"]')).toHaveText('$100.00');
    await expect(page.locator('[data-testid="place-order-tax-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="place-order-total-price"]')).toBeVisible();
  });

  test('place_order_free_shipping_for_high_subtotal', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    const { productId, variantSku } = await fetchHighSubtotalInStockProduct(page);
    await addProductViaCartDeepLink(page, productId, variantSku);
    await page.locator('[data-testid="cart-checkout"]').click();
    await completeShippingStep(page);
    await completePaymentStep(page);

    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    const itemsPrice = Number(
      (await page.locator('[data-testid="place-order-items-price"]').innerText()).replace('$', '')
    );
    expect(itemsPrice).toBeGreaterThan(100);
    await expect(page.locator('[data-testid="place-order-shipping-price"]')).toHaveText('$0.00');
  });

  test('checkout_breadcrumb_navigates_to_shipping_from_payment', async ({ page }) => {
    await loginAs(page, 'customer');
    await addFirstProductToCart(page);
    await completeShippingStep(page);
    await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();

    await page.locator('[data-testid="checkout-step-shipping"]').click();
    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-steps"]')).toBeVisible();
  });

  test('logged_in_deep_link_placeorder_without_shipping_redirects', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/profile') && response.ok()
      ),
      page.goto('/placeorder')
    ]);
    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="place-order-screen"]')).toHaveCount(0);
  });

  test('empty_cart_blocks_place_order_submit', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await completeShippingStep(page);
    await completePaymentStep(page);

    await expect(page.locator('[data-testid="place-order-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="place-order-submit"]')).toBeDisabled();
    await page.locator('[data-testid="place-order-submit"]').click({ force: true });
    await expect(page).toHaveURL(/\/placeorder/);
    await expect(page.locator('[data-testid="order-screen"]')).toHaveCount(0);
  });
});
