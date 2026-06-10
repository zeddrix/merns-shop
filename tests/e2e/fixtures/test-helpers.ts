import type { BrowserContext, Locator, Page } from '@playwright/test';
import { expect, request as playwrightRequest } from '@playwright/test';
import { SLOW_SERVER_SESSION_WARMED_KEY } from '../../../frontend/src/constants/slowServerNotice';
import { E2E_CLIENT_URL } from '../config/e2e-ports';
import { PWA_E2E_URL } from '../config/pwa-ports';
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
export async function selectAppOption(
  page: Page,
  testId: string,
  value: string,
  search?: string
): Promise<void> {
  await page.locator(`[data-testid="${testId}-trigger"]`).click();
  if (search) {
    await page.locator(`[data-testid="${testId}-search"]`).fill(search);
  }
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

/** Expands the catalog filters panel on mobile/tablet when the toggle is shown. */
export async function openCatalogFiltersIfNeeded(page: Page): Promise<void> {
  const toggle = page.locator('[data-testid="catalog-filters-toggle"]');
  if ((await toggle.count()) === 0 || !(await toggle.isVisible())) {
    return;
  }
  const brandTrigger = page.locator('[data-testid="filter-brand-trigger"]');
  if (!(await brandTrigger.isVisible())) {
    await toggle.click();
    await expect(brandTrigger).toBeVisible();
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

/** Delays API responses to simulate free-tier cold-start UX in E2E. */
export interface DelayedCatalogApiOptions {
  delayMs: number;
  enabled: { value: boolean };
}

export interface DelayedApiOptions extends DelayedCatalogApiOptions {
  method?: string;
}

export async function registerDelayedApi(
  context: BrowserContext,
  urlPattern: string,
  options: DelayedApiOptions
): Promise<void> {
  await context.route(urlPattern, async (route) => {
    const methodMatches = !options.method || route.request().method() === options.method;
    if (options.enabled.value && methodMatches) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    await route.continue();
  });
}

export async function registerDelayedCatalogApi(
  context: BrowserContext,
  options: DelayedCatalogApiOptions
): Promise<void> {
  await registerDelayedApi(context, '**/api/products**', options);
}

/** Clears slow-server session warmed flag before the next navigation (E2E isolation). */
export async function installSlowServerSessionReset(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    sessionStorage.removeItem(key);
  }, SLOW_SERVER_SESSION_WARMED_KEY);
}

/** Clears slow-server session warmed flag on the current document (requires app origin). */
export async function clearSlowServerSessionWarmed(page: Page): Promise<void> {
  await page.evaluate((key) => sessionStorage.removeItem(key), SLOW_SERVER_SESSION_WARMED_KEY);
}

/** Clears in-memory catalog fetch cache so blocked API routes surface unreachable UI. */
export async function clearClientFetchCache(page: Page): Promise<void> {
  await page.evaluate(() => window.__e2eClearFetchCache?.());
}

/** Home catalog loaded with carousel, products, and no API error banners. */
export async function assertHomeCatalogHealthy(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-carousel-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-products-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="product-carousel"]')).toBeVisible();
  await page.locator('[data-testid="product-list"]').first().waitFor({ state: 'visible' });
  await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
}

