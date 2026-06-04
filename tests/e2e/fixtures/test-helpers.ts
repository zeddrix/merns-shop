import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { TEST_USERS } from './test-users';

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

export async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('[data-testid="product-list"]').waitFor({ state: 'visible' });
  const firstCard = page.locator('[data-testid^="product-card-"]').first();
  await firstCard.locator('a').first().click();
  await page.locator('[data-testid="product-add-cart"]').click();
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
    price: number;
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
  const product = products[0];
  expect(product).toBeDefined();

  const orderResponse = await page.request.post('/api/orders', {
    data: {
      orderItems: [
        {
          name: product.name,
          qty: 1,
          image: product.image,
          price: product.price,
          product: product._id
        }
      ],
      shippingAddress: {
        address: '123 Test St',
        city: 'Testville',
        postalCode: '12345',
        country: 'United States'
      },
      paymentMethod: 'PayPal',
      itemsPrice: product.price,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: product.price
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
