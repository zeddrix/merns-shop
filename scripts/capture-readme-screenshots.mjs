#!/usr/bin/env node
/**
 * Captures README marketing screenshots from a running dev stack (:5020 / :5021).
 * Usage: pnpm dev (separate terminal) + pnpm readme:screenshots
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = (process.env.README_SCREENSHOT_BASE_URL ?? 'http://localhost:5020').replace(
  /\/+$/,
  ''
);
const OUT_DIR = path.resolve('docs/images/readme');
const VIEWPORT = { width: 1280, height: 800 };
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

async function waitForApp(page) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      if (response && response.ok()) {
        await page.locator('[data-testid="product-list"]').first().waitFor({
          state: 'visible',
          timeout: 15_000
        });
        return;
      }
    } catch {
      // retry until dev stack is ready
    }
    await page.waitForTimeout(2_000);
  }
  throw new Error(`App not reachable at ${BASE_URL}. Start MongoDB and run pnpm dev first.`);
}

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/?auth=login`);
  await page.locator('[data-testid="login-email"]').fill(ADMIN_EMAIL);
  await page.locator('[data-testid="login-password"]').fill(ADMIN_PASSWORD);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/users/login') && response.status() === 200
    ),
    page.locator('[data-testid="login-submit"]').click()
  ]);
  await page.locator('[data-testid="nav-login"]').waitFor({ state: 'hidden' });
}

async function capture(page, filename) {
  const filePath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false, type: 'png' });
  process.stdout.write(`Wrote ${filePath}\n`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await waitForApp(page);
    await capture(page, 'homepage.png');

    const firstProduct = page.locator('[data-testid^="product-card-"]').first();
    await firstProduct.click();
    await page.locator('[data-testid="product-details"]').waitFor({ state: 'visible' });
    await capture(page, 'product-page.png');

    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/productlist`);
    await page.locator('[data-testid="admin-product-list"]').waitFor({ state: 'visible' });
    await capture(page, 'admin-products.png');
  } finally {
    await browser.close();
  }

  await writeFile(
    path.join(OUT_DIR, 'ATTRIBUTION.md'),
    `# README screenshots

Captured locally from the dev stack (${BASE_URL}) for GitHub README marketing.

Regenerate:

\`\`\`bash
docker compose up -d mongo
pnpm db:seed
pnpm dev
pnpm readme:screenshots
\`\`\`
`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
