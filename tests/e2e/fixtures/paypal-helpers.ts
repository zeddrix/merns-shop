import { expect, type Frame, type Page } from '@playwright/test';

const PAYPAL_POPUP_TIMEOUT_MS = 60_000;
const PAYPAL_CONFIRM_TIMEOUT_MS = 120_000;

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

type LoginSurface = Page | Frame;

function loginLocators(surface: LoginSurface) {
  return {
    email: surface.locator('#email, input[name="login_email"], input[type="email"]').first(),
    password: surface
      .locator('#password, input[name="login_password"], input[type="password"]')
      .first(),
    next: surface.locator('#btnNext, button:has-text("Next")'),
    login: surface.locator('#btnLogin, button:has-text("Log In"), button:has-text("Log in")')
  };
}

async function assertPayPalClientConfigured(page: Page): Promise<void> {
  const response = await page.request.get('/api/config/paypal');
  const clientId = await response.text();
  if (!response.ok() || clientId.trim().length < 10) {
    throw new Error(
      'PayPal client ID is missing on the API server. Set PAYPAL_CLIENT_ID in .env.test and restart E2E servers.'
    );
  }
}

async function clickPayPalSmartButton(page: Page): Promise<void> {
  const host = page.locator('[data-testid="paypal-buttons"]');
  await host.waitFor({ state: 'visible', timeout: 30000 });
  const visiblePayPalIframe = host
    .locator('iframe.prerender-frame.visible, iframe.visible')
    .first();
  await visiblePayPalIframe.waitFor({ state: 'visible', timeout: PAYPAL_POPUP_TIMEOUT_MS });

  const smartButtonFrame = host
    .frameLocator('iframe.prerender-frame.visible, iframe.visible')
    .first();
  const paypalLink = smartButtonFrame.getByRole('link', { name: 'PayPal' });
  const debitLink = smartButtonFrame.getByRole('link', { name: /Debit or Credit Card/i });

  const deadline = Date.now() + PAYPAL_POPUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await paypalLink.isVisible().catch(() => false)) {
      await paypalLink.click();
      return;
    }
    if (await debitLink.isVisible().catch(() => false)) {
      await paypalLink.click({ force: true }).catch(async () => {
        await debitLink.click();
      });
      return;
    }
    await page.waitForTimeout(500);
  }

  await paypalLink.waitFor({ state: 'visible', timeout: 5000 });
  await paypalLink.click();
}

async function findLoginFrame(page: Page): Promise<Frame | null> {
  for (const frame of page.frames()) {
    const { email } = loginLocators(frame);
    if ((await email.count()) > 0 && (await email.isVisible().catch(() => false))) {
      return frame;
    }
  }
  return null;
}

async function resolvePayPalCheckoutSurface(
  page: Page
): Promise<{ surface: LoginSurface; popup: Page | null }> {
  const deadline = Date.now() + PAYPAL_POPUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const popupPages = page
      .context()
      .pages()
      .filter((p) => p !== page);
    if (popupPages.length > 0) {
      const popup = popupPages[popupPages.length - 1];
      await popup.waitForLoadState('domcontentloaded');
      return { surface: popup, popup };
    }

    const continueLink = page.getByRole('link', { name: 'Click to Continue' });
    if (await continueLink.isVisible().catch(() => false)) {
      const relaunchPopup = page
        .context()
        .waitForEvent('page', { timeout: PAYPAL_POPUP_TIMEOUT_MS })
        .catch(() => null);
      await continueLink.click();
      const launched = await relaunchPopup;
      if (launched) {
        await launched.waitForLoadState('domcontentloaded');
        return { surface: launched, popup: launched };
      }
    }

    const loginFrame = await findLoginFrame(page);
    if (loginFrame) {
      return { surface: loginFrame, popup: null };
    }

    await page.waitForTimeout(500);
  }

  throw new Error(
    'PayPal checkout did not start (no popup, continue link, or login form). Check sandbox credentials.'
  );
}

async function clickPayPalConfirm(surface: LoginSurface): Promise<void> {
  const confirmSelectors = [
    '#confirmButtonTop',
    '#payment-submit-btn',
    'button:has-text("Pay Now")',
    'button:has-text("Complete Purchase")',
    'button:has-text("Continue")',
    'button:has-text("Pay")'
  ];

  for (const selector of confirmSelectors) {
    const button = surface.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      return;
    }
  }

  const roleButton = surface
    .getByRole('button', { name: /pay now|complete purchase|^pay$/i })
    .first();
  await roleButton.waitFor({ state: 'visible', timeout: PAYPAL_CONFIRM_TIMEOUT_MS });
  await roleButton.click();
}

async function completePayPalLogin(
  surface: LoginSurface,
  email: string,
  password: string
): Promise<void> {
  const loc = loginLocators(surface);

  await loc.email.waitFor({ state: 'visible', timeout: PAYPAL_POPUP_TIMEOUT_MS });
  await loc.email.fill(email);

  if ((await loc.next.count()) > 0) {
    await loc.next.first().click();
  }

  await loc.password.waitFor({ state: 'visible', timeout: PAYPAL_POPUP_TIMEOUT_MS });
  await loc.password.fill(password);
  await loc.login.first().click();

  await clickPayPalConfirm(surface);
}

async function waitForPayPalButtonsReady(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await expect
        .poll(
          async () => {
            const config = await page.request.get('/api/config/paypal');
            const clientId = await config.text();
            if (!config.ok() || clientId.trim().length < 10) {
              return false;
            }
            const host = page.locator('[data-testid="paypal-buttons"]');
            if (!(await host.isVisible().catch(() => false))) {
              return false;
            }
            const iframe = host.locator('iframe.prerender-frame.visible, iframe.visible').first();
            return iframe.isVisible().catch(() => false);
          },
          { timeout: 60000 }
        )
        .toBe(true);
      return;
    } catch {
      if (attempt === 0) {
        await page.reload();
        await page.locator('[data-testid="order-screen"]').waitFor({ state: 'visible' });
      }
    }
  }

  throw new Error('PayPal buttons did not become ready on the order screen');
}

export async function completePayPalSandboxPayment(page: Page): Promise<void> {
  const { email, password } = requirePayPalBuyerCredentials();
  await assertPayPalClientConfigured(page);
  await waitForPayPalButtonsReady(page);

  await clickPayPalSmartButton(page);
  const { surface, popup } = await resolvePayPalCheckoutSurface(page);
  await completePayPalLogin(surface, email, password);

  if (popup) {
    await popup
      .waitForEvent('close', { timeout: PAYPAL_CONFIRM_TIMEOUT_MS })
      .catch(() => undefined);
  }

  await page.locator('[data-testid="order-paid-message"]').waitFor({
    state: 'visible',
    timeout: PAYPAL_CONFIRM_TIMEOUT_MS
  });
}
