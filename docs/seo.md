# SEO — Mern's Shop

Technical SEO for the Vite SPA + Express API deployment.

## Production site

- **Live URL:** [https://merns-shop.onrender.com/](https://merns-shop.onrender.com/)
- **Developer:** Zeddrix Fabian
- **Profile links (Person `sameAs`):**
  - [GitHub repo](https://github.com/zeddrix/merns-shop)
  - [Portfolio](https://github.com/zeddrix/portfolio)
  - [LinkedIn](https://www.linkedin.com/in/zeddrix-fabian-30a18029a/)

## Environment variables

| Variable        | Used by        | Purpose                                                 |
| --------------- | -------------- | ------------------------------------------------------- |
| `VITE_SITE_URL` | Frontend build | Canonical URLs, Open Graph, Twitter Card, JSON-LD       |
| `SITE_URL`      | Backend        | `robots.txt` Sitemap line, `sitemap.xml` locs, bot HTML |

**Local development**

```env
VITE_SITE_URL=http://localhost:5020
SITE_URL=http://localhost:5021
```

**Render production** — set both to your public origin:

```env
VITE_SITE_URL=https://merns-shop.onrender.com
SITE_URL=https://merns-shop.onrender.com
```

No trailing slash.

## What is implemented

- **Per-route meta** via `react-helmet-async` (`Meta`, `SeoPrivateMeta`)
- **Developer attribution** on every meta description: `Developed by Zeddrix Fabian.`
- **Author meta** (`<meta name="author" content="Zeddrix Fabian">`) on all pages
- **Open Graph / Twitter** on public pages with dedicated OG image (`/images/og-default.webp`, 1200×630)
- **JSON-LD** (`WebSite`, `Organization`, `Person`, `Product`, `WebPage`) on home, about, and product pages
- **`robots.txt`** and dynamic **`sitemap.xml`** (home, about at priority 0.9, all product URLs from MongoDB)
- **`noindex`** on auth, checkout, cart, profile, orders, admin, 404
- **Search & filter URLs**: search uses `noindex,follow`; filter query strings canonicalize to `/`
- **Bot HTML shells** in production for `/`, `/about`, and `/product/:id` (Facebook, Twitter, Slack, Googlebot, etc.)

## Meta description convention

All descriptions are built with `buildMetaDescription()` in `frontend/src/utils/seoMeta.ts` (mirrored in `backend/config/seo.ts` for bot HTML). The helper:

1. Truncates primary text to fit within 155 characters including the suffix
2. Appends ` Developed by Zeddrix Fabian.` unless the name is already present (e.g. About page)

## Search Console (name discovery)

After deploy to `https://merns-shop.onrender.com`:

1. Verify property for `merns-shop.onrender.com` in [Google Search Console](https://search.google.com/search-console).
2. Submit sitemap: `https://merns-shop.onrender.com/sitemap.xml`
3. URL Inspection on:
   - `https://merns-shop.onrender.com/about` (primary page for “Zeddrix Fabian” queries)
   - `https://merns-shop.onrender.com/`
4. Optional: [Bing Webmaster Tools](https://www.bing.com/webmasters) with the same sitemap.

### Off-site signals (recommended)

- Add the live site URL to your [LinkedIn featured section](https://www.linkedin.com/in/zeddrix-fabian-30a18029a/)
- Link the live demo from GitHub repo About/README (done in this repo)
- Cross-link portfolio and shop in GitHub profile

## Manual sharing checks

After deploy, validate previews:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

Test `/about` and a product URL; you should see developer attribution and the OG image, not the generic favicon.

## Recommendations (deferred)

| ID    | Item                        | Notes                                            |
| ----- | --------------------------- | ------------------------------------------------ |
| REC-1 | SSR/SSG (Next/Remix)        | Best long-term crawlability                      |
| REC-2 | Google Merchant Center feed | Shopping ads                                     |
| REC-3 | Filter URL `noindex`        | Only if Search Console reports duplicate content |
| REC-4 | `hreflang`                  | Only if adding locales                           |

## Static shell (`frontend/index.html`)

The Vite entry HTML sets charset, viewport, theme-color, favicon, and a default `<title>` aligned with runtime Helmet. Meta description, author, Open Graph, and JSON-LD are injected client-side via `Meta` / `SeoPrivateMeta`. Production crawlers and social bots receive full meta from `seoBotMiddleware` pre-rendered HTML on `/`, `/about`, and `/product/:id`.

## Build note

`scripts/check-seo-env.mjs` warns when `VITE_SITE_URL` is unset during production builds.
