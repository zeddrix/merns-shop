import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TEST_USERS } from './test-users';

/** Home catalog loaded with carousel, products, and no API error banners. */
export async function assertHomeCatalogHealthy(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="home-carousel-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-products-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
  await page.locator('[data-testid="product-list"]').waitFor({ state: 'visible' });
  await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
}

export async function loginAs(
  page: Page,
  user: keyof typeof TEST_USERS = 'customer'
): Promise<void> {
  const creds = TEST_USERS[user];
  await page.goto('/login');
  await loginWithCredentials(page, creds.email, creds.password);
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, 'admin');
}

export async function logout(page: Page): Promise<void> {
  await page.locator('#username').click();
  await page.locator('[data-testid="nav-logout"]').click();
  await page.waitForURL(/\/login/);
  await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
}

/** Search and open a product PDP by exact catalog name (avoids partial matches like Pro vs Pro Max). */
export async function openProductByExactName(page: Page, name: string): Promise<void> {
  await page.locator('[data-testid="search-input"]').fill(name);
  await page.locator('[data-testid="search-submit"]').click();
  await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  await page.getByRole('link', { name, exact: true }).first().click();
  await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
}

export async function selectVariantAndAddToCart(page: Page): Promise<void> {
  const variantPicker = page.locator('[data-testid="product-variant-picker"]');
  if ((await variantPicker.count()) > 0) {
    const selectedCount = await page
      .locator('input[data-testid^="product-variant-"]:checked')
      .count();
    if (selectedCount === 0) {
      const inStockVariant = page.locator('input[data-testid^="product-variant-"]:not(:disabled)');
      await inStockVariant.first().click();
      await expect(page.locator('input[data-testid^="product-variant-"]:checked')).toHaveCount(1);
    }
    await expect(page.locator('[data-testid="product-variant-error"]')).toHaveCount(0);
  }
  await Promise.all([
    page.waitForURL(/\/cart\//),
    page.locator('[data-testid="product-add-cart"]').click()
  ]);
  await expect(page.locator('[data-testid="cart-screen"]')).toBeVisible();
}

export interface AddToCartOptions {
  brand?: string;
  category?: string;
  subcategory?: string;
}

export async function addFirstInStockProductToCart(
  page: Page,
  options: AddToCartOptions = {}
): Promise<void> {
  const params = new URLSearchParams();
  if (options.brand) params.set('brand', options.brand);
  if (options.category) params.set('category', options.category);
  if (options.subcategory) params.set('subcategory', options.subcategory);
  const query = params.toString();
  await page.goto(query ? `/?${query}` : '/');
  await assertHomeCatalogHealthy(page);
  const inStockCard = page
    .locator('[data-testid^="product-card-"]')
    .filter({ hasNot: page.locator('text=Out of stock') })
    .first();
  await inStockCard.locator('a').first().click();
  await selectVariantAndAddToCart(page);
}

/** @deprecated Use addFirstInStockProductToCart */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await addFirstInStockProductToCart(page);
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

interface ApiProductListResponse {
  products: Array<{
    _id: string;
    name: string;
    image: string;
    variants: Array<{
      sku: string;
      label: string;
      price: number;
      countInStock: number;
    }>;
  }>;
}

interface ApiOrderResponse {
  _id: string;
}

export async function createPaidOrderViaApi(
  page: Page,
  user: keyof typeof TEST_USERS = 'customer'
): Promise<string> {
  const creds = TEST_USERS[user];
  return createPaidOrderForCredentials(page, creds.email, creds.password);
}

export async function createPaidOrderForCredentials(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  const loginResponse = await page.request.post('/api/users/login', {
    data: { email, password }
  });
  expect(loginResponse.ok()).toBeTruthy();

  const productsResponse = await page.request.get('/api/products');
  expect(productsResponse.ok()).toBeTruthy();
  const { products } = (await productsResponse.json()) as ApiProductListResponse;
  const product = products.find((p) => p.variants.some((v) => v.countInStock > 0)) ?? products[0];
  expect(product).toBeDefined();
  const variant = product.variants.find((v) => v.countInStock > 0) ?? product.variants[0];
  expect(variant).toBeDefined();

  const orderResponse = await page.request.post('/api/orders', {
    data: {
      orderItems: [
        {
          product: product._id,
          qty: 1,
          variantSku: variant.sku
        }
      ],
      shippingAddress: {
        address: '123 Test St',
        city: 'Testville',
        postalCode: '12345',
        country: 'United States'
      },
      paymentMethod: 'PayPal',
      itemsPrice: variant.price,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: variant.price
    }
  });
  expect(orderResponse.status()).toBe(201);
  const order = (await orderResponse.json()) as ApiOrderResponse;

  const payResponse = await page.request.put(`/api/orders/${order._id}/pay`, {
    data: {
      id: 'e2e-test-payment',
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      payer: { email_address: email }
    }
  });
  expect(payResponse.ok()).toBeTruthy();

  await page.context().clearCookies();

  return order._id;
}

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.locator('[data-testid="login-email"]').fill(email);
  await page.locator('[data-testid="login-password"]').fill(password);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/users/login') && response.status() === 200
    ),
    page.locator('[data-testid="login-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
}
