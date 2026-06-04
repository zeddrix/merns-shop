# Integration Testing Rules

**Testing Framework:** Vitest with Node environment  
**HTTP client:** supertest against Express `app`  
**Database:** Real MongoDB via Mongoose (`MONGO_URI` from `.env.test`)  
**Philosophy:** Test how Express routes, controllers, models, and middleware work together in realistic API scenarios

## Core Principle

> **Integration tests verify that multiple backend units work together correctly.** They test the interaction between routes, middleware, Mongoose models, and the real database — not the React frontend (that is E2E).

## The Rules

### 1. Test realistic API workflows

- Focus on complete request lifecycles: auth header → route → controller → MongoDB → JSON response
- Test how protected routes interact with JWT middleware and `User` documents
- Verify that data flows correctly between HTTP layer and persistence
- Test error handling across middleware boundaries (401, 404, 400)

### 2. Use real implementations of internal dependencies

- Import the real Express app from `backend/app.ts` (compiled path: `backend/app.js`)
- Use real Mongoose models against a dedicated test database (`mongodb://127.0.0.1:27017/merns-shop` or CI equivalent)
- Only mock **external** systems you don't control (PayPal REST API, cloud storage) when those integrations are added
- Do not mock internal controllers or middleware in integration tests

### 3. Reset database state between tests

- Use `resetTestDb()` from `tests/integration/helpers/db.ts` in `beforeEach` — it runs `pnpm db:seed`
- Ensures seeded users (`admin@gmail.com`, `john@gmail.com`, `jane@gmail.com`) and products exist for every test
- `connectTestDb()` in `beforeAll`, `disconnectTestDb()` in `afterAll`

### 4. Test auth and authorization integration

- Register/login flows with real password hashing (bcrypt)
- Bearer token on protected routes (`/api/users/profile`, `/api/orders/myorders`)
- Admin-only routes (`/api/users`, `/api/products` POST, `/api/orders` GET) reject non-admin tokens
- Invalid or expired tokens return 401

### 5. Test order and product persistence

- Creating orders updates MongoDB `Order` collection with correct line items and shipping address
- Product CRUD reflects in subsequent GET requests
- Reviews update embedded `reviews` array and `numReviews` / `rating` on `Product`

### 6. Test upload and static SPA fallback (where applicable)

- `tests/integration/api/upload-auth.integration.test.ts` — legacy upload route returns 404
- `tests/integration/api/spa-fallback.integration.test.ts` — non-API routes serve frontend index in production mode

### 7. Test data validation across layers

- Malformed bodies return appropriate 4xx responses
- Missing required fields do not partially persist documents
- Invalid MongoDB ObjectIds return 404, not 500

### 8. Test error middleware behavior

- Unknown API routes hit `notFound` middleware
- Thrown errors in controllers propagate to `errorHandler` with consistent JSON shape

### 9. Classification: Database mocking indicates unit tests

- **If you mock the entire database layer → it's a unit test, not integration**
- Integration tests use real MongoDB via `connectTestDb()`
- Only mock external systems you don't control (PayPal API, S3, email providers)
- When in doubt: mocking Mongoose = unit test, real MongoDB = integration test
- Label test files correctly: `*.integration.test.ts` only for true integration tests

## When to Write Integration Tests

### ✅ Write Integration Tests For:

- **Auth workflows** (register → login → profile → update)
- **Product API** (list, detail, admin create/update/delete, search, pagination)
- **Order API** (create order, my orders, admin list, mark delivered)
- **Review API** (create review, authorization, duplicate prevention)
- **Admin user API** (list users, update, delete — with auth checks)
- **Upload routes** (auth + file handling)
- **SPA fallback** (production static serving)
- **Error scenarios** (401, 403, 404, validation failures)

### ❌ Don't Write Integration Tests For:

- **Pure utility functions** (use unit tests — e.g., `generateToken.unit.test.ts`)
- **Single middleware branch with mocked models** (use unit tests — e.g., `authMiddleware.unit.test.ts`)
- **React component behavior** (use E2E — e.g., cart UI, PayPal buttons)
- **Full PayPal checkout UI** (use opt-in E2E with sandbox credentials)

## Test Organization

### File Structure

```
tests/integration/
├── helpers/
│   └── db.ts                          # connect, disconnect, reset (seed)
└── api/
    ├── auth.integration.test.ts
    ├── users.integration.test.ts
    ├── products.integration.test.ts
    ├── products-review.integration.test.ts
    ├── orders.integration.test.ts
    ├── upload-auth.integration.test.ts
    └── spa-fallback.integration.test.ts
```

### Test Naming Convention

- **Integration tests**: `*.integration.test.ts`
- **Domain**: `{domain}.integration.test.ts` or `{domain}-{feature}.integration.test.ts`

## Setup and Teardown

### Test Environment Setup

```typescript
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/app.js';
import { connectTestDb, disconnectTestDb, resetTestDb } from '../helpers/db.js';

describe('orders integration', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('creates an order for authenticated user', async () => {
    const login = await request(app).post('/api/users/login').send({
      email: 'john@gmail.com',
      password: '123456'
    });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        /* orderItems, shippingAddress, paymentMethod, ... */
      });

    expect(res.status).toBe(201);
  });
});
```

### Environment

- Load `.env.test` first, then `.env` (see `tests/integration/helpers/db.ts` and `vitest.config.ts`)
- Required: `MONGO_URI`, `JWT_SECRET`
- Optional: `PAYPAL_CLIENT_ID` when testing PayPal-related server config

## Common Pitfalls to Avoid

❌ **Don't:**

- Mock Mongoose models in integration tests
- Test React/Redux behavior here
- Share mutated state across tests without `resetTestDb()`
- Hit production MongoDB Atlas from local integration runs without explicit intent
- Use `any` type or eslint-disable comments

✅ **Do:**

- Test complete API workflows end-to-end through HTTP
- Use seeded users from `backend/data/users.js` (see `docs/test-users.md`)
- Assert status codes and response body shapes
- Test admin vs non-admin authorization on the same route
- Keep tests independent with `beforeEach` seed reset

## Relationship to E2E and Unit Tests

| Layer       | Tool                         | Scope                                             |
| ----------- | ---------------------------- | ------------------------------------------------- |
| Unit        | Vitest + mocks               | Controller/middleware branches                    |
| Integration | Vitest + supertest + MongoDB | API contracts and persistence                     |
| E2E         | Playwright                   | React Bootstrap UI, checkout steps, admin screens |

Integration tests complement unit and E2E tests — they do not replace them. Prefer integration over E2E for 401/403/404 API matrix tests; prefer E2E when verifying user-visible checkout or admin UI.

## Commands

```bash
pnpm test:integration
pnpm test:integration -- tests/integration/api/orders.integration.test.ts
```

Ensure MongoDB is running locally (`docker compose up -d` or local `mongod`) before integration or E2E suites.

## Summary

Integration tests prove the Express + MongoDB backend behaves correctly as a whole. Use the real app and database, reset with `pnpm db:seed` between tests, and reserve mocks for external payment or storage services only.
