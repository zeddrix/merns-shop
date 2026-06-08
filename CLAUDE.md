# Mern's Shop — Developer Guide

## Quality gate (mandatory)

Use the **smallest gate that matches what you are about to do**. Render runs `pnpm install && pnpm build` — a passing `pnpm quality` alone does **not** guarantee that production build succeeds.

### Everyday (during development)

```bash
pnpm quality
```

Prettier, TypeScript (`tsc --noEmit`), and ESLint. Backend type-check uses **`backend/tsconfig.build.json`** (same project file as `pnpm build:backend` / Render).

CI-equivalent without auto-format:

```bash
pnpm format:check && pnpm quality:fast
```

### Before commit or push (catches Render build failures locally)

```bash
pnpm predeploy
```

Runs `format:check`, `quality:fast`, and **`pnpm build`** (frontend Vite production build + backend `tsc` emit — same as Render and the CI `build` job). **Run this before pushing backend, frontend build, or dependency changes.** No E2E; typically ~1–3 minutes.

### Before merge / release candidate

```bash
pnpm verify
```

Adds unit + integration tests and production build (no E2E).

### Full pre-deploy (with E2E)

```bash
pnpm verify:full
```

Same as `scripts/pre-deploy-verify.sh` — includes the full Playwright suite.

### What each gate catches

| Gate | Catches |
|------|---------|
| `pnpm quality` | Formatting, lint, type errors (incl. backend build tsconfig) |
| `pnpm predeploy` | **Production Vite build**, backend emit, missing undeclared imports, bundle issues |
| `pnpm verify` | Above + unit/integration regressions |
| `pnpm verify:full` | Above + E2E |

**Lesson:** Type-only checks can pass while **`pnpm build`** fails (e.g. importing a package that is not a direct dependency, or a prod-only `tsconfig.build.json` path). Always run **`pnpm predeploy`** before pushing deploy-related work.

### Backend import rule

In `backend/`, only import npm packages listed in the **root** `package.json` `dependencies` / `devDependencies`. Do not import transitive deps (e.g. `serve-static` via Express) — pnpm on CI/Render will not resolve them reliably. Prefer types derived from Express (`Parameters<typeof express.static>[1]>`) or add an explicit dependency.

## Development

Requires **Node 22** (see `.nvmrc`). Use `nvm install && nvm use` before `pnpm install`. Scripted commands (`pnpm dev`, `pnpm test:unit`, etc.) auto-switch to Node 22 via `scripts/run-with-project-node.sh` when nvm is installed — `engine-strict` is off so pnpm can reach that wrapper.

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
- E2E (Playwright): http://localhost:5030 (UI) + http://localhost:5031 (API)

## Testing

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e:one -- tests/e2e/smoke/app-boot.e2e.test.ts
```

See `docs/e2e-testing-rules.md`, `docs/unit-testing-rules.md`, and `docs/integration-testing-rules.md`.

### PWA E2E (production build on port 5040)

```bash
pnpm test:e2e:pwa
# faster iteration after a build:
pnpm build:pwa:e2e && pnpm serve:pwa:e2e
PWA_SERVER_RUNNING=1 pnpm test:e2e:pwa:prebuilt
```

Regular `pnpm test:e2e` uses the dev stack (:5030/:5031) and excludes `tests/e2e/pwa/*`.

## Deployment

Production uses **MongoDB Atlas M0 + Render free**. See [`docs/deployment-atlas-render.md`](docs/deployment-atlas-render.md).

**Before pushing to `main` (triggers Render):** `pnpm predeploy` must pass locally, and the GitHub **`build`** CI job must be green (not only `quality`).

Complete modernization and rename the GitHub repo to `merns-shop` before connecting Render.
