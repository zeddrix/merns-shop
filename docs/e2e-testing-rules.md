# E2E Testing Rules

Mern's Shop follows ATDD — E2E acceptance tests are written before production code to define expected behavior.

## Core Philosophy

**Test REAL user journeys, not element existence.** Every E2E test must simulate what a user actually does — clicking, typing, navigating, submitting — and verify meaningful outcomes. If a test only checks that an element is visible without any user action, it belongs in a unit test or shouldn't exist at all.

## Mandatory Rules

### 1. Every test must have multiple user actions AND verify an outcome

A test that only asserts visibility proves nothing. Every test must include at least 2 user actions (click, type, navigate, submit) and verify that something meaningful happened (order created, cart updated, page navigated, error displayed, admin list refreshed).

### 2. Real PayPal sandbox checkout for paid-order flows

Use the real PayPal sandbox button and buyer credentials for any test that completes a paid purchase. Never route-intercept PayPal or order APIs to return fake success payloads and then "verify" that fake data appears — that tests your mock, not your app.

**Exception**: Route interception is OK for capturing request bodies (to verify correct parameters were sent) as long as the request still continues to the real destination via `route.continue()`.

**Opt-in PayPal specs** (`tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts`) require `PAYPAL_SANDBOX_BUYER_EMAIL` and `PAYPAL_SANDBOX_BUYER_PASSWORD` in `.env.test`. They are excluded from default CI when credentials are missing (`test.skip` in `beforeEach` / describe).

### 3. Simulated payment state ONLY when PayPal cannot be exercised

Prefer real PayPal sandbox for checkout → place order → paid confirmation. Use API-level order creation or direct Mongo updates only when:

- Testing admin fulfillment on orders that already exist in the DB
- Testing auth/security isolation without payment UI
- PayPal credentials are unavailable (document skip; do not fake PayPal success in default CI)

Handler semantics for PayPal callbacks, idempotency, and invalid payloads belong in integration/unit tests (`tests/integration/api/orders.integration.test.ts`, `tests/unit/backend/orderController.unit.test.ts`), not duplicated as shallow E2E.

### 4. Complete UI state verification

When checking checkout, order, or admin list pages, verify ALL relevant elements — not just one.

**Minimum for checkout / order verification:**

- Checkout steps (`checkout-step-signin`, `checkout-step-shipping`, `checkout-step-payment`, `checkout-step-place-order`)
- Cart line items and totals when applicable (`cart-item-*`, `cart-checkout`)
- Order screen heading and payment state (`order-screen`, `order-heading`, PayPal buttons when unpaid)
- Admin order/product rows when testing fulfillment (`admin-order-*`, `admin-product-*`)

**Minimum for catalog verification:**

- Product list or search results (`product-list`, `product-card-*`)
- Product detail actions (`product-add-cart`, `review-form` when testing reviews)

### 5. Cross-system verification after mutations

After any mutation (form submission, admin CRUD, checkout), verify BOTH the MongoDB state AND the UI state when the test owns that data. Use helpers in `tests/e2e/fixtures/mongo-helpers.ts` and `tests/integration/helpers/db.ts` patterns (connect, query, disconnect). A UI-only test missed persistence bugs; a DB-only test missed React Bootstrap rendering bugs.

### 6. Consolidated test files by feature domain

Group tests by feature domain, not by individual scenario. The shop should keep at most one primary file per domain:

| Domain                                  | Canonical file(s)                                       |
| --------------------------------------- | ------------------------------------------------------- |
| Smoke / boot                            | `tests/e2e/smoke/app-boot.e2e.test.ts`                  |
| Auth & profile                          | `tests/e2e/auth/login-register-profile.e2e.test.ts`     |
| Catalog browse & search                 | `tests/e2e/catalog/product-browse-search.e2e.test.ts`   |
| Product reviews                         | `tests/e2e/catalog/product-reviews.e2e.test.ts`         |
| Cart, shipping, payment (non-PayPal UI) | `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts`  |
| PayPal sandbox (opt-in)                 | `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts` |
| Admin products                          | `tests/e2e/admin/admin-products.e2e.test.ts`            |
| Admin orders                            | `tests/e2e/admin/admin-orders.e2e.test.ts`              |
| Admin users                             | `tests/e2e/admin/admin-users.e2e.test.ts`               |
| API security                            | `tests/e2e/misc/api-security-auth.e2e.test.ts`          |

