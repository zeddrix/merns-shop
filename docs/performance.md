# Performance

Targets, commands, and budgets for Mern's Shop. Run these before releases and after performance-related changes.

## Budgets

| Metric                        | Target                               | Enforced in CI                                   |
| ----------------------------- | ------------------------------------ | ------------------------------------------------ |
| Main entry JS (gzip)          | ≤ 250 KB                             | `build` job (`pnpm perf:bundle-size`)            |
| Lighthouse Performance (home) | ≥ 85                                 | `lighthouse` job (optional skip via `LH_SKIP=1`) |
| LCP (home, prod build)        | ≤ 2.5 s                              | `lighthouse` job                                 |
| CLS (home)                    | ≤ 0.1                                | `lighthouse` job                                 |
| PWA precache manifest         | ≤ 5 MB                               | Manual / PWA E2E                                 |
| `GET /api/products` payload   | ≥ 50% smaller than full-doc baseline | Integration tests                                |

## Commands

```bash
# Full quality gate
pnpm quality

# Production build + bundle size check
pnpm build
pnpm perf:bundle-size

# Bundle treemap (opens stats.html in frontend/dist/)
pnpm build:analyze

# Size-limit (requires build first)
pnpm exec size-limit

# Lighthouse against prod server on :5040
pnpm build:pwa:e2e
pnpm db:seed
pnpm serve:pwa:e2e &
pnpm perf:lighthouse

# Performance E2E (dev stack)
pnpm test:e2e:one -- tests/e2e/misc/performance-shell.e2e.test.ts
```

## Architecture choices

- **Route code splitting** — admin, checkout, and profile screens lazy-loaded
- **Tree-shaken icons** — SVG Font Awesome imports instead of full CSS
- **Responsive WebP** — 400w / 800w / 1200w derivatives via catalog pipeline
- **Slim list API** — projection + `.lean()` on product list endpoints
- **In-memory fetch cache** — 60s TTL for product list/meta/top in Redux thunks
- **JWT claims auth** — `protect` / `optionalAuth` read `isAdmin` from the token (no DB lookup per request). Admin demotion takes effect only after re-login; trade-off documented for performance vs instant revocation.
- **Rate limits** — `API_RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` env vars (Playwright sets `10000` on the E2E stack so long suites do not hit 429s).
- **PWA** — runtime cache for catalog images; precache shell assets only; SW caches `GET /api/products` (list), meta, and top for offline home

## Phase 2 (deferred infra)

These require paid services or larger refactors. Enable when triggers are met.

| Item                       | Trigger                                                 | Notes                                                               |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| **CDN** (Cloudflare, etc.) | Catalog > 500 images or TTFB > 500 ms for static assets | Offload `/images/catalog/` and hashed `/assets/` from Node          |
| **Render paid tier**       | Cold starts unacceptable for demos                      | Free tier sleeps ~15 min idle; 30–60 s wake time                    |
| **AVIF derivatives**       | After WebP srcset stable                                | ~15–25% extra savings; add `<picture>` fallbacks                    |
| **RTK Query migration**    | Fetch cache complexity grows                            | Replace lightweight TTL cache if cache invalidation becomes brittle |
| **web-vitals RUM**         | Need production field data                              | Report LCP/INP/CLS to analytics endpoint                            |
| **List virtualization**    | `PRODUCTS_PER_PAGE` > 24                                | `@tanstack/react-virtual` on catalog grid                           |

See also [`deployment-atlas-render.md`](deployment-atlas-render.md) for Render/Atlas constraints.
