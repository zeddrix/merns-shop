import { expect, type Frame, type Page } from '@playwright/test';

const PAYPAL_POPUP_TIMEOUT_MS = 60_000;
const PAYPAL_CONFIRM_TIMEOUT_MS = 120_000;
const MAX_PAYPAL_BUTTON_ATTEMPTS = 3;
const PAYPAL_CHECKOUT_START_TIMEOUT_MS = 20_000;

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

async function isPayPalHostVisible(page: Page): Promise<boolean> {
  return page
    .locator('[data-testid="paypal-buttons"], [data-testid="paypal-buttons-ready"]')
    .first()
    .isVisible()
    .catch(() => false);
}

async function waitForPayPalHostMounted(page: Page): Promise<boolean> {
  const config = await page.request.get('/api/config/paypal');
  const clientId = await config.text();
  if (!config.ok() || clientId.trim().length < 10) {
    return false;
  }

  return page
    .locator('[data-testid="paypal-buttons"], [data-testid="paypal-buttons-ready"]')
    .first()
    .isVisible()
    .catch(() => false);
}

async function isPayPalSdkReady(page: Page): Promise<boolean> {
  if (!(await waitForPayPalHostMounted(page))) {
    return false;
  }

  if (
    await page
      .locator('[data-testid="paypal-buttons-ready"]')
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }

  const host = page.locator('[data-testid="paypal-buttons"]');
  const iframe = host.locator('iframe.prerender-frame.visible, iframe.visible').first();
  return iframe.isVisible().catch(() => false);
}

function smartButtonFrameLocator(page: Page) {
  const host = page.locator('[data-testid="paypal-buttons-ready"], [data-testid="paypal-buttons"]');
  return host.first().frameLocator('iframe.prerender-frame.visible, iframe.visible').first();
}

async function clickPayPalLinkInSmartButton(page: Page): Promise<void> {
  const host = page.locator('[data-testid="paypal-buttons-ready"], [data-testid="paypal-buttons"]');
  await host.first().waitFor({ state: 'visible', timeout: 15000 });
  await host
    .first()
    .locator('iframe.prerender-frame.visible, iframe.visible')
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 });

  const smartButtonFrame = smartButtonFrameLocator(page);
  const paypalLink = smartButtonFrame.getByRole('link', { name: 'PayPal' });
  const debitLink = smartButtonFrame.getByRole('link', { name: /Debit or Credit Card/i });

  let linkKind: 'paypal' | 'debit' | '' = '';
  await expect
    .poll(
      async () => {
        if (await paypalLink.isVisible().catch(() => false)) {
          linkKind = 'paypal';
          return true;
        }
        if (await debitLink.isVisible().catch(() => false)) {
          linkKind = 'debit';
          return true;
        }
        return false;
      },
      { timeout: 15_000, intervals: [500] }
    )
    .toBe(true);

  const popupPromise = page
    .context()
    .waitForEvent('page', { timeout: PAYPAL_CHECKOUT_START_TIMEOUT_MS })
    .catch(() => null);

  if (linkKind === 'paypal') {
    await paypalLink.click();
  } else {
    await paypalLink.click({ force: true }).catch(async () => {
      await debitLink.click();
    });
  }

  const popup = await popupPromise;
  if (popup) {
    await popup.waitForLoadState('domcontentloaded');
  }
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

async function findPayPalHostedFrame(page: Page): Promise<Frame | null> {
  for (const frame of page.frames()) {
    if (/paypal\.com/i.test(frame.url())) {
      return frame;
    }
  }
  return null;
}

async function resolvePayPalCheckoutSurface(
  page: Page,
  timeoutMs = PAYPAL_POPUP_TIMEOUT_MS
): Promise<{ surface: LoginSurface; popup: Page | null }> {
  let checkoutSurface: { surface: LoginSurface; popup: Page | null } | null = null;

  await expect
    .poll(
      async () => {
        const popupPages = page
          .context()
          .pages()
          .filter((p) => p !== page);
        if (popupPages.length > 0) {
          const popup = popupPages[popupPages.length - 1];
          await popup.waitForLoadState('domcontentloaded');
          checkoutSurface = { surface: popup, popup };
          return true;
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
            checkoutSurface = { surface: launched, popup: launched };
            return true;
          }
        }

        const loginFrame = await findLoginFrame(page);
        if (loginFrame) {
          checkoutSurface = { surface: loginFrame, popup: null };
          return true;
        }

        const paypalFrame = await findPayPalHostedFrame(page);
        if (paypalFrame) {
          checkoutSurface = { surface: paypalFrame, popup: null };
          return true;
        }

        return false;
      },
      { timeout: timeoutMs, intervals: [500] }
    )
    .toBe(true);

  if (!checkoutSurface) {
    throw new Error(
      'PayPal checkout did not start (no popup, continue link, or login form). Check sandbox credentials.'
    );
  }

  return checkoutSurface;
}

