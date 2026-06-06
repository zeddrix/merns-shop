import { test, expect } from '@playwright/test';
import {
  loginAs,
  loginWithCredentials,
  logout,
  openAuthModal,
  openMobileNavIfNeeded,
  openProductByExactName,
  registerWithCredentials
} from '../fixtures/test-helpers';
import { resetE2eDatabase } from '../fixtures/reset-db';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('auth login register profile', () => {
  test.beforeEach(async ({ context }) => {
    await resetE2eDatabase(context);
  });

  test('logged_in_user_hides_sign_in_and_sign_up_nav', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/');
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
    await expect(page.locator('[data-testid="nav-sign-up"]')).toBeHidden();
  });

  test('nav_sign_up_reaches_register_form', async ({ page }) => {
    await page.goto('/');
    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-sign-up"]').click();
    await expect(page).toHaveURL(/auth=register/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-heading"]')).toBeVisible();
  });

  test('header_sign_in_does_not_refetch_catalog', async ({ page }) => {
    let productListRequests = 0;
    page.on('request', (request) => {
      if (request.method() === 'GET' && /\/api\/products(\?|$)/.test(request.url())) {
        productListRequests += 1;
      }
    });

    await page.goto('/');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    const requestsAfterLoad = productListRequests;

    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-login"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page).toHaveURL(/auth=login/);
    expect(productListRequests).toBe(requestsAfterLoad);

    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    expect(productListRequests).toBe(requestsAfterLoad);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test('login_wrong_password_shows_error', async ({ page }) => {
    await openAuthModal(page, 'login');
    await page.locator('[data-testid="login-email"]').fill(TEST_USERS.customer.email);
    await page.locator('[data-testid="login-password"]').fill('wrong-password');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users/login') && response.status() === 401
      ),
      page.locator('[data-testid="login-submit"]').click()
    ]);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
  });

  test('login_invalid_email_shows_field_error', async ({ page }) => {
    let loginRequested = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/users/login')) {
        loginRequested = true;
      }
    });

    await openAuthModal(page, 'login');
    await page.locator('[data-testid="login-email"]').fill('not-an-email');
    await page.locator('[data-testid="login-password"]').fill('secret');
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page.locator('[data-testid="login-email-error"]')).toBeVisible();
    expect(loginRequested).toBe(false);
  });

  test('register_validation_requires_matching_passwords', async ({ page }) => {
    let registerRequested = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/users')) {
        registerRequested = true;
      }
    });

    await openAuthModal(page, 'register');
    await page.locator('[data-testid="register-name"]').fill('Invalid User');
    await page.locator('[data-testid="register-email"]').fill('invalid@example.com');
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('654321');
    await page.locator('[data-testid="register-submit"]').click();

    await expect(page.locator('[data-testid="register-password-mismatch"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    expect(registerRequested).toBe(false);
  });

  test('register_validation_requires_min_password_length', async ({ page }) => {
    let registerRequested = false;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/users')) {
        registerRequested = true;
      }
    });

    await openAuthModal(page, 'register');
    await page.locator('[data-testid="register-name"]').fill('Short Password User');
    await page.locator('[data-testid="register-email"]').fill('short@example.com');
    await page.locator('[data-testid="register-password"]').fill('12345');
    await page.locator('[data-testid="register-confirm-password"]').fill('12345');
    await page.locator('[data-testid="register-submit"]').click();

    await expect(page.locator('[data-testid="register-password-too-short"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    expect(registerRequested).toBe(false);
  });

  test('register_duplicate_email_shows_error', async ({ page }) => {
    await openAuthModal(page, 'register');
    await page.locator('[data-testid="register-name"]').fill('Duplicate User');
    await page.locator('[data-testid="register-email"]').fill(TEST_USERS.customer.email);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 400
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);
    await expect(page.locator('[data-testid="register-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-sign-up"]')).toBeVisible();
  });

  test('checkout_step_sign_in_includes_redirect', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/shipping');
    const signInHref = await page
      .locator('[data-testid="checkout-step-signin"]')
      .getAttribute('href');
    const signUpHref = await page
      .locator('[data-testid="checkout-step-sign-up"]')
      .getAttribute('href');
    expect(signInHref).toContain('auth=login');
    expect(signInHref).toContain('redirect=%2Fshipping');
    expect(signUpHref).toContain('auth=register');
    expect(signUpHref).toContain('redirect=%2Fshipping');
  });

  test('login_does_not_store_userInfo_in_localStorage', async ({ page }) => {
    await loginAs(page, 'customer');
    const stored = await page.evaluate(() => localStorage.getItem('userInfo'));
    expect(stored).toBeNull();
  });

  test('session_persists_after_reload', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.reload();
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
  });

  test('logout_clears_session_and_blocks_profile', async ({ page }) => {
    await loginAs(page, 'customer');
    await logout(page);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  });

  test('register_success_shows_welcome_on_home', async ({ page }) => {
    const unique = Date.now();
    await openAuthModal(page, 'register');
    await page.locator('[data-testid="register-name"]').fill('Welcome User');
    await page.locator('[data-testid="register-email"]').fill(`welcome-${unique}@example.com`);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-testid="register-welcome"]')).toContainText(
      'Welcome, Welcome User'
    );
    await expect(page.locator('[data-testid="nav-login"]')).toBeHidden();
  });

  test('nav_sign_in_on_pdp_syncs_auth_query', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    const productPath = new URL(page.url()).pathname;

    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-login"]').click();

    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}\\?.*auth=login`));
    await expect(page.url()).toContain(`redirect=${encodeURIComponent(productPath)}`);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();

    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}$`));
  });

  test('legacy_login_route_without_redirect_opens_modal_on_home', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/\?auth=login/);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test('legacy_login_route_opens_modal_on_redirect_target', async ({ page }) => {
    await page.goto('/');
    const productHref = await page
      .locator('[data-testid^="product-card-"]')
      .first()
      .getAttribute('href');
    expect(productHref).toBeTruthy();

    await page.goto(`/login?redirect=${encodeURIComponent(productHref as string)}`);
    await expect(page).toHaveURL(
      new RegExp(`${(productHref as string).replace(/\//g, '\\/')}\\?.*auth=login`)
    );
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="product-details"], [data-testid="product-list"]')
    ).toBeVisible();
  });

  test('nav_sign_in_on_pdp_login_returns_to_pdp', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    const productPath = new URL(page.url()).pathname;

    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-login"]').click();
    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}\\?.*auth=login`));
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}$`));
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
  });

  test('nav_sign_up_on_pdp_syncs_auth_query', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    const productPath = new URL(page.url()).pathname;

    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-sign-up"]').click();

    await expect(page).toHaveURL(
      new RegExp(`${productPath.replace(/\//g, '\\/')}\\?.*auth=register`)
    );
    await expect(page.url()).toContain(`redirect=${encodeURIComponent(productPath)}`);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-heading"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();

    await page.locator('[data-testid="auth-modal-close"]').click();
    await expect(page.locator('[data-testid="auth-modal"]')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}$`));
  });

  test('nav_sign_up_on_pdp_register_returns_to_pdp', async ({ page }) => {
    await openProductByExactName(page, 'iPhone 15 Pro');
    const productPath = new URL(page.url()).pathname;
    const unique = Date.now();

    await openMobileNavIfNeeded(page);
    await page.locator('[data-testid="nav-sign-up"]').click();
    await expect(page).toHaveURL(
      new RegExp(`${productPath.replace(/\//g, '\\/')}\\?.*auth=register`)
    );
    await registerWithCredentials(
      page,
      'PDP Register User',
      `pdp-register-${unique}@example.com`,
      '123456'
    );
    await expect(page).toHaveURL(new RegExp(`${productPath.replace(/\//g, '\\/')}$`));
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-welcome"]')).toHaveCount(0);
  });

  test('login_honors_redirect_query', async ({ page }) => {
    await page.goto('/profile?auth=login&redirect=%2Fprofile');
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await loginWithCredentials(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
  });

  test('register_honors_redirect_query', async ({ page }) => {
    const unique = Date.now();
    await page.goto(`/?auth=register&redirect=${encodeURIComponent('/shipping')}`);
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    await page.locator('[data-testid="register-name"]').fill('Redirect User');
    await page.locator('[data-testid="register-email"]').fill(`redirect-${unique}@example.com`);
    await page.locator('[data-testid="register-password"]').fill('123456');
    await page.locator('[data-testid="register-confirm-password"]').fill('123456');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/users') && response.status() === 201
      ),
      page.locator('[data-testid="register-submit"]').click()
    ]);
    await expect(page).toHaveURL(/\/shipping/);
  });

  test('seeded_customer_login_shows_profile_and_orders', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/profile');
    await expect(page.locator('[data-testid="profile-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="my-orders-table"]')).toBeVisible();

    await logout(page);
    await openAuthModal(page, 'login');
    await expect(page.locator('[data-testid="login-heading"]')).toBeVisible();
  });
});
