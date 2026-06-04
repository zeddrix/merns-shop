import { test, expect } from '@playwright/test';

test.describe('api security auth', () => {
  test('protected_routes_return_401_without_token', async ({ request }) => {
    const profile = await request.get('http://localhost:5000/api/users/profile');
    expect(profile.status()).toBe(401);

    const orders = await request.get('http://localhost:5000/api/orders/myorders');
    expect(orders.status()).toBe(401);
  });

  test('non_admin_cannot_access_admin_routes', async ({ request }) => {
    const login = await request.post('http://localhost:5000/api/users/login', {
      data: { email: 'john@gmail.com', password: '123456' }
    });
    expect(login.ok()).toBeTruthy();
    const body = (await login.json()) as { token: string };

    const users = await request.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${body.token}` }
    });
    expect(users.status()).toBe(401);
  });
});
