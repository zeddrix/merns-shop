# Mern's Shop

MERN e-commerce demo — TypeScript, Express 5, Mongoose 9, Vite, React 19, Redux Toolkit, PayPal sandbox.

## Requirements

- **Node.js 22+** (use `nvm use` — see [`.nvmrc`](.nvmrc))
- **pnpm 9+**
- **Docker** (local MongoDB only)
- **Git LFS** (catalog product photos — required for clone/commit)

## Quick start (local development)

### 1. Prerequisites

This repo needs **Node 22 only here** — your other projects can keep Node 20 as the global default.

```bash
cd /path/to/beamazedd-shop
nvm install      # one-time: installs Node 22 from .nvmrc
nvm use          # this terminal only (does not change nvm default)
node -v          # should print v22.x
docker compose up -d mongo
```

Do **not** run `nvm alias default 22` unless you want every new terminal on Node 22. With `nvm use`, only shells where you ran it in this folder use 22.

**Optional (auto-switch when you `cd` here):** add to `~/.zshrc`:

```bash
autoload -U add-zsh-hook
load-nvmrc() {
  local nvmrc_path="$(nvm_find_nvmrc 2>/dev/null)"
  if [ -n "$nvmrc_path" ]; then
    nvm use --silent
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

Then opening this project directory runs `nvm use` automatically; other folders still use your default (e.g. Node 20).

**Git LFS (catalog images):**

```bash
brew install git-lfs    # macOS; or apt install git-lfs on Linux
git lfs install
git lfs pull            # after clone or pull when catalog images change
```

Catalog photos under `frontend/public/images/catalog/` are stored with Git LFS. Commits that touch those files fail if `git-lfs` is not installed.

Confirm Mongo is listening:

```bash
docker compose ps
# or: mongosh "mongodb://127.0.0.1:27017/merns-shop" --eval "db.runCommand({ ping: 1 })"
```

### 2. Install and configure

```bash
nvm use          # required before install if your default is Node 20
pnpm install     # fails fast if Node < 22; validates catalog WebP assets (or fetches if manifest URLs set)
cp .env.example .env
cp .env.test.example .env.test
# Set VITE_SITE_URL and SITE_URL for SEO (see docs/seo.md)
pnpm catalog:validate   # all catalog WebP paths exist and meet size thresholds
pnpm db:seed
```

### 3. Run the app

**Recommended — API + Vite together:**

```bash
pnpm dev    # auto-selects Node 22 here via nvm; leaves your global Node 20 unchanged
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5020 |
| API      | http://localhost:5021 |

**Alternative — separate terminals:**

```bash
pnpm server    # API on :5021 (tsx watch)
pnpm client    # Vite on :5020
```

Seeded users: see [`docs/test-users.md`](docs/test-users.md).

Auth uses an **httpOnly cookie** (no JWT in `localStorage`).

### Customer sign-up

New shoppers can create an account at **http://localhost:5020/register** (also linked from **Sign Up** in the header and from the login screen).

| Field            | Requirement                         |
| ---------------- | ----------------------------------- |
| Name             | Required                            |
| Email            | Valid email; must not already exist |
| Password         | At least 6 characters               |
| Confirm password | Must match password (client-side)   |

After a successful sign-up, the API sets the same session cookie as login and the app redirects to `/` or to the `redirect` query target (for example `/shipping` when checking out as a guest). New accounts redirected to `/` see a brief **Welcome, {name}** message on the home page (`register-welcome`).

E2E coverage: `tests/e2e/auth/login-register-profile.e2e.test.ts`, `tests/e2e/checkout/cart-shipping-payment.e2e.test.ts`, and `tests/e2e/journeys/journey-customer-auth-profile-lifecycle.e2e.test.ts`.

### Gadget catalog (offline-first)

- **~170 parent products** with **500+ variants** (Apple, Samsung, Vivo, Xiaomi, Sony) live in [`backend/data/catalog/`](backend/data/catalog/).
- Each product has nested **variants** (storage, screen size, etc.) with **MSRP `listPrice`** and tiered **second-hand `price`** (see [`backend/data/catalog/pricing.ts`](backend/data/catalog/pricing.ts)).
- Images are **WebP** files under [`frontend/public/images/catalog/`](frontend/public/images/catalog/) (Git LFS). Sources and licenses are listed in [`catalog-image-manifest.json`](catalog-image-manifest.json). See [`frontend/public/images/catalog/ATTRIBUTION.md`](frontend/public/images/catalog/ATTRIBUTION.md).
- Refresh images: `pnpm catalog:sources` (Wikimedia Commons URLs) then `pnpm catalog:images` (download + convert).
- Validate catalog data: `pnpm catalog:validate`
- Storefront: brand/category filters, savings badges, variant picker on product pages.

