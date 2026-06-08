#!/usr/bin/env node
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const baseUrl = process.env.LH_BASE_URL ?? 'http://localhost:5040';
const thresholds = {
  performance: Number(process.env.LH_MIN_PERFORMANCE ?? 85),
  lcpMs: Number(process.env.LH_MAX_LCP_MS ?? 2500),
  cls: Number(process.env.LH_MAX_CLS ?? 0.1)
};

const paths = ['/', '/cart'];

const launchChrome = async () => {
  return chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
};

const auditUrl = async (chrome, url) => {
  const result = await lighthouse(
    url,
    {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port
    },
    undefined
  );

  if (!result?.lhr) {
    throw new Error(`Lighthouse returned no result for ${url}`);
  }

  return result.lhr;
};

const readMetric = (lhr, id) => {
  const audit = lhr.audits[id];
  if (!audit || audit.score === null || audit.numericValue === undefined) {
    return null;
  }
  return audit.numericValue;
};

const waitForServer = async (url, attempts = 30) => {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${url}/api/products`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server not ready at ${url} after ${attempts} attempts`);
};

const main = async () => {
  if (process.env.LH_SKIP === '1') {
    console.log('LH_SKIP=1 — skipping Lighthouse CI.');
    return;
  }

  await waitForServer(baseUrl);
  const chrome = await launchChrome();
  let failed = false;

  try {
    for (const pathname of paths) {
      const url = `${baseUrl}${pathname}`;
      const lhr = await auditUrl(chrome, url);
      const perfScore = Math.round((lhr.categories.performance?.score ?? 0) * 100);
      const lcp = readMetric(lhr, 'largest-contentful-paint');
      const cls = readMetric(lhr, 'cumulative-layout-shift');

      console.log(`\n${url}`);
      console.log(`  Performance: ${perfScore} (min ${thresholds.performance})`);
      console.log(`  LCP: ${lcp?.toFixed(0) ?? 'n/a'} ms (max ${thresholds.lcpMs})`);
      console.log(`  CLS: ${cls?.toFixed(3) ?? 'n/a'} (max ${thresholds.cls})`);

      if (perfScore < thresholds.performance) {
        console.error(`  FAIL: performance score ${perfScore} < ${thresholds.performance}`);
        failed = true;
      }
      if (lcp !== null && lcp > thresholds.lcpMs) {
        console.error(`  FAIL: LCP ${lcp.toFixed(0)}ms > ${thresholds.lcpMs}ms`);
        failed = true;
      }
      if (cls !== null && cls > thresholds.cls) {
        console.error(`  FAIL: CLS ${cls.toFixed(3)} > ${thresholds.cls}`);
        failed = true;
      }
    }
  } finally {
    await chrome.kill();
  }

  if (failed) {
    process.exit(1);
  }

  console.log('\nLighthouse CI passed.');
};

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
