# Mern's Shop — Developer Guide

## Quality gate (mandatory)

Before commits or PRs, run:

```bash
pnpm quality
```

This runs Prettier formatting, TypeScript (`tsc --noEmit`), and ESLint.

For CI-equivalent checks without auto-format:

```bash
pnpm format:check && pnpm quality:fast
```

## Development

Requires **Node 22** (see `.nvmrc`). Use `nvm install && nvm use` before `pnpm install`.

```bash
docker compose up -d mongo
pnpm install
cp .env.example .env
cp .env.test.example .env.test
pnpm db:seed
pnpm dev
```

After deploying catalog changes to production, run `pnpm db:sync:prod` (safe, non-destructive). Use `pnpm db:seed:prod` only for empty/demo databases with `ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_DATA_LOSS`.

- Frontend (Vite): http://localhost:5020
- API (Express): http://localhost:5021

## Testing

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e:one -- tests/e2e/smoke/app-boot.e2e.test.ts
```

See `docs/e2e-testing-rules.md`, `docs/unit-testing-rules.md`, and `docs/integration-testing-rules.md`.

## Deployment

Production uses **MongoDB Atlas M0 + Render free**. See [`docs/deployment-atlas-render.md`](docs/deployment-atlas-render.md).

Complete modernization and rename the GitHub repo to `merns-shop` before connecting Render.
