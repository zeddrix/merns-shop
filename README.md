# Mern's Shop

MERN e-commerce demo — TypeScript, Express 5, Mongoose 9, Vite, React 19, Redux Toolkit, PayPal sandbox.

## Requirements

- **Node.js 22+** (use `nvm use` — see [`.nvmrc`](.nvmrc))
- **pnpm 9+**
- **Docker** (local MongoDB only)

## Quick start (local development)

### 1. Prerequisites

```bash
nvm use          # or: fnm use — must be Node 22+
docker compose up -d mongo
```

Confirm Mongo is listening:

```bash
docker compose ps
# or: mongosh "mongodb://127.0.0.1:27017/merns-shop" --eval "db.runCommand({ ping: 1 })"
```

### 2. Install and configure

```bash
pnpm install     # fails fast if Node < 22
cp .env.example .env
cp .env.test.example .env.test
node scripts/ensure-product-images.mjs
pnpm db:seed
```

### 3. Run the app

**Recommended — API + Vite together:**

```bash
pnpm dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| API      | http://localhost:5000 |

**Alternative — separate terminals:**

```bash
pnpm server    # API on :5000 (tsx + nodemon)
pnpm client    # Vite on :5173
```

Seeded users: see [`docs/test-users.md`](docs/test-users.md).

Auth uses an **httpOnly cookie** (no JWT in `localStorage`). Product images are static files under [`frontend/public/images/`](frontend/public/images/) — paths like `/images/phone.jpg` in the database.

## Quality and tests

```bash
pnpm quality          # format + tsc + eslint
pnpm quality:fast     # tsc + eslint (CI parity)
pnpm test:unit
pnpm test:integration
pnpm test:e2e         # Playwright starts API + Vite; needs Mongo on :27017
```

**E2E preflight:** Mongo must be running before `pnpm test:e2e`. Playwright seeds the DB in global setup.

Run a single E2E file:

```bash
pnpm test:e2e:one -- tests/e2e/smoke/app-boot.e2e.test.ts
```

### PayPal sandbox E2E

Add to `.env.test`:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_SANDBOX_BUYER_EMAIL`
- `PAYPAL_SANDBOX_BUYER_PASSWORD`

PayPal specs run automatically when `.env.test` has real (non-placeholder) sandbox credentials. Otherwise they are skipped with an explicit message.

```bash
pnpm test:e2e:paypal
```

`pnpm verify:full` runs PayPal E2E when those variables are set in `.env.test`.

**CI PayPal job:** set repository variable `ENABLE_PAYPAL_E2E=true` and secrets `PAYPAL_CLIENT_ID`, `PAYPAL_SANDBOX_BUYER_EMAIL`, `PAYPAL_SANDBOX_BUYER_PASSWORD`.

### Verification gates

| Command            | What it runs                                        |
| ------------------ | --------------------------------------------------- |
| `pnpm verify`      | format, quality, unit, integration, build           |
| `pnpm verify:full` | above + full E2E (+ PayPal if creds in `.env.test`) |

## Deployment

Production uses **MongoDB Atlas M0** and **Render**. Complete local verification first, then follow [`docs/deployment-atlas-render.md`](docs/deployment-atlas-render.md) (ISSUE-015 repo rename + Atlas + Render are manual steps).

## Database

Local and test environments use:

```text
mongodb://127.0.0.1:27017/merns-shop
```

Minimum MongoDB version: **6.0** (Docker image uses Mongo **7**).
