# E2E Canonical Ownership

This document defines which files own golden-path lifecycle behavior and which files must stay edge-focused for Mern's Shop.

## Journey-Owned (golden paths)

| Lifecycle                                 | Owner file                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Guest purchase (cart → place order)       | `tests/e2e/journeys/journey-guest-purchase-lifecycle.e2e.test.ts`        |
| Customer register → profile → my orders   | `tests/e2e/journeys/journey-customer-auth-profile-lifecycle.e2e.test.ts` |
| Admin product create → catalog visibility | `tests/e2e/journeys/journey-admin-product-lifecycle.e2e.test.ts`         |
| Admin order fulfillment                   | `tests/e2e/journeys/journey-admin-order-fulfillment.e2e.test.ts`         |
| Admin promotes user → admin access        | `tests/e2e/journeys/journey-admin-user-privilege.e2e.test.ts`            |

Journey files assert the **single canonical happy path** across domains. They must not absorb API-only security checks or shallow smoke assertions.

## Focused Files (edge / negative / security / validation)

### Smoke

- `tests/e2e/smoke/app-boot.e2e.test.ts` — homepage boot, search overlay, unknown routes
- `tests/e2e/smoke/api-unreachable.e2e.test.ts` — API failure banners + retry on home, PDP, profile, admin, order

### Auth & profile

- `tests/e2e/auth/login-register-profile.e2e.test.ts` — validation, session, legacy routes, profile credentials, modal UX

### Catalog

- `tests/e2e/catalog/product-browse-search.e2e.test.ts` — pagination, keyword search, carousel, variants, PDP SEO meta
- `tests/e2e/catalog/product-reviews.e2e.test.ts` — review form validation, duplicate review, rating display
- `tests/e2e/catalog/product-filters-savings.e2e.test.ts` — brand/subcategory/min/max price, sort, savings badge
- `tests/e2e/catalog/product-image-integrity.e2e.test.ts` — catalog image audit script

### Checkout

- `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts` — cart qty, shipping validation, payment, place-order pricing, logged-in checkout
- `tests/e2e/checkout/cart-popover-desktop.e2e.test.ts` — desktop cart popover auth + empty state
- `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts` — **opt-in** real PayPal sandbox (`@paypal` project)

### Admin

- `tests/e2e/admin/admin-products.e2e.test.ts` — create/edit/delete via UI, validation, unauthorized access
- `tests/e2e/admin/admin-orders.e2e.test.ts` — mark delivered, unpaid order edges, order list details link
- `tests/e2e/admin/admin-users.e2e.test.ts` — edit user, isAdmin toggle, delete user, non-admin blocked
- `tests/e2e/admin/admin-product-static-image.e2e.test.ts` — bundled static image on storefront

### Auth guards & order access

- `tests/e2e/misc/checkout-auth-guard.e2e.test.ts` — checkout/profile deep-link auth gates
- `tests/e2e/misc/order-access.e2e.test.ts` — order access, profile details link, PayPal UI states
- `tests/e2e/misc/api-security-auth.e2e.test.ts` — 401 without token, admin UI gates (list + edit)

### Responsive layout

- `tests/e2e/misc/responsive-layout.e2e.test.ts` — mobile viewport catalog, nav/search, cart, checkout overflow

### About page

- `tests/e2e/misc/about-page.e2e.test.ts` — footer/header navigation to About, timeline cards, About SEO meta

### Public SEO

- `tests/e2e/misc/public-seo.e2e.test.ts` — robots.txt, sitemap.xml, login/search/admin robots, filter canonical

## Ownership Rules

1. **Golden-path lifecycle assertions** belong in `tests/e2e/journeys/` (one canonical outcome per lifecycle).
2. **Focused files** verify edge cases, permission checks, validation, retries, idempotency, and negative branches only.
3. When a focused file adds a happy-path assertion that duplicates a journey, **move** that assertion to the journey and keep only the edge branch in the focused file.
4. **Integration tests** own Express handler contracts (`tests/integration/api/*.integration.test.ts`); E2E focused specs own browser UX for the same edge, not duplicate supertest coverage.
5. **Unit tests** own pure controller/middleware logic with mocks (`tests/unit/backend/*.unit.test.ts`); do not re-test the same branch in E2E unless it is user-visible.

6. **PayPal paid-order E2E** runs in the serial `@paypal` Playwright project (`pnpm test:e2e:paypal`). The journey opt-in test and focused sandbox spec both assert `paypal-buttons-ready` and `order-paid-message` when sandbox creds are in `.env.test`.

## De-duplication Examples

| Behavior                                     | Canonical owner                                       | Do NOT duplicate in                                                            |
| -------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Guest reaches order screen after place order | `journey-guest-purchase-lifecycle.e2e.test.ts`        | `cart-shipping-payment.e2e.test.ts` (keep cart qty / shipping validation only) |
| Logged-in customer places order              | `cart-shipping-payment.e2e.test.ts`                   | Journey files (guest path only)                                                |
| Register → profile update → my orders        | `journey-customer-auth-profile-lifecycle.e2e.test.ts` | `login-register-profile.e2e.test.ts` (keep validation/errors only)             |
| Admin creates product visible on homepage    | `journey-admin-product-lifecycle.e2e.test.ts`         | `admin-products.e2e.test.ts` (keep edit/delete/validation)                     |
| Admin promotes user → admin nav              | `journey-admin-user-privilege.e2e.test.ts`            | `admin-users.e2e.test.ts` (keep delete/self-delete edges)                      |
| Admin opens order list                       | `journey-admin-order-fulfillment.e2e.test.ts`         | `admin-orders.e2e.test.ts` (keep mark-delivered details)                       |
| 401 on `/api/users/profile` without token    | `api-security-auth.e2e.test.ts`                       | Journey or auth UI files                                                       |
| Login with wrong password                    | `login-register-profile.e2e.test.ts`                  | Journey files                                                                  |

## Adding New Coverage

Before adding a test:

1. Check this document and `docs/e2e-journey-coverage-matrix.md`
2. If it is a multi-domain golden path → add/extend a `journey-*.e2e.test.ts` file
3. If it is an edge case → add to the focused domain file
4. If it is API-only → prefer `tests/integration/api/` or `tests/e2e/misc/api-security-auth.e2e.test.ts`
