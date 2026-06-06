import { test, expect } from '@playwright/test';
import { assertGuestDeepLinkAuthGate } from '../fixtures/test-helpers';
import { findUserByEmail } from '../fixtures/mongo-helpers';
import { TEST_USERS } from '../fixtures/test-users';

/** API calls use baseURL (:5020) and Vite proxy — same path as the browser UI. */
test.describe('api security auth', () => {
  test('protected_routes_return_401_without_token', async ({ request }) => {
    const profile = await request.get('/api/users/profile');
    expect(profile.status()).toBe(401);

    const orders = await request.get('/api/orders/myorders');
    expect(orders.status()).toBe(401);
  });

  test('non_admin_cannot_access_admin_routes', async ({ request }) => {
    const login = await request.post('/api/users/login', {
      data: { email: 'john@gmail.com', password: '123456' }
    });
    expect(login.ok()).toBeTruthy();

    const users = await request.get('/api/users');
    expect(users.status()).toBe(401);
  });

  test('guest_admin_list_routes_show_auth_gate_after_dismiss', async ({ page }) => {
    const productsResponse = await page.request.get('/api/products');
    expect(productsResponse.ok()).toBeTruthy();
    const productsBody = (await productsResponse.json()) as {
      products: Array<{ _id: string }>;
    };
    const productId = productsBody.products[0]?._id;
    expect(productId).toBeTruthy();

    const customer = await findUserByEmail(TEST_USERS.customer.email);
    expect(customer?._id).toBeTruthy();
    const userId = String(customer?._id);

    const adminListRoutes = ['/admin/productlist', '/admin/userlist', '/admin/orderlist'] as const;

    for (const route of adminListRoutes) {
      await assertGuestDeepLinkAuthGate(page, route);
    }

    await assertGuestDeepLinkAuthGate(page, `/admin/product/${productId}/edit`);
    await assertGuestDeepLinkAuthGate(page, `/admin/user/${userId}/edit`);
  });

  test('admin_nav_hidden_for_customer', async ({ page }) => {
    await page.goto('/?auth=login');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="login-email"]').fill('john@gmail.com');
    await page.locator('[data-testid="login-password"]').fill('123456');
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await expect(page.locator('[data-testid="nav-admin-products"]')).toHaveCount(0);
  });
});
