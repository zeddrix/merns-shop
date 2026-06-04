import type { Page } from '@playwright/test';

function requirePayPalBuyerCredentials(): { email: string; password: string } {
  const email = process.env.PAYPAL_SANDBOX_BUYER_EMAIL;
  const password = process.env.PAYPAL_SANDBOX_BUYER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'PAYPAL_SANDBOX_BUYER_EMAIL and PAYPAL_SANDBOX_BUYER_PASSWORD are required for PayPal E2E'
    );
  }

  return { email, password };
}

export async function completePayPalSandboxPayment(page: Page): Promise<void> {
  const { email, password } = requirePayPalBuyerCredentials();

  await page.locator('[data-testid="paypal-buttons"]').waitFor({ state: 'visible' });

  const paypalFrame = page.frameLocator('iframe[title="PayPal"]').first();
  const popupPromise = page.context().waitForEvent('page', { timeout: 60000 });

  await paypalFrame.locator('[data-testid="paypal-button"], .paypal-button').first().click({
    timeout: 60000
  });

  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  const emailInput = popup.locator('#email, input[name="login_email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 60000 });
  await emailInput.fill(email);

  const nextButton = popup.locator('#btnNext, button:has-text("Next")');
  if (await nextButton.count()) {
    await nextButton.first().click();
  }

  const passwordInput = popup.locator('#password, input[name="login_password"]');
  await passwordInput.waitFor({ state: 'visible', timeout: 60000 });
  await passwordInput.fill(password);

  const loginButton = popup.locator('#btnLogin, button:has-text("Log In")');
  await loginButton.first().click();

  const confirmButton = popup.locator('#confirmButtonTop, button:has-text("Pay")');
  await confirmButton.first().waitFor({ state: 'visible', timeout: 60000 });
  await confirmButton.first().click();

  await popup.waitForEvent('close', { timeout: 120000 }).catch(() => undefined);
  await page.locator('[data-testid="order-paid-message"]').waitFor({
    state: 'visible',
    timeout: 120000
  });
}