/** Filtered catalog without carousel — subcategory or filter query active. */
export async function assertFilteredCatalogHealthy(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="slow-server-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-carousel-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="home-products-error"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="product-carousel"]')).toHaveCount(0);
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

/** Locates a catalog card whose title exactly matches `name` (not partial substring matches). */
export function productCardByExactName(page: Page, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page
    .locator('[data-testid^="product-card-"]')
    .filter({ has: page.locator('strong', { hasText: new RegExp(`^${escaped}$`) }) })
    .first();
}

/** Clicks a catalog card price area to open the PDP (proves whole-card navigation). */
export async function clickProductCardToPdp(card: Locator): Promise<void> {
  await Promise.all([
    card.page().waitForURL(/\/product\//),
    card.locator('[data-testid="product-price-display"]').click()
  ]);
}

/** Search and open a product PDP by exact catalog name (avoids partial matches like Pro vs Pro Max). */
export async function openProductByExactName(
  page: Page,
  name: string,
  searchKeyword?: string
): Promise<void> {
  if (!page.url().includes(E2E_CLIENT_URL) || page.url().includes('auth=login')) {
    await page.goto('/');
  }
  await fillSearchAndSubmit(page, searchKeyword ?? name);
  await expect(page.locator('[data-testid="product-list"]').first()).toBeVisible();
  const card = productCardByExactName(page, name);
  await expect(card).toBeVisible();
  const detailsResponse = page.waitForResponse(isProductDetailsApiResponse);
  await Promise.all([page.waitForURL(/\/product\//), clickProductCardToPdp(card)]);
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
  await clickProductCardToPdp(inStockCard);
  await selectVariantAndAddToCart(page);
}

/** @deprecated Use addFirstInStockProductToCart */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await addFirstInStockProductToCart(page);
}

export async function completeCheckoutStep(
  page: Page,
  country = 'United States',
  countrySearch?: string
): Promise<void> {
  await page.goto('/checkout');
  await expect(page.locator('[data-testid="checkout-heading"]')).toBeVisible();
  await page.locator('[data-testid="checkout-address"]').fill('123 Test St');
  await page.locator('[data-testid="checkout-city"]').fill('Testville');
  await page.locator('[data-testid="checkout-postal-code"]').fill('12345');
  await selectAppOption(page, 'checkout-country', country, countrySearch);
}

/** @deprecated Use completeCheckoutStep — unified checkout has no separate shipping route. */
export async function completeShippingStep(page: Page): Promise<void> {
  await completeCheckoutStep(page);
}

/** @deprecated Unified checkout — payment is implicit; use checkout-place-order-submit instead. */
export async function completePaymentStep(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="checkout-screen"]')).toBeVisible();
}

/** Guest checkout from cart through place order to unpaid order screen. Returns order id. */
export async function guestCheckoutPlaceUnpaidOrder(page: Page): Promise<string> {
  await addFirstProductToCart(page);
  await page.goto('/cart');
  await page.locator('[data-testid="cart-checkout"]').click();
  await expect(page).toHaveURL(/auth=login/);
  await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
  await completeCheckoutStep(page);

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

export async function createUnpaidOrderViaApi(
  page: Page,
  user: keyof typeof TEST_USERS = 'customer',
  clearSessionAfter = true
): Promise<string> {
  const creds = TEST_USERS[user];
  const loginResponse = await page.request.post('/api/users/login', {
    data: { email: creds.email, password: creds.password }
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

  if (clearSessionAfter) {
    await page.context().clearCookies();
  }

  return order._id;
}

export async function deliverOrderViaApi(
  page: Page,
  orderId: string,
  clearSessionAfter = true
): Promise<void> {
  const adminCreds = TEST_USERS.admin;
  const baseURL = resolveApiBaseUrl(page);
  const apiContext = await playwrightRequest.newContext({ baseURL });

  try {
    const loginResponse = await apiContext.post('/api/users/login', {
      data: { email: adminCreds.email, password: adminCreds.password }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const authToken = extractAuthTokenFromLoginResponse(loginResponse.headers()['set-cookie']);
    const authHeaders = authHeadersFromToken(authToken);

    const deliverResponse = await apiContext.put(`/api/orders/${orderId}/deliver`, {
      headers: authHeaders
    });
    expect(deliverResponse.ok()).toBeTruthy();
  } finally {
    await apiContext.dispose();
  }

  if (clearSessionAfter) {
    await page.context().clearCookies();
  }
}

/** Opens the Admin nav dropdown so admin menu links are visible. */
export async function openAdminNavDropdown(page: Page): Promise<void> {
  await openMobileNavIfNeeded(page);
  const adminMenu = page.locator('#adminmenu');
  await expect(adminMenu).toBeVisible();
  await adminMenu.click();
}

export async function fetchFirstProductId(page: Page): Promise<string> {
  const productsResponse = await page.request.get('/api/products');
  expect(productsResponse.ok()).toBeTruthy();
  const { products } = (await productsResponse.json()) as ApiProductListResponse;
  const productId = products[0]?._id;
  expect(productId).toBeTruthy();
  return productId as string;
}

const E2E_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? E2E_CLIENT_URL;

function resolveApiBaseUrl(page: Page): string {
  try {
    const origin = new URL(page.url()).origin;
    if (origin && origin !== 'null' && !origin.startsWith('about:')) {
      return origin;
    }
  } catch {
    // fall through to configured default
  }
  return process.env.PWA_SERVER_RUNNING === '1' ? PWA_E2E_URL : E2E_BASE_URL;
}

export async function fetchSeededUserId(_page: Page, email: string): Promise<string> {
  const apiContext = await playwrightRequest.newContext({ baseURL: E2E_BASE_URL });
  try {
    const loginResponse = await apiContext.post('/api/users/login', {
      data: { email: TEST_USERS.admin.email, password: TEST_USERS.admin.password }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const authToken = extractAuthTokenFromLoginResponse(loginResponse.headers()['set-cookie']);
    const usersResponse = await apiContext.get('/api/users', {
      headers: authHeadersFromToken(authToken)
    });
    expect(usersResponse.ok()).toBeTruthy();
    const users = (await usersResponse.json()) as Array<{ _id: string; email: string }>;
    const user = users.find((entry) => entry.email === email);
    expect(user?._id).toBeTruthy();
    return user?._id as string;
  } finally {
    await apiContext.dispose();
  }
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

export interface GuestDeepLinkAuthGateOptions {
  reopenSignIn?: boolean;
  expectedAuthUrl?: RegExp;
  /** Path after client-side redirects (e.g. legacy /shipping → /checkout). */
  resolvedPath?: string;
}

/** Guest deep-link to a protected route: modal opens, dismiss shows inline auth gate. */
export async function assertGuestDeepLinkAuthGate(
  page: Page,
  path: string,
  options?: GuestDeepLinkAuthGateOptions
): Promise<void> {
  const pathOnly = options?.resolvedPath ?? path.split('?')[0];
  const escapedPath = pathOnly.replace(/\//g, '\\/');
  const defaultAuthUrl = new RegExp(`${escapedPath}\\?auth=login`);

  await page.goto(path);
  await expect(page).toHaveURL(options?.expectedAuthUrl ?? defaultAuthUrl);
  await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  await page.locator('[data-testid="auth-modal-close"]').click();
  await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${escapedPath}$`));
  await expect(page.locator('[data-testid="auth-gate"]')).toBeVisible();

  if (options?.reopenSignIn) {
    await page.locator('[data-testid="auth-gate-sign-in"]').click();
    await expect(page).toHaveURL(new RegExp(`${escapedPath}\\?auth=login`));
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  }
}

export async function registerWithCredentials(
  page: Page,
  name: string,
  email: string,
  password: string
): Promise<void> {
  await page.locator('[data-testid="register-name"]').fill(name);
  await page.locator('[data-testid="register-email"]').fill(email);
  await page.locator('[data-testid="register-password"]').fill(password);
  await page.locator('[data-testid="register-confirm-password"]').fill(password);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/users') && response.status() === 201
    ),
    page.locator('[data-testid="register-submit"]').click()
  ]);
  await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
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

export async function payOrderViaApi(
  page: Page,
  orderId: string,
  user: keyof typeof TEST_USERS = 'customer'
): Promise<void> {
  const creds = TEST_USERS[user];
  const loginResponse = await page.request.post('/api/users/login', {
    data: { email: creds.email, password: creds.password }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const authToken = extractAuthTokenFromLoginResponse(loginResponse.headers()['set-cookie']);
  const payResponse = await page.request.put(`/api/orders/${orderId}/pay`, {
    headers: authHeadersFromToken(authToken),
    data: {
      id: 'e2e-payment-id',
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      payer: { email_address: creds.email }
    }
  });
  expect(payResponse.status()).toBe(200);
}

export async function deliverE2ePushViaServiceWorker(
  page: Page,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<void> {
  await page.evaluate(async (data) => {
    const registration = await navigator.serviceWorker.ready;
    const worker = navigator.serviceWorker.controller ?? registration.active;
    if (!worker) {
      throw new Error('No service worker controller for e2e-deliver-push');
    }
    worker.postMessage({ type: 'e2e-deliver-push', payload: data });
  }, payload);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const win = window as Window & { __e2eLastPush?: { title?: string } };
          return win.__e2eLastPush?.title ?? null;
        }),
      { timeout: 10000 }
    )
    .toBe(payload.title);
}

export async function tryEnsureRealPushSubscription(
  page: Page,
  vapidPublicKey: string
): Promise<boolean> {
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Browser.setPermission', {
      permission: { name: 'notifications' },
      setting: 'granted',
      origin: new URL(page.url()).origin
    });

    await page.evaluate(async (publicKey) => {
      const registration = await navigator.serviceWorker.ready;
      const key = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), (char) =>
        char.charCodeAt(0)
      );
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key
        });
      }
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON())
      });
    }, vapidPublicKey);
    return true;
  } catch {
    return false;
  }
}