Do NOT create one file per scenario (e.g., separate files for "search button", "product card link").

### 7. No duplicate coverage across files

If File A tests "guest reaches place order screen", File B must NOT repeat the same golden path unless it is the canonical journey owner (see `docs/e2e-canonical-ownership.md`). Focused specs cover validation, permissions, and edge cases only.

### 8. State isolation with beforeEach resets

Every test file that modifies shared DB state (products, orders, users, reviews) MUST reset in `beforeEach` — not just `afterAll`. Playwright default worker count is **1** (see `playwright.config.ts`; override with `PW_WORKERS`). Global setup runs `pnpm db:seed` once; tests that mutate data should re-seed or clean targeted documents in `beforeEach`.

```typescript
// GOOD: Reset before EACH test (integration pattern — mirror in E2E when mutating DB)
test.beforeEach(async () => {
  await seedDatabase(); // or targeted cleanup via mongo-helpers
});

// BAD: Only reset after all tests (other files see dirty state mid-run)
test.afterAll(async () => {
  await seedDatabase();
});
```

### 9. Admin gating tests must verify the full gate-to-access cycle

Don't just check that a non-admin gets 401 from the API. For UI flows: navigate as customer → confirm admin nav links absent or routes blocked → log in as admin → verify admin screens load and actions persist.

### 10. Use data-testid selectors, avoid strict mode violations

Always use `[data-testid="..."]` selectors for key elements. Avoid unscoped `getByText()` or CSS selectors that match multiple React Bootstrap nodes. When `getByText()` is necessary, scope it to a container (e.g., a specific table row) or use `.first()` only when semantically correct.

```typescript
// GOOD
page.locator('[data-testid="login-submit"]');
page.locator('[data-testid="admin-product-list"]');

// BAD — matches multiple elements, strict mode violation
page.getByText('Products');
page.locator('button:has-text("Delete")');
```

## Banned Patterns

These patterns indicate shallow tests that waste CI time and give false confidence.

### "Page title contains X"

```typescript
// BAD — unit test territory
test('home has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Mern/);
});
```

### "Button is visible" with no action

```typescript
// BAD — proves nothing about functionality
test('checkout button is visible', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.locator('[data-testid="cart-checkout"]')).toBeVisible();
});
```

### "Element has text X" with no preceding user action

```typescript
// BAD — static HTML check, not a user journey
test('shows latest products heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="home-heading"]')).toBeVisible();
});
```

### Route interception that returns fake PayPal success

```typescript
// BAD — tests your mock, not your app
test('paypal works', async ({ page }) => {
  await page.route('**/api/orders/**', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ isPaid: true }) })
  );
  await page.locator('[data-testid="place-order-submit"]').click();
  await expect(page.getByText('Paid')).toBeVisible();
});
```

### Testing CSS classes or computed styles

```typescript
// BAD — visual regression tools exist for this
test('primary button has correct color', async ({ page }) => {
  const btn = page.locator('[data-testid="login-submit"]');
  await expect(btn).toHaveCSS('background-color', 'rgb(13, 110, 253)');
});
```

### Testing localStorage/sessionStorage values directly

```typescript
// BAD — implementation detail (Redux persist / cart slice internals)
test('stores cart in localStorage', async ({ page }) => {
  await page.evaluate(() => localStorage.getItem('cartItems'));
});
```

Prefer asserting cart UI (`cart-item-*`, quantities) after user actions instead.

## Required Patterns

### React Bootstrap forms and native controls

This app uses React Bootstrap (`Form`, `Button`, `Nav`, `Table`) — not custom Svelte comboboxes. For `<select>` elements (e.g., review rating, cart quantity), use Playwright's `selectOption` or fill/check patterns with ≥2 user actions and a verified outcome.

