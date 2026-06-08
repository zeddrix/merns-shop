# Catalog image pipeline data

JSON files for the **product image pipeline** (sources, manifest, reports). Product catalog definitions live in [`backend/data/catalog/`](../../backend/data/catalog/); WebP assets live in [`frontend/public/images/catalog/`](../../frontend/public/images/catalog/).

All paths are exported from [`scripts/catalog-image-paths.mjs`](../../scripts/catalog-image-paths.mjs).

## Layout

| Path            | Role                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `manifest.json` | Per-product image paths, licenses, and attribution (regenerated from catalog TS, then updated by pipeline scripts) |
| `sources/`      | Committed source-of-truth URL maps (official CDN, curated Commons, web-curated, manual overrides)                  |
| `prune/`        | Input lists for destructive prune operations                                                                       |
| `reviews/`      | Agent/human visual review batches                                                                                  |
| `reports/`      | Script output logs (audit, resolve, harvest, etc.) — safe to regenerate via `pnpm catalog:*`                       |

## Common commands

```bash
pnpm catalog:manifest          # regenerate manifest.json from backend/data/catalog
pnpm catalog:sources:official  # merge official sources into manifest
pnpm catalog:images            # fetch/validate WebP under frontend/public/images/catalog
pnpm catalog:audit             # writes reports/audit-report.json
pnpm catalog:visual-review     # writes reports/visual-review.json
```

See [`docs/catalog-official-images.md`](../../docs/catalog-official-images.md) for the full workflow.
