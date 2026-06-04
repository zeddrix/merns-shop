# SEO — Mern's Shop

Technical SEO for the Vite SPA + Express API deployment.

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

**Render production** — set both to your public origin, e.g. `https://merns-shop.onrender.com` (no trailing slash).

## What is implemented

- **Per-route meta** via `react-helmet-async` (`Meta`, `SeoPrivateMeta`)
- **Open Graph / Twitter** on public pages
- **JSON-LD** (`WebSite`, `Organization`, `Product`) on home and product pages
- **`robots.txt`** and dynamic **`sitemap.xml`** (all product URLs from MongoDB)
- **`noindex`** on auth, checkout, cart, profile, orders, admin
- **Search & filter URLs**: search uses `noindex,follow`; filter query strings canonicalize to `/`
- **Bot HTML shells** in production for `/` and `/product/:id` (Facebook, Twitter, Slack, etc.)

## Search Console

1. Verify property for your `SITE_URL` domain.
2. Submit sitemap: `{SITE_URL}/sitemap.xml`
3. Inspect a product URL after deploy to confirm indexing.

## Manual sharing checks

After deploy, validate previews:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

Test a product URL; you should see the product title and image, not the generic shop title.

## Recommendations (decide separately)

| ID    | Item                        | Notes                       |
| ----- | --------------------------- | --------------------------- |
| REC-1 | SSR/SSG (Next/Remix)        | Best long-term crawlability |
| REC-2 | Search Console monitoring   | Ops, not code               |
| REC-3 | Google Merchant Center feed | Shopping ads                |
| REC-4 | Content / backlinks         | Off-site SEO                |
| REC-5 | Self-host Font Awesome CDN  | Core Web Vitals             |
| REC-6 | `hreflang`                  | Only if adding locales      |

## Build note

`scripts/check-seo-env.mjs` warns when `VITE_SITE_URL` is unset during production builds.