### Multi-step journey: action → result → consequence

```typescript
test('guest checkout: cart → shipping → payment → place order', async ({ page }) => {
  await addFirstProductToCart(page);
  await page.locator('[data-testid="nav-cart"]').click();
  await page.locator('[data-testid="cart-checkout"]').click();
  await completeShippingStep(page);
  await completePaymentStep(page);
  await page.locator('[data-testid="place-order-submit"]').click();

  await expect(page.locator('[data-testid="order-screen"]')).toBeVisible();
  await expect(page.locator('[data-testid="order-heading"]')).toBeVisible();
});
```

### MongoDB verification after user actions

```typescript
test('admin creates product visible in catalog', async ({ page }) => {
  const productName = `E2E Product ${Date.now()}`;
  await loginAsAdmin(page);
  // ... create product via admin UI ...

  await mongoose.connect(process.env.MONGO_URI!);
  const doc = await Product.findOne({ name: productName });
  expect(doc).not.toBeNull();
  await mongoose.disconnect();
});
```

### Error recovery: trigger error → verify message → recover

```typescript
test('login with wrong password shows error then succeeds', async ({ page }) => {
  await page.goto('/login');
  await page.locator('[data-testid="login-email"]').fill('john@gmail.com');
  await page.locator('[data-testid="login-password"]').fill('wrong');
  await page.locator('[data-testid="login-submit"]').click();
  await expect(page.locator('[data-testid="alert-message"]')).toBeVisible();

  await page.locator('[data-testid="login-password"]').fill('123456');
  await page.locator('[data-testid="login-submit"]').click();
  await expect(page.locator('[data-testid="site-brand"]')).toBeVisible();
});
```

## Prevention Rules

### 11. Pre-commit checklist for every new test

Before any E2E test is considered done, it must pass ALL of these gates:

- Does every `test()` block have ≥2 user actions (click/type/submit/navigate)?
- Does every `test()` verify an **outcome** (data saved, state changed, page navigated, error displayed) — not just element visibility?
- Could this test be a unit or integration test instead? (If it only checks static HTML or a single API status → move it)
- Is there already a test in the same file that navigates to the same page? If yes → extend that test instead of creating a new `test()` block.
- Does the test use `data-testid` selectors for all critical interactions?

### 12. Consolidation-first — no new files without justification

Before creating a new `.e2e.test.ts` file:

1. Search for existing files in the same feature domain (`auth/`, `catalog/`, `checkout/`, `admin/`, `misc/`)
2. If one exists, add your tests under a new `test.describe()` block
3. New files are only justified when: (a) no existing file covers this domain, or (b) the existing file would exceed ~50 tests and splitting by sub-domain makes sense
4. Never create a file with fewer than 3 tests — those tests belong in an existing file (journey files may start with one golden test but must grow)

### 13. Merge same-page checks into consolidated tests

When 3+ assertions all require navigating to the same page:

- Use ONE `test()` that navigates once and asserts multiple things
- Use `test.describe()` with `test.beforeEach()` for shared navigation when tests need different user actions on the same page
- Never create separate `test()` blocks that each navigate to the same URL just to check one element

## Test Organization

### File naming

- E2E tests: `*.e2e.test.ts`
- Group by feature domain: `cart-shipping-payment.e2e.test.ts`, not `checkout-button-click.e2e.test.ts`

### Journey vs focused files (mandatory)

- Keep **focused tests** in feature-domain folders (`auth/`, `catalog/`, `checkout/`, `admin/`, `misc/`, `smoke/`).
- Put only **cross-domain, multi-step golden paths** in `tests/e2e/journeys/` with filename pattern `journey-*.e2e.test.ts`.
- Every behavior must have exactly one canonical home. If a journey asserts it, focused specs should cover edge cases only (validation, permissions, security, retries) without duplicating the same end-to-end outcome.
- See `docs/e2e-canonical-ownership.md` and `docs/e2e-journey-coverage-matrix.md`.

