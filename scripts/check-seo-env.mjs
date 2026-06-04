#!/usr/bin/env node
/**
 * Warn when building for production without VITE_SITE_URL (canonical/OG URLs).
 */
const isProductionBuild =
  process.env.NODE_ENV === 'production' || process.argv.includes('--production');

if (isProductionBuild && !process.env.VITE_SITE_URL?.trim()) {
  console.warn(
    '[seo] VITE_SITE_URL is not set. Canonical and Open Graph URLs may fall back to localhost.'
  );
  process.exit(0);
}
