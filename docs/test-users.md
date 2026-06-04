# Test Users

Seeded users for local development, E2E (Playwright), and integration (Vitest + supertest) tests.

## Source of Truth

| Location                           | Purpose                                              |
| ---------------------------------- | ---------------------------------------------------- |
| `backend/data/users.js`            | Seed data imported by `pnpm db:seed`                 |
| `tests/e2e/fixtures/test-users.ts` | Playwright login helpers (`loginAs`, `loginAsAdmin`) |
| `docs/test-users.md`               | Human-readable reference (this file)                 |

Passwords in seed data are bcrypt-hashed. Plain-text passwords below are for **test login only**.

## New users (sign-up)

Tests and local browsing can create **new** accounts via the storefront **`/register`** screen or `POST /api/users` (name, email, password). Those accounts are not in the seed file. Use a **unique email** per run (for example `user-${Date.now()}@example.com`) so registration does not collide with seeded addresses below.

For duplicate-email behavior in tests, use `john@gmail.com` (`customer`) — already seeded.

## Seeded Users

All seeded accounts use password **`123456`**.

| Key        | Name       | Email             | Admin | Typical use                                                              |
| ---------- | ---------- | ----------------- | ----- | ------------------------------------------------------------------------ |
| `admin`    | Admin User | `admin@gmail.com` | Yes   | Admin product/order/user CRUD; `loginAsAdmin()`                          |
| `customer` | John Doe   | `john@gmail.com`  | No    | Default customer checkout, profile, reviews; `loginAs(page, 'customer')` |
| `jane`     | Jane Doe   | `jane@gmail.com`  | No    | Second customer for register conflicts or multi-user isolation           |

### Admin User

- **Email:** `admin@gmail.com`
- **Password:** `123456`
- **Flags:** `isAdmin: true`
- **Access:** Admin nav (`nav-admin-products`, `nav-admin-orders`, `nav-admin-users`), admin API routes
- **Notes:** Sample products in seed data are associated with this user's `_id`

### John Doe (default customer)

- **Email:** `john@gmail.com`
- **Password:** `123456`
- **Flags:** `isAdmin: false`
- **Access:** Cart, checkout, profile, my orders, product reviews
- **Default** for `loginAs(page)` and many integration tests

### Jane Doe (secondary customer)

- **Email:** `jane@gmail.com`
- **Password:** `123456`
- **Flags:** `isAdmin: false`
- **Access:** Same as John; use when tests must not collide with John's profile/orders

## PayPal Sandbox (not seeded users)

PayPal checkout E2E uses **separate** sandbox buyer credentials from `.env.test` — not shop user accounts:

```env
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_SANDBOX_BUYER_EMAIL=your-sandbox-buyer@email.com
PAYPAL_SANDBOX_BUYER_PASSWORD=your-sandbox-buyer-password
```

See `tests/e2e/checkout/paypal-sandbox-payment.e2e.test.ts` and `.env.test.example`.

## Resetting Test Data

E2E global setup and integration `beforeEach` re-seed the database:

```bash
pnpm db:seed      # import users + products (clears orders/products/users first)
pnpm db:destroy   # remove all users, products, orders
```

Requires `MONGO_URI` (default in `.env.test.example`: `mongodb://127.0.0.1:27017/merns-shop`).

## Usage in Tests

### Playwright

```typescript
import { loginAs, loginAsAdmin } from '../fixtures/test-helpers';

await loginAs(page); // john@gmail.com
await loginAs(page, 'jane');
await loginAsAdmin(page); // admin@gmail.com
```

### Integration (supertest)

```typescript
const login = await request(app).post('/api/users/login').send({
  email: 'john@gmail.com',
  password: '123456'
});
const token = login.body.token;
```

### API security E2E

`tests/e2e/misc/api-security-auth.e2e.test.ts` uses `john@gmail.com` / `123456` to prove non-admin tokens cannot access admin routes.

## Adding New Test Users

1. Add entry to `backend/data/users.js` with `bcrypt.hashSync('password', 10)`
2. Mirror plain credentials in `tests/e2e/fixtures/test-users.ts`
3. Update this document
4. Run `pnpm db:seed` before E2E/integration suites

Do not commit real production credentials. Test passwords are intentionally weak and valid **only** in local/test databases.