**Commands:**

- All default specs: `pnpm test:e2e`
- Single worker (recommended for DB-mutating suites): `pnpm test:e2e:one`
- Journey-only specs: `pnpm test:e2e:journeys`
- Single file: `pnpm test:e2e:one -- tests/e2e/checkout/cart-shipping-payment.e2e.test.ts`

### When to use serial vs parallel

- **`test.describe.serial`**: When tests mutate shared state and depend on execution order (e.g., admin creates product then edits same product in one file without re-seed between steps)
- **Default (parallel)**: When tests are independent — each resets its own state in `beforeEach`

### Worker count

Pass **Playwright CLI options before** the test path or filter. Options placed after the path are treated as **grep filters**, not flags.

- **One file, parallel tests inside the file:** `npx playwright test --workers=2 tests/e2e/catalog/product-browse-search.e2e.test.ts`
- **pnpm:** `pnpm test:e2e:one -- --workers=2 tests/e2e/catalog/product-browse-search.e2e.test.ts`

Default `PW_WORKERS` is **1** in `playwright.config.ts`. Increase only within a single file after confirming `beforeEach` isolation. Do not run multiple admin-mutating files in parallel against the same seeded Mongo database without isolation.

### Test user assignment

Each test file should use dedicated users from `tests/e2e/fixtures/test-users.ts` (see `docs/test-users.md`):

- `admin` — admin product/order/user CRUD, admin nav
- `customer` (John) — default login, checkout, profile, reviews
- `jane` — secondary customer for isolation (register/login conflicts, multi-user scenarios)

Avoid reusing the same user across parallel tests that mutate profile, orders, or reviews without reset.

### Playwright dev stack (same as manual `pnpm dev`)

E2E uses **`http://localhost:5020`** as `baseURL` (Vite). UI and `request` API calls go through that origin and the Vite proxy to the API on **5021** — the same path a human browser uses.

`playwright.config.ts` starts or reuses the **same command as `pnpm dev`**: `dev:inner` (API + Vite via `concurrently`). Health check waits for `http://localhost:5020/api/products` so both Vite and the API must be up.

| Command                             | When to use                                                            |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm test:e2e`                     | CI / clean run: spawns fresh `dev:inner` (`PW_DISABLE_REUSE_SERVER=1`) |
| `pnpm test:e2e:dev`                 | Local: reuse an already-running `pnpm dev` on :5020/:5021              |
| `pnpm dev` then `pnpm test:e2e:dev` | Matches day-to-day dev workflow                                        |

Set `PW_DISABLE_REUSE_SERVER=1` to force Playwright to spawn a new stack. Stale processes on 5020/5021 cause flaky auth and API failures.

**Troubleshooting:** If the homepage shows API error banners, ensure Mongo is running (`docker compose up -d mongo`), `.env` exists with `MONGO_URI` and `PORT=5021`, and `pnpm dev` logs the API as still running (not exited immediately).

**Optional env overrides:** `PW_RETRIES` (default `0`), `PW_WORKERS` (default `1`).

### Global setup and MongoDB seed

`tests/e2e/setup/global-setup.ts`:

1. Asserts MongoDB is reachable (`assertMongoHealthy`)
2. Runs `pnpm db:seed` (users, products from `backend/data/`)

Requires `MONGO_URI` in `.env.test`. JWT and PayPal client placeholders are set when missing.

### Real PayPal sandbox checkout (opt-in)

Run PayPal specs only when sandbox buyer credentials are configured:

```bash
# .env.test
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_SANDBOX_BUYER_EMAIL=your-sandbox-buyer@email.com
PAYPAL_SANDBOX_BUYER_PASSWORD=your-sandbox-buyer-password
```

```bash
pnpm test:e2e:one -- tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts
```

PayPal UI varies by region; headed mode may be required for sandbox login. Do not mock PayPal success in these specs.

API security tests in `tests/e2e/misc/api-security-auth.e2e.test.ts` remain isolated API tests — **do not** fold them into PayPal checkout specs.

### Skipped and opt-in tests

Prefer **failing loudly** when seed data or MongoDB is wrong. Only skip when the **feature or environment is unavailable** (missing PayPal sandbox credentials, no local MongoDB).

| File                                                                                                                    | Skip condition                                 | How to run                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts`                                                                 | Missing `PAYPAL_SANDBOX_BUYER_*`               | Configure `.env.test`, run file with `pnpm test:e2e:one`                                                                                                                    |
| `tests/e2e/journeys/journey-guest-purchase-paypal-lifecycle.e2e.test.ts` (`guest_completes_paypal_payment_when_opt_in`) | Missing sandbox creds or `PW_RUN_PAYPAL` unset | `PW_RUN_PAYPAL=1 pnpm test:e2e:one -- tests/e2e/journeys/journey-guest-purchase-paypal-lifecycle.e2e.test.ts` (canonical PayPal spec: `paypal-sandbox-payment.e2e.test.ts`) |

