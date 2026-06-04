# Rules for Effective Unit Testing

Mern's Shop unit tests live under `tests/unit/` and target **isolated backend units** (Express middleware, controllers, utilities) with mocks for MongoDB/Mongoose and external I/O.

## Core Testing Philosophy

**Test behavior, not implementation.** Write tests that verify what your code does, not how it does it. Tests should remain valid even when internal implementation changes.

## Testing Rules

### 1. Test behavior, not implementation details

- Focus on the observable inputs and outputs of the system under test (SUT)
- Do not test private methods directly; test them through public interfaces (exported handlers, middleware functions)
- Tests should remain valid even if internal implementation changes

### 2. Write tests first (Test-Driven Development)

- For new features, write the failing test before implementation
- Follow Red-Green-Refactor cycle: failing test → minimal implementation → improve code
- Let failing tests guide your API design and implementation

### 3. Minimize mocking to essential dependencies

- Mock Mongoose models and external APIs; do not spin up a real MongoDB in unit tests
- Use real implementations of pure utilities inside the backend when they have no I/O
- If using a mock, it should represent realistic behavior of the real component

### 4. Don't mock what you don't own

- Mock `User.findById`, `Product.findById`, etc., at the model boundary — not Mongoose internals
- Wrap PayPal or file-upload SDKs in testable adapters when direct mocking becomes brittle
- This prevents tests from breaking when third-party APIs change

### 5. Create test doubles that accurately reflect real behavior

- Stubs/mocks should follow the same contract as real Mongoose query chains (`.select()`, `.lean()`, etc.) when those chains are part of the behavior
- Test both happy paths and edge cases/error conditions
- Verify interactions with dependencies only when the interaction itself is the behavior being tested

### 6. Use test fixtures intelligently

- Build minimal `Request` / `Response` / `NextFunction` objects for middleware tests
- Use fixed JWT payloads and user IDs — avoid random ObjectIds unless testing generation
- For filesystem operations (upload helpers), use temporary directories if added later

### 7. Test at the appropriate level

- **Unit tests**: Single function/handler/middleware in isolation (`tests/unit/backend/*.unit.test.ts`)
- **Integration tests**: Express app + real MongoDB via supertest (`tests/integration/api/*.integration.test.ts`)
- Clear distinction: mocking the entire database layer → unit test; real database → integration test

### 8. Make tests deterministic and independent

- Tests should not depend on each other
- Tests should be repeatable with the same results
- Avoid time-dependent tests; use fixed timestamps when necessary (`vi.useFakeTimers()` sparingly)

### 9. Write tests before fixing bugs

- Create a test that reproduces the bug
- Fix the bug
- Verify the test passes

### 10. Test for failure conditions

- Verify error handling works correctly (`asyncHandler`, custom errors, 401/404 responses)
- Test boundary conditions and edge cases (empty cart, invalid ObjectId, missing fields)
- Don't only test the "happy path"

### 11. Keep tests simple and readable

- Use descriptive test names that explain what's being tested and expected results
- Follow the AAA pattern: Arrange, Act, Assert
- One logical assertion per test (may include multiple related technical assertions)

### 12. Tests should be maintainable

- DRY principle applies to test code, but clarity is more important
- Tests should not be brittle (failing due to unrelated log message or import path changes)
- Unit tests should run quickly — run with `pnpm test:unit`

### 13. Measure test quality, not just coverage

- Review tests as carefully as production code
- Ensure failing a test provides clear indication of what's wrong
- Prefer testing outcomes (`res.status`, thrown errors, returned JSON shape) over call counts alone

### 14. Test state changes, not just function calls

- Verify the end state after operations (mock return values, `res.json` payloads), not just that `next()` was called
- For controllers, assert response status and body; for middleware, assert `next` vs error path

### 15. Make tests obvious and transparent

- A test should clearly show what it's being tested without hidden complexity
- Someone not familiar with the code should understand what a test verifies

### 16. Document test scenarios clearly

- Tests should serve as documentation for how components should behave
- Use test names and `describe` blocks to explain domain rules (admin-only, token required, etc.)

### 17. Classification: Database mocking indicates unit tests

- **If you mock the entire database layer → it's a unit test, not integration**
- Unit tests isolate the SUT by mocking Mongoose models and external dependencies
- Integration tests use real MongoDB via `connectTestDb()` in `tests/integration/helpers/db.ts`
- When in doubt: mocking database = unit test, real database = integration test
- Label test files correctly: `*.unit.test.ts` for unit tests

## Project Layout

```
tests/unit/backend/
├── authMiddleware.unit.test.ts    # protect, admin middleware
├── errorMiddleware.unit.test.ts   # notFound, errorHandler
├── generateToken.unit.test.ts     # JWT signing
├── orderController.unit.test.ts   # order handler logic (mocked models)
└── productController.unit.test.ts # product/review handler logic (mocked models)
```

## Conventions

- **Framework**: Vitest (`vitest.config.ts`, `environment: 'node'`)
- **Imports**: Import SUT from `backend/` using the same `.js` extension paths as production TypeScript emit
- **Mocks**: `vi.mock('../../../backend/models/User.js', () => ({ ... }))` at top of file before SUT import
- **Types**: Use Express types (`Request`, `Response`, `NextFunction`); never use `any`
- **No eslint-disable comments** in test files

## Commands

```bash
pnpm test:unit
pnpm test:unit -- tests/unit/backend/orderController.unit.test.ts
```

Run unit tests before integration/E2E when changing controller or middleware logic.

## What Belongs Here vs Integration

| Scenario                                                   | Unit | Integration                      |
| ---------------------------------------------------------- | ---- | -------------------------------- |
| `admin` middleware rejects non-admin                       | ✅   | ❌                               |
| Full login → profile with real MongoDB                     | ❌   | ✅ `auth.integration.test.ts`    |
| `generateToken` returns valid JWT shape                    | ✅   | ❌                               |
| POST `/api/orders` persists order                          | ❌   | ✅ `orders.integration.test.ts`  |
| `productController` branch when product not found (mocked) | ✅   | Optional duplicate — prefer unit |
