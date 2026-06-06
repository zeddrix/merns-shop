# E2E Journey Coverage Matrix

Plan ID: `merns-shop-journey-coverage`

This matrix tracks **golden-path lifecycles** for Mern's Shop. Each row maps a business lifecycle to its canonical journey spec and focused edge specs.

## Requested Lifecycle Coverage

| Scope ID | Lifecycle Domain                               | Canonical Journey File                                                                            | Focused Edge Files                                                                                                                                 | Current Status    |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| MS-01    | Guest catalog browse & search                  | `tests/e2e/journeys/journey-guest-purchase-lifecycle.e2e.test.ts` (partial — extends to checkout) | `tests/e2e/catalog/product-browse-search.e2e.test.ts`, `tests/e2e/catalog/product-filters-savings.e2e.test.ts`                                     | covered           |
| MS-02    | Guest cart → shipping → payment → place order  | `tests/e2e/journeys/journey-guest-purchase-lifecycle.e2e.test.ts`                                 | `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts`, `tests/e2e/checkout/cart-popover-desktop.e2e.test.ts`                                      | covered           |
| MS-03    | PayPal sandbox paid order (opt-in)             | `tests/e2e/journeys/journey-guest-purchase-lifecycle.e2e.test.ts`                                 | `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts`, `tests/e2e/misc/order-access.e2e.test.ts` (unpaid/paid UI)                                | covered (opt-in)  |
| MS-04    | Customer auth, register, profile               | `tests/e2e/journeys/journey-customer-auth-profile-lifecycle.e2e.test.ts`                          | `tests/e2e/auth/login-register-profile.e2e.test.ts`                                                                                                | covered           |
| MS-05    | Product reviews lifecycle                      | —                                                                                                 | `tests/e2e/catalog/product-reviews.e2e.test.ts`                                                                                                    | covered (focused) |
| MS-06    | Admin product CRUD → storefront visibility     | `tests/e2e/journeys/journey-admin-product-lifecycle.e2e.test.ts`                                  | `tests/e2e/admin/admin-products.e2e.test.ts`                                                                                                       | covered           |
| MS-07    | Admin order list & fulfillment                 | `tests/e2e/journeys/journey-admin-order-fulfillment.e2e.test.ts`                                  | `tests/e2e/admin/admin-orders.e2e.test.ts`                                                                                                         | covered           |
| MS-08    | Admin user management & privilege escalation   | `tests/e2e/journeys/journey-admin-user-privilege.e2e.test.ts`                                     | `tests/e2e/admin/admin-users.e2e.test.ts`                                                                                                          | covered           |
| MS-09    | API auth & admin authorization                 | —                                                                                                 | `tests/e2e/misc/api-security-auth.e2e.test.ts`, `tests/integration/api/admin-auth.integration.test.ts`                                             | covered           |
| MS-10    | App boot / smoke / API unreachable             | —                                                                                                 | `tests/e2e/smoke/app-boot.e2e.test.ts`, `tests/e2e/smoke/api-unreachable.e2e.test.ts`                                                              | covered (focused) |
| MS-11    | Static bundled product images                  | —                                                                                                 | `tests/e2e/admin/admin-product-static-image.e2e.test.ts`, `tests/e2e/catalog/product-image-integrity.e2e.test.ts`                                  | covered (focused) |
| MS-12    | Order access control (UI)                      | —                                                                                                 | `tests/e2e/misc/order-access.e2e.test.ts`                                                                                                          | covered (focused) |
| MS-13    | Cookie session auth / logout                   | —                                                                                                 | `tests/e2e/auth/login-register-profile.e2e.test.ts`                                                                                                | covered (focused) |
| MS-14    | Checkout / profile / order / admin auth guards | —                                                                                                 | `tests/e2e/misc/checkout-auth-guard.e2e.test.ts`, `tests/e2e/misc/api-security-auth.e2e.test.ts`, `tests/e2e/misc/order-access.e2e.test.ts`        | covered (focused) |
| MS-15    | Public SEO & About                             | —                                                                                                 | `tests/e2e/misc/public-seo.e2e.test.ts`, `tests/e2e/misc/about-page.e2e.test.ts`, `tests/e2e/catalog/product-browse-search.e2e.test.ts` (PDP meta) | covered (focused) |
| MS-16    | Responsive mobile layout                       | —                                                                                                 | `tests/e2e/misc/responsive-layout.e2e.test.ts`                                                                                                     | covered (focused) |

