# Catalog product images

Hero images for all catalog parents are normalized to **1200×900 WebP** under `frontend/public/images/catalog/`.

## Source policy

- **Licensed/official only** — Apple/Samsung/Sony official CDN where reachable, otherwise Wikimedia Commons / Flickr (CC), documented in manifest.
- **Vivo, Xiaomi, Amazon** — Wikimedia Commons via curated mappings in [`catalog-image-curated-sources.json`](../catalog-image-curated-sources.json).
- **Overrides** — manual fixes in [`catalog-image-overrides.json`](../catalog-image-overrides.json).

## Full refresh workflow

```bash
pnpm catalog:manifest
pnpm catalog:harvest:official -- --force    # Apple/Samsung/Sony CDN where reachable
pnpm catalog:apply:curated                  # curated + reachable Apple CDN + wave-4 brands
pnpm catalog:sources:official               # merge official/curated into manifest
pnpm catalog:sources --reaudit              # re-resolve Commons gaps (optional)
pnpm catalog:images --force
pnpm catalog:validate
pnpm catalog:audit                          # metadata relevance gate (must be 0 failed)
pnpm catalog:visual-review                  # writes catalog-image-visual-review.json
```

## Fixing a single bad image

1. Add or update `catalog-image-overrides.json` (or `catalog-image-official-sources.json` for Apple/Samsung/Sony).
2. `node scripts/fetch-catalog-images.mjs --fetch --webp --force --only=<modelKey>`
3. `pnpm catalog:validate && pnpm catalog:audit`

## Audit and review artifacts

| File | Purpose |
|------|---------|
| `catalog-image-audit-report.json` | Metadata relevance failures |
| `catalog-image-visual-review.json` | Per-product pass/fail after file + audit checks |
| `catalog-image-curated-sources.json` | Licensed URL map for hard-to-harvest models |

## CDN patterns

| Brand   | Typical CDN host                  |
| ------- | --------------------------------- |
| Apple   | `store.storeimages.cdn-apple.com` |
| Samsung | `images.samsung.com`              |
| Sony    | `electronics.sony.com`          |

## Attribution

See [`frontend/public/images/catalog/ATTRIBUTION.md`](../frontend/public/images/catalog/ATTRIBUTION.md).