## SEO

Canonical URLs, Open Graph, `robots.txt`, dynamic `sitemap.xml`, JSON-LD, and crawler HTML are configured via `VITE_SITE_URL` and `SITE_URL`. See [`docs/seo.md`](docs/seo.md).

## Responsive UI and motion

The storefront uses **Bootstrap 5** breakpoints plus shared CSS tokens in [`frontend/src/index.css`](frontend/src/index.css) for spacing, touch targets, and carousel scaling on phone/tablet/desktop.

- **Cart and checkout** line items use a card layout below `md` and a table-like row at `md+` ([`CartLineItem`](frontend/src/components/CartLineItem.tsx), [`OrderLineItem`](frontend/src/components/OrderLineItem.tsx)).
- **Motion:** CSS hover/focus on product cards and primary buttons; **Framer Motion** for route transitions and home product-grid stagger. Animations respect `prefers-reduced-motion: reduce` (instant transitions when enabled in OS settings).
- **Icons:** Font Awesome is bundled via `@fortawesome/fontawesome-free` (no CDN dependency).
- **E2E:** mobile viewport journeys in [`tests/e2e/misc/responsive-layout.e2e.test.ts`](tests/e2e/misc/responsive-layout.e2e.test.ts).

## Quality and tests

```bash
pnpm quality          # format + tsc + eslint
pnpm quality:fast     # tsc + eslint (CI parity)
pnpm test:unit
pnpm test:integration
pnpm test:e2e         # Spawns dedicated E2E stack (ports 5030 + 5031); needs Mongo
pnpm test:e2e:dev     # Reuse a running `pnpm dev:e2e` on :5030/:5031 (no extra server spawn)
pnpm dev:e2e          # Start E2E stack manually for iterative test runs
```

**E2E preflight:** Mongo must be running before E2E. Playwright seeds the DB in global setup. Tests hit **http://localhost:5030** (UI + proxied `/api/*`). Manual browsing stays on **http://localhost:5020** — both can run at the same time (they share MongoDB, so E2E seed/mutations can still affect manual dev data).

Run a single E2E file:

```bash
pnpm test:e2e:one -- tests/e2e/smoke/app-boot.e2e.test.ts
```

### PayPal sandbox E2E

Add to `.env.test`:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_SANDBOX_BUYER_EMAIL`
- `PAYPAL_SANDBOX_BUYER_PASSWORD`

PayPal specs run automatically when `.env.test` has real (non-placeholder) sandbox credentials. Otherwise they are skipped with an explicit message. PayPal-tagged tests run in a serial **`paypal` Playwright project** after the main suite (see `docs/e2e-testing-rules.md`).

```bash
pnpm test:e2e:paypal          # canonical PayPal spec only (isolated)
PW_RUN_PAYPAL=1 pnpm test:e2e # full suite + journey PayPal opt-in test
```

`pnpm verify:full` runs the full E2E suite once (including the PayPal project when creds are set).

**CI PayPal job:** set repository variable `ENABLE_PAYPAL_E2E=true` and secrets `PAYPAL_CLIENT_ID`, `PAYPAL_SANDBOX_BUYER_EMAIL`, `PAYPAL_SANDBOX_BUYER_PASSWORD`.

### Verification gates

| Command            | What it runs                                                     |
| ------------------ | ---------------------------------------------------------------- |
| `pnpm verify`      | format, quality, unit, integration, build                        |
| `pnpm verify:full` | above + full E2E (PayPal project once when creds in `.env.test`) |

## Deployment

Production uses **MongoDB Atlas M0** and **Render**. Complete local verification first, then follow [`docs/deployment-atlas-render.md`](docs/deployment-atlas-render.md) (ISSUE-015 repo rename + Atlas + Render are manual steps).

## Database

Local and test environments use:

```text
mongodb://127.0.0.1:27017/merns-shop
```

Minimum MongoDB version: **6.0** (Docker image uses Mongo **7**).