**Do not use runtime `test.skip` for missing seed rows** — global setup seeds via `pnpm db:seed`; fix `MONGO_URI` or run `pnpm db:seed` manually.

### Shop E2E file map

| File                                                           | Domain                              |
| -------------------------------------------------------------- | ----------------------------------- |
| `smoke/app-boot.e2e.test.ts`                                   | App boots, homepage loads           |
| `auth/login-register-profile.e2e.test.ts`                      | Login, register, profile update     |
| `catalog/product-browse-search.e2e.test.ts`                    | Home list, search, pagination       |
| `catalog/product-reviews.e2e.test.ts`                          | Review submit and display           |
| `checkout/cart-shipping-payment.e2e.test.ts`                   | Cart qty, shipping, payment method  |
| `checkout/paypal-sandbox-payment.e2e.test.ts`                  | Real PayPal sandbox (opt-in)        |
| `admin/admin-products.e2e.test.ts`                             | Admin product CRUD                  |
| `admin/admin-orders.e2e.test.ts`                               | Admin order list and delivery       |
| `admin/admin-users.e2e.test.ts`                                | Admin user list and edit            |
| `misc/api-security-auth.e2e.test.ts`                           | 401/403 API isolation               |
| `journeys/journey-guest-purchase-paypal-lifecycle.e2e.test.ts` | Guest checkout golden path          |
| `journeys/journey-admin-product-lifecycle.e2e.test.ts`         | Admin create → catalog visibility   |
| `journeys/journey-admin-order-fulfillment.e2e.test.ts`         | Admin order fulfillment golden path |

### Deterministic waits (mandatory)

Do **not** use `page.waitForTimeout()` in E2E specs. It hides race conditions and flakes under load.

| Instead of                      | Use                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Fixed delay after click/fill    | `expect(locator).toBeVisible()` / `toBeEnabled()` / `toHaveText()`                                                |
| Loader disappearance            | `await page.locator('[data-testid="page-loader"]').waitFor({ state: 'hidden' })` or expect target content visible |
| List refresh after admin action | `expect(page.locator('[data-testid="admin-product-list"]')).toBeVisible()` then row assertions                    |
| URL-driven navigation           | `expect(page).toHaveURL(/pattern/)` or `waitForURL`                                                               |

Helpers in `tests/e2e/fixtures/test-helpers.ts`: `loginAs`, `loginAsAdmin`, `addFirstProductToCart`, `completeShippingStep`, `completePaymentStep`. Add new domain helpers there instead of inline sleeps.

**Gate:** `rg 'waitForTimeout' tests/e2e` should return no matches (except comments documenting the ban).

### Helper functions over inline setup

Extract repeated setup into `test-helpers.ts`. Every DB reset should be idempotent and fast:

```typescript
// GOOD — reusable, named, idempotent
await loginAsAdmin(page);
await seedDatabase();

// BAD — inline credentials and selectors repeated across tests
await page.goto('/login');
await page.fill('input[type=email]', 'admin@gmail.com');
```
