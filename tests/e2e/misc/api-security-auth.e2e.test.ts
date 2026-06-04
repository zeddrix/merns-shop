import { test, expect } from '@playwright/test';

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

  test('admin_nav_hidden_for_customer', async ({ page }) => {
    await page.goto('/login');
    await page.locator('[data-testid="login-email"]').fill('john@gmail.com');
    await page.locator('[data-testid="login-password"]').fill('123456');
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await expect(page.locator('[data-testid="nav-admin-products"]')).toHaveCount(0);
  });
});