async function clickPayPalConfirm(surface: LoginSurface): Promise<void> {
  const confirmSelectors = [
    '#confirmButtonTop',
    '#payment-submit-btn',
    '[data-testid="submit-button-initial"]',
    'button:has-text("Pay Now")',
    'button:has-text("Complete Purchase")',
    'button:has-text("Continue")',
    'button:has-text("Pay")'
  ];

  for (const selector of confirmSelectors) {
    const button = surface.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click({ force: true });
      return;
    }
  }

  const roleButton = surface
    .getByRole('button', { name: /pay now|complete purchase|^pay$/i })
    .first();
  await roleButton.waitFor({ state: 'visible', timeout: PAYPAL_CONFIRM_TIMEOUT_MS });
  await roleButton.click({ force: true });
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

async function stabilizeClickAndOpenCheckout(
  page: Page
): Promise<{ surface: LoginSurface; popup: Page | null }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_PAYPAL_BUTTON_ATTEMPTS; attempt += 1) {
    try {
      await expect.poll(() => waitForPayPalHostMounted(page), { timeout: 60_000 }).toBe(true);
      await expect.poll(() => isPayPalSdkReady(page), { timeout: 60_000 }).toBe(true);
      await clickPayPalLinkInSmartButton(page);
      return await resolvePayPalCheckoutSurface(page, PAYPAL_CHECKOUT_START_TIMEOUT_MS);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_PAYPAL_BUTTON_ATTEMPTS) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="order-screen"]').waitFor({ state: 'visible' });
      }
    }
  }

  const buttonsHostVisible = await isPayPalHostVisible(page);
  const buttonsReadyVisible = await page
    .locator('[data-testid="paypal-buttons-ready"]')
    .isVisible()
    .catch(() => false);

  throw new Error(
    `PayPal checkout did not start after ${MAX_PAYPAL_BUTTON_ATTEMPTS} attempts ` +
      `(paypal-buttons visible: ${buttonsHostVisible}, paypal-buttons-ready visible: ${buttonsReadyVisible}). ` +
      `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

export async function waitForPayPalButtonsReady(page: Page): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_PAYPAL_BUTTON_ATTEMPTS; attempt += 1) {
    try {
      await expect.poll(() => waitForPayPalHostMounted(page), { timeout: 60_000 }).toBe(true);
      await expect.poll(() => isPayPalSdkReady(page), { timeout: 60_000 }).toBe(true);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_PAYPAL_BUTTON_ATTEMPTS) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="order-screen"]').waitFor({ state: 'visible' });
      }
    }
  }

  throw new Error(
    `PayPal buttons did not become ready after ${MAX_PAYPAL_BUTTON_ATTEMPTS} attempts: ` +
      `${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

export async function completePayPalSandboxPayment(page: Page): Promise<void> {
  const { email, password } = requirePayPalBuyerCredentials();
  await assertPayPalClientConfigured(page);
  const { surface, popup } = await stabilizeClickAndOpenCheckout(page);
  await completePayPalLogin(surface, email, password);

  if (popup) {
    await popup
      .waitForEvent('close', { timeout: PAYPAL_CONFIRM_TIMEOUT_MS })
      .catch(() => undefined);
  }

  await page.bringToFront();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.locator('[data-testid="order-paid-message"]').waitFor({
        state: 'visible',
        timeout: PAYPAL_CONFIRM_TIMEOUT_MS
      });
      return;
    } catch {
      if (attempt === 0) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-testid="order-screen"]').waitFor({ state: 'visible' });
      }
    }
  }

  throw new Error('Order paid message did not appear after PayPal sandbox checkout');
}