## All E2E spec files (24)

| File                                                                     | Domain                                                  |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `tests/e2e/smoke/app-boot.e2e.test.ts`                                   | Boot, search overlay, unknown routes                    |
| `tests/e2e/smoke/api-unreachable.e2e.test.ts`                            | API failure + retry on home, PDP, profile, admin, order |
| `tests/e2e/auth/login-register-profile.e2e.test.ts`                      | Auth modal, session, profile credentials                |
| `tests/e2e/catalog/product-browse-search.e2e.test.ts`                    | Browse, search, PDP, carousel, variants                 |
| `tests/e2e/catalog/product-filters-savings.e2e.test.ts`                  | Filters, sort, savings badge                            |
| `tests/e2e/catalog/product-reviews.e2e.test.ts`                          | Reviews + auth on PDP                                   |
| `tests/e2e/catalog/product-image-integrity.e2e.test.ts`                  | Image asset audit                                       |
| `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts`                   | Cart, shipping, payment, place order pricing            |
| `tests/e2e/checkout/cart-popover-desktop.e2e.test.ts`                    | Desktop cart popover                                    |
| `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts`                  | Real PayPal sandbox (`@paypal`)                         |
| `tests/e2e/admin/admin-products.e2e.test.ts`                             | Admin product CRUD + UI delete                          |
| `tests/e2e/admin/admin-orders.e2e.test.ts`                               | Admin order list + deliver edges                        |
| `tests/e2e/admin/admin-users.e2e.test.ts`                                | Admin user edit/delete/isAdmin                          |
| `tests/e2e/admin/admin-product-static-image.e2e.test.ts`                 | Bundled image path                                      |
| `tests/e2e/misc/api-security-auth.e2e.test.ts`                           | API 401 + admin UI gates                                |
| `tests/e2e/misc/checkout-auth-guard.e2e.test.ts`                         | Checkout/profile deep-link guards                       |
| `tests/e2e/misc/order-access.e2e.test.ts`                                | Order access, PayPal UI states                          |
| `tests/e2e/misc/public-seo.e2e.test.ts`                                  | robots.txt, sitemap, canonical                          |
| `tests/e2e/misc/about-page.e2e.test.ts`                                  | About page                                              |
| `tests/e2e/misc/responsive-layout.e2e.test.ts`                           | Mobile responsive journeys                              |
| `tests/e2e/journeys/journey-guest-purchase-lifecycle.e2e.test.ts`        | Guest checkout golden path                              |
| `tests/e2e/journeys/journey-customer-auth-profile-lifecycle.e2e.test.ts` | Register → profile → orders                             |
| `tests/e2e/journeys/journey-admin-product-lifecycle.e2e.test.ts`         | Admin product → catalog                                 |
| `tests/e2e/journeys/journey-admin-order-fulfillment.e2e.test.ts`         | Admin deliver → customer profile                        |
| `tests/e2e/journeys/journey-admin-user-privilege.e2e.test.ts`            | Admin promotes user → admin access                      |

## Journey File Expectations

Each `journey-*.e2e.test.ts` file must:

1. Span **≥2 feature domains** (e.g., catalog + checkout, or admin + storefront)
2. Include **≥2 user actions per test** and verify a **meaningful outcome** (see `docs/e2e-testing-rules.md`)
3. Use stable `data-testid` selectors
4. Avoid duplicating assertions already owned by focused specs except for the single golden path

## Verification Runs

Run in this order when validating journey coverage:

```bash
pnpm quality
pnpm test:unit
pnpm test:integration
pnpm test:e2e:one -- tests/e2e/smoke/app-boot.e2e.test.ts
pnpm test:e2e:journeys
pnpm test:e2e
```

PayPal sandbox (auto-runs in `@paypal` project when `.env.test` has `PAYPAL_CLIENT_ID` + sandbox buyer creds):

```bash
pnpm test:e2e:paypal
PW_RUN_PAYPAL=1 pnpm test:e2e   # includes journey PayPal opt-in test
```

## Open Follow-up Gaps

None for planned full-stack coverage (updated 2026-06). Re-open this section when new routes or features ship.
