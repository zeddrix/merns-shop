import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TEST_USERS } from './test-users';

/** Expands the collapsed navbar on small viewports so header links and search are visible. */
export const isProductDetailsApiResponse = (response: {
  url: () => string;
  request: () => { method: () => string };
  status: () => number;
}): boolean =>
  /\/api\/products\/[a-f0-9]{24}$/i.test(response.url()) &&
  response.request().method() === 'GET' &&
  response.status() === 200;

/** Clicks a custom AppSelect trigger then an option (replaces native selectOption). */
export async function selectAppOption(page: Page, testId: string, value: string): Promise<void> {
  await page.locator(`[data-testid="${testId}-trigger"]`).click();
  await page.locator(`[data-testid="${testId}-option-${value}"]`).click();
}

export async function openMobileNavIfNeeded(page: Page): Promise<void> {
  const toggle = page.locator('[data-testid="navbar-toggle"]');
  if ((await toggle.count()) > 0 && (await toggle.isVisible())) {
    const search = page.locator('[data-testid="search-input"]:visible').first();
    if (!(await search.isVisible())) {
      await toggle.click();
      await expect(search).toBeVisible();
    }
  }
}

/** Opens the desktop search overlay or mobile nav search when the input is not visible. */
export async function openSearchIfNeeded(page: Page): Promise<void> {
  await openMobileNavIfNeeded(page);
  const visibleSearch = page.locator('[data-testid="search-input"]:visible').first();
  if ((await visibleSearch.count()) === 0 || !(await visibleSearch.isVisible())) {
    const openBtn = page.locator('[data-testid="nav-search-open"]');
    if ((await openBtn.count()) > 0 && (await openBtn.isVisible())) {
      await openBtn.click();
      await expect(page.locator('[data-testid="search-overlay"]')).toBeVisible();
    }
  }
}

export async function fillSearchAndSubmit(page: Page, keyword: string): Promise<void> {
  await openSearchIfNeeded(page);
  await page.locator('[data-testid="search-input"]:visible').first().fill(keyword);
  await page.locator('[data-testid="search-submit"]:visible').first().click();
}

/** True when the document does not scroll horizontally (common mobile layout break). */
export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflows = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  expect(overflows).toBe(false);
}

/** Home catalog loaded with carousel, products, and no API error banners. */
export async function assertHomeCatalogHealthy(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="home-carousel-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-products-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
  await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
  await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
}

export async function openAuthModal(
  page: Page,
  mode: 'login' | 'register' = 'login'
): Promise<void> {
  await openMobileNavIfNeeded(page);
  await page.goto(`/?auth=${mode}`);
  await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
}

export async function loginAs(
  page: Page,
  user: keyof typeof TEST_USERS = 'customer'
): Promise<void> {
  const creds = TEST_USERS[user];
  await openAuthModal(page, 'login');
  await loginWithCredentials(page, creds.email, creds.password);
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, 'admin');
}

export async function logout(page: Page): Promise<void> {
  await page.locator('#username').click();
  await page.locator('[data-testid="nav-logout"]').click();
  await page.waitForURL(/\/$/);
  await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
}

export async function searchProducts(page: Page, keyword: string): Promise<void> {
  await fillSearchAndSubmit(page, keyword);
  await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
}

/** Search and open a product PDP by exact catalog name (avoids partial matches like Pro vs Pro Max). */
export async function openProductByExactName(
  page: Page,
  name: string,
  searchKeyword?: string
): Promise<void> {
  if (!page.url().includes('localhost:5020') || page.url().includes('auth=login')) {
    await page.goto('/');
  }
  await fillSearchAndSubmit(page, searchKeyword ?? name);
  await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
  const detailsResponse = page.waitForResponse(isProductDetailsApiResponse);
  await Promise.all([
    page.waitForURL(/\/product\//),
    page.getByRole('link', { name, exact: true }).first().click()
  ]);
  await detailsResponse;
  await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
}

export async function selectProductVariant(page: Page, variantSku: string): Promise<void> {
  const variantInput = page.locator(`input[data-testid="product-variant-${variantSku}"]`);
  await variantInput.scrollIntoViewIfNeeded();
  if (!(await variantInput.isChecked())) {
    const variantId = await variantInput.getAttribute('id');
    if (variantId) {
      await page.locator(`label[for="${variantId}"]`).click();
    } else {
      await variantInput.click();
    }
    await expect(variantInput).toBeChecked();
  }
  await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
}

export async function selectVariantAndAddToCart(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
  const variantPicker = page.locator('[data-testid="product-variant-picker"]');
  if ((await variantPicker.count()) > 0) {
    const selectedCount = await page
      .locator('input[data-testid^="product-variant-"]:checked:not(:disabled)')
      .count();
    if (selectedCount === 0) {
      const inStockVariant = page
        .locator('input[data-testid^="product-variant-"]:not(:disabled)')
        .first();
      await inStockVariant.scrollIntoViewIfNeeded();
      const variantId = await inStockVariant.getAttribute('id');
      if (variantId) {
        await page.locator(`label[for="${variantId}"]`).click();
      } else {
        await inStockVariant.click();
      }
      await expect(inStockVariant).toBeChecked();
    }
    await expect(page.locator('[data-testid="product-qty"]')).toBeVisible();
  }
  const addButton = page.locator('[data-testid="product-add-cart"]');
  await addButton.scrollIntoViewIfNeeded();
  await expect(addButton).toBeEnabled();
  const productUrl = page.url();
  await addButton.click();
  await expect(page).toHaveURL(productUrl);
  await expect(page.locator('[data-testid="product-add-cart-added"]')).toBeVisible();
  await expect(page.locator('[data-testid="nav-cart-count"]')).toBeVisible();
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
  await expect(page.locator('[data-testid="shipping-heading"]')).toBeVisible();
  await page.locator('[data-testid="shipping-address"]').fill('123 Test St');
  await page.locator('[data-testid="shipping-city"]').fill('Testville');
  await page.locator('[data-testid="shipping-postal-code"]').fill('12345');
  await page.locator('[data-testid="shipping-country"]').fill('United States');
  await Promise.all([
    page.waitForURL(/\/payment/),
    page.locator('[data-testid="shipping-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="payment-heading"]')).toBeVisible();
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

const AUTH_COOKIE_NAME = 'merns_shop_auth';

function extractAuthTokenFromLoginResponse(setCookieHeader: string | string[] | undefined): string {
  const cookieHeader = Array.isArray(setCookieHeader)
    ? setCookieHeader.join(';')
    : (setCookieHeader ?? '');
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) {
    throw new Error('Auth cookie missing from login response');
  }
  return match[1];
}

function authHeadersFromToken(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
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
  const authToken = extractAuthTokenFromLoginResponse(loginResponse.headers()['set-cookie']);
  const authHeaders = authHeadersFromToken(authToken);

  const productsResponse = await page.request.get('/api/products');
  expect(productsResponse.ok()).toBeTruthy();
  const { products } = (await productsResponse.json()) as ApiProductListResponse;
  const product = products.find((p) => p.variants.some((v) => v.countInStock > 0)) ?? products[0];
  expect(product).toBeDefined();
  const variant = product.variants.find((v) => v.countInStock > 0) ?? product.variants[0];
  expect(variant).toBeDefined();

  const orderResponse = await page.request.post('/api/orders', {
    headers: authHeaders,
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
    headers: authHeaders,
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
