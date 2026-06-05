#!/usr/bin/env bash
set -euo pipefail

echo "Running pre-deploy verification (ISSUE-015 gate)..."
pnpm format:check
pnpm quality:fast
pnpm test:unit:inner
pnpm test:integration:inner
pnpm build:inner
PW_DISABLE_REUSE_SERVER=1 pnpm test:e2e

if [[ -f .env.test ]] && grep -qE '^PAYPAL_SANDBOX_BUYER_EMAIL=.+' .env.test && grep -qE '^PAYPAL_SANDBOX_BUYER_PASSWORD=.+' .env.test && grep -qE '^PAYPAL_CLIENT_ID=.+' .env.test; then
  echo "PayPal credentials found in .env.test — running PayPal E2E..."
  PW_DISABLE_REUSE_SERVER=1 pnpm test:e2e:paypal
else
  echo "Skipping PayPal E2E (set PAYPAL_CLIENT_ID and sandbox buyer creds in .env.test to include them)."
fi

echo ""
echo "All checks passed. Complete ISSUE-015 manually:"
echo "  1. GitHub → rename beamazedd-shop → merns-shop"
echo "  2. git remote set-url origin git@github.com:zeddrix/merns-shop.git"
echo "  3. Render → connect merns-shop repo → deploy per docs/deployment-atlas-render.md"
