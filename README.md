# Mern's Shop

MERN e-commerce demo — TypeScript, Express 5, Mongoose 9, Vite, React 19, Redux Toolkit, PayPal sandbox.

## Requirements

- **Node.js 22+**
- **pnpm 9+**
- **Docker** (local MongoDB 7+)

## Quick start

```bash
docker compose up -d mongo
pnpm install
cp .env.example .env
cp .env.test.example .env.test
pnpm db:seed
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

Seeded users: see [`docs/test-users.md`](docs/test-users.md).

## Quality & tests

```bash
pnpm quality          # format + tsc + eslint
pnpm quality:fast     # tsc + eslint (CI parity)
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

PayPal sandbox E2E (opt-in): `PW_RUN_PAYPAL=1 pnpm test:e2e:paypal`

Optional CI PayPal job: set repository variable `ENABLE_PAYPAL_E2E=true` and add secrets
`PAYPAL_CLIENT_ID`, `PAYPAL_SANDBOX_BUYER_EMAIL`, `PAYPAL_SANDBOX_BUYER_PASSWORD`.

Pre-deploy gate (ISSUE-015): `pnpm verify:full`

## Deployment

Production uses **MongoDB Atlas M0** and **Render free tier**. Complete modernization and rename the GitHub repo to `merns-shop` before connecting Render — see [`docs/deployment-atlas-render.md`](docs/deployment-atlas-render.md).

## Database

Local and test environments use a single database:

```text
mongodb://127.0.0.1:27017/merns-shop
```

Minimum MongoDB version: **6.0** (Docker image uses Mongo **7**).
