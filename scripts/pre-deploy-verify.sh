#!/usr/bin/env bash
set -euo pipefail

echo "Running pre-deploy verification (ISSUE-015 gate)..."
pnpm format:check
pnpm quality:fast
pnpm test:unit:inner
pnpm test:integration:inner
pnpm build:inner
PW_DISABLE_REUSE_SERVER=1 pnpm test:e2e

echo ""
echo "All checks passed. Complete ISSUE-015 manually:"
echo "  1. GitHub → rename beamazedd-shop → merns-shop"
echo "  2. git remote set-url origin git@github.com:zeddrix/merns-shop.git"
echo "  3. Render → connect merns-shop repo → deploy per docs/deployment-atlas-render.md"
