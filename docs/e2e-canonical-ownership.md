# E2E Canonical Ownership

This document defines which files own golden-path lifecycle behavior and which files must stay edge-focused for Mern's Shop.

## Journey-Owned (golden paths)

| Lifecycle                                 | Owner file                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Guest purchase (cart → place order)       | `tests/e2e/journeys/journey-guest-purchase-paypal-lifecycle.e2e.test.ts` |
| Customer register → profile → my orders   | `tests/e2e/journeys/journey-customer-auth-profile-lifecycle.e2e.test.ts` |
| Admin product create → catalog visibility | `tests/e2e/journeys/journey-admin-product-lifecycle.e2e.test.ts`         |
| Admin order fulfillment                   | `tests/e2e/journeys/journey-admin-order-fulfillment.e2e.test.ts`         |

Journey files assert the **single canonical happy path** across domains. They must not absorb API-only security checks or shallow smoke assertions.

## Focused Files (edge / negative / security / validation)

### Smoke

- `tests/e2e/smoke/app-boot.e2e.test.ts` — homepage boot, critical layout visible

### Auth & profile

- `tests/e2e/auth/login-register-profile.e2e.test.ts` — wrong password, register validation, seeded profile smoke

### Catalog

- `tests/e2e/catalog/product-browse-search.e2e.test.ts` — pagination, keyword search, empty results
- `tests/e2e/catalog/product-reviews.e2e.test.ts` — review form validation, duplicate review, rating display

### Checkout

- `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts` — cart quantity changes, remove item, shipping validation, payment method selection
- `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts` — **opt-in** real PayPal sandbox; not a duplicate of guest journey unless journey adds paid confirmation

### Admin

- `tests/e2e/admin/admin-products.e2e.test.ts` — edit/delete edge cases, validation, unauthorized access
- `tests/e2e/admin/admin-orders.e2e.test.ts` — mark delivered, order details, empty list edge cases
- `tests/e2e/admin/admin-users.e2e.test.ts` — edit user admin flag, delete user, non-admin blocked

### API security (E2E API isolation)

- `tests/e2e/misc/api-security-auth.e2e.test.ts` — 401 without token, non-admin blocked from admin routes

### Responsive layout

- `tests/e2e/misc/responsive-layout.e2e.test.ts` — mobile viewport catalog, nav/search, cart qty/checkout, product add-to-cart, checkout steps overflow
- `tests/e2e/catalog/product-browse-search.e2e.test.ts` — `mobile_search_results_pagination` only (not full mobile catalog)
- `tests/e2e/admin/admin-products.e2e.test.ts` — `admin_product_list_scrollable_table` mobile admin edit table

### Public SEO

- `tests/e2e/misc/public-seo.e2e.test.ts` — robots.txt, sitemap.xml, login/search/admin robots, filter canonical
- `tests/e2e/smoke/app-boot.e2e.test.ts` — home default title/description shell (not product JSON-LD)
- `tests/e2e/catalog/product-browse-search.e2e.test.ts` — product page title, description, JSON-LD, image alt

## Ownership Rules

1. **Golden-path lifecycle assertions** belong in `tests/e2e/journeys/` (one canonical outcome per lifecycle).
2. **Focused files** verify edge cases, permission checks, validation, retries, idempotency, and negative branches only.
3. When a focused file adds a happy-path assertion that duplicates a journey, **move** that assertion to the journey and keep only the edge branch in the focused file.
4. **Integration tests** own Express handler contracts (`tests/integration/api/*.integration.test.ts`); E2E focused specs own browser UX for the same edge, not duplicate supertest coverage.
5. **Unit tests** own pure controller/middleware logic with mocks (`tests/unit/backend/*.unit.test.ts`); do not re-test the same branch in E2E unless it is user-visible.

## De-duplication Examples

| Behavior                                     | Canonical owner                                       | Do NOT duplicate in                                                            |
| -------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Guest reaches order screen after place order | `journey-guest-purchase-paypal-lifecycle.e2e.test.ts` | `cart-shipping-payment.e2e.test.ts` (keep cart qty / shipping validation only) |
| Register → profile update → my orders        | `journey-customer-auth-profile-lifecycle.e2e.test.ts` | `login-register-profile.e2e.test.ts` (keep validation/errors only)             |
| Admin creates product visible on homepage    | `journey-admin-product-lifecycle.e2e.test.ts`         | `admin-products.e2e.test.ts` (keep edit/delete/validation)                     |
| Admin opens order list                       | `journey-admin-order-fulfillment.e2e.test.ts`         | `admin-orders.e2e.test.ts` (keep mark-delivered details)                       |
| 401 on `/api/users/profile` without token    | `api-security-auth.e2e.test.ts`                       | Journey or auth UI files                                                       |
| Login with wrong password                    | `login-register-profile.e2e.test.ts`                  | Journey files                                                                  |

## Adding New Coverage

Before adding a test:

1. Check this document and `docs/e2e-journey-coverage-matrix.md`
2. If it is a multi-domain golden path → add/extend a `journey-*.e2e.test.ts` file
3. If it is an edge case → add to the focused domain file
4. If it is API-only → prefer `tests/integration/api/` or `tests/e2e/misc/api-security-auth.e2e.test.ts`
