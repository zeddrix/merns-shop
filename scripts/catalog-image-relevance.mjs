import { isPollutedOfficialUrl } from './is-polluted-official-url.mjs';

/** @type {readonly string[]} */
export const TITLE_DENYLIST = [
  'soup',
  'food',
  'yatra',
  'jatra',
  'tractor',
  'renault',
  'wheat',
  'field',
  'landscape',
  'parade',
  'campos',
  'fontihoyuelo',
  'gandabahali',
  'fulkopir',
  'environmental_impact',
  'frwiki iphone',
  'স্যুপ',
  'ফুলকপির',
  'gandabahali',
  'hartono',
  'mall',
  'store',
  'shop',
  'extracted',
  'mini-sim',
  'invoice',
  'receipt',
  'box',
  'packaging',
  'unboxing',
  'mapillary',
  'windshield',
  'street view',
  'backcase',
  'back case',
  'black hole',
  'stellar',
  'nebula',
  'nasa',
  'astronom',
  'telescope',
  'cosmic',
  'illustration:',
  'x-7-'
];

export const PHONE_SUBCATEGORIES = new Set(['Phones']);

/** @param {string} value */
export function normalizeTokens(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/** @param {string} modelKey */
export function modelKeyTokens(modelKey) {
  return normalizeTokens(modelKey.replace(/-/g, ' '));
}

/** @param {string} name */
export function productNameTokens(name) {
  return normalizeTokens(name);
}

/** @param {string} brand */
export function brandTokens(brand) {
  const base = normalizeTokens(brand);
  if (brand === 'Apple') {
    return [...base, 'apple', 'iphone', 'ipad', 'macbook', 'imac', 'airpods', 'watch'];
  }
  if (brand === 'Xiaomi') return [...base, 'xiaomi', 'poco', 'redmi', 'mi'];
  if (brand === 'Sony') return [...base, 'sony', 'playstation', 'ps4', 'ps5'];
  if (brand === 'Samsung') return [...base, 'samsung', 'galaxy'];
  if (brand === 'Vivo') return [...base, 'vivo'];
  return base;
}

/**
 * @param {string} haystack
 * @param {string[]} needles
 */
export function countTokenHits(haystack, needles) {
  const lower = haystack.toLowerCase();
  return needles.filter((token) => lower.includes(token)).length;
}

/**
 * @param {object} entry
 * @param {string} entry.modelKey
 * @param {string} entry.name
 * @param {string} entry.brand
 * @param {string} [entry.subcategory]
 * @param {string} [entry.sourceUrl]
 * @param {string} [entry.commonsTitle]
 * @param {string} [entry.sourceType]
 */
export function scoreManifestEntryRelevance(entry) {
  const reasons = [];
  let score = 0;

  const sourceUrl = entry.sourceUrl ?? '';
  const commonsTitle = entry.commonsTitle ?? '';
  const titleLower = commonsTitle.toLowerCase();
  const combined = `${commonsTitle} ${sourceUrl}`.toLowerCase();

  if (!sourceUrl) {
    return { ok: false, score: -100, reasons: ['missing sourceUrl'] };
  }

  if (isPollutedOfficialUrl(sourceUrl)) {
    reasons.push('polluted official CDN URL');
    score -= 50;
  }

  for (const denied of TITLE_DENYLIST) {
    if (titleLower.includes(denied)) {
      reasons.push(`denylist match: ${denied}`);
      score -= 20;
    }
  }

  const keyTokens = modelKeyTokens(entry.modelKey);
  const nameTokens = productNameTokens(entry.name);
  const brandToks = brandTokens(entry.brand);
  const requiredTokens = [...new Set([...keyTokens, ...nameTokens])];

  const titleHits = countTokenHits(commonsTitle, requiredTokens);
  const urlHits = countTokenHits(sourceUrl, requiredTokens);
  const brandHits = countTokenHits(combined, brandToks);

  const categoryFallback =
    (entry.subcategory === 'Audio' || entry.subcategory === 'Wearables') &&
    ['licensed-fallback', 'wikimedia-sibling', 'official-category-donor'].includes(
      entry.sourceType ?? ''
    );

  if (brandHits === 0 && !categoryFallback) {
    reasons.push('brand not found in source metadata');
    score -= 8;
  } else if (brandHits > 0) {
    score += brandHits * 2;
  } else if (categoryFallback) {
    score += 2;
  }

  const metadataHits = Math.max(titleHits, urlHits);
  const siblingLike = ['sibling', 'fallback', 'donor', 'wikimedia'].some((token) =>
    (entry.sourceType ?? '').includes(token)
  );
  if (metadataHits === 0 && !siblingLike) {
    reasons.push('product tokens not found in commonsTitle or sourceUrl');
    score -= 15;
  } else if (metadataHits > 0) {
    score += metadataHits * 4;
  } else if (siblingLike && brandHits > 0) {
    score += 4;
  }

  if (entry.subcategory === 'Phones') {
    const phoneSignals = [
      'phone',
      'smartphone',
      'galaxy',
      'iphone',
      'redmi',
      'poco',
      'vivo',
      'xiaomi'
    ];
    const astronomySignals = [
      'black hole',
      'stellar',
      'nebula',
      'nasa',
      'astronom',
      'telescope',
      'cosmic',
      'galaxy (',
      'nearby galaxy'
    ];
    if (astronomySignals.some((signal) => titleLower.includes(signal))) {
      reasons.push('phones subcategory linked to astronomy image');
      score -= 40;
    }
    const hasPhoneSignal = phoneSignals.some((signal) => combined.includes(signal));
    if (!hasPhoneSignal && metadataHits < 2) {
      reasons.push('phones subcategory lacks phone-related metadata');
      score -= 10;
    }
  }

  if (entry.subcategory === 'TVs' && combined.includes('smartphone')) {
    reasons.push('TV product linked to smartphone image');
    score -= 25;
  }

  if (entry.sourceType === 'official' && entry.brand === 'Samsung' && sourceUrl.includes('s2602')) {
    reasons.push('Samsung official URL appears to be unrelated S26 promo');
    score -= 40;
  }

  const hardFails = reasons.filter(
    (r) =>
      r.startsWith('denylist') ||
      r.startsWith('polluted') ||
      r.startsWith('TV product') ||
      r.startsWith('phones subcategory lacks') ||
      r.startsWith('phones subcategory linked to astronomy')
  );
  const ok = score >= 0 && hardFails.length === 0;

  return { ok, score, reasons };
}

/**
 * @param {object[]} entries
 * @param {object} [options]
 * @param {Set<string>} [options.allowedDuplicateUrls]
 */
export function findDuplicateSourceUrls(entries, options = {}) {
  const allowed = options.allowedDuplicateUrls ?? new Set();
  /** @type {Map<string, string[]>} */
  const byUrl = new Map();

  for (const entry of entries) {
    const url = entry.sourceUrl?.trim();
    if (!url) continue;
    const list = byUrl.get(url) ?? [];
    list.push(entry.modelKey);
    byUrl.set(url, list);
  }

  /** @type {{ modelKey: string, sourceUrl: string, duplicates: string[] }[]} */
  const failures = [];
  for (const [sourceUrl, modelKeys] of byUrl.entries()) {
    if (modelKeys.length <= 1 || allowed.has(sourceUrl)) continue;
    for (const modelKey of modelKeys) {
      failures.push({
        modelKey,
        sourceUrl,
        duplicates: modelKeys.filter((key) => key !== modelKey)
      });
    }
  }
  return failures;
}

/**
 * @param {object} entry
 * @param {object[]} allEntries
 * @param {Set<string>} [allowedDuplicateUrls]
 */
export function auditManifestEntry(entry, allEntries, allowedDuplicateUrls = new Set()) {
  const relevance = scoreManifestEntryRelevance(entry);
  const reasons = [...relevance.reasons];

  const donorSourceTypes = new Set([
    'official-category-donor',
    'licensed-fallback',
    'sibling',
    'override',
    'category-donor',
    'wikimedia-sibling',
    'wikimedia',
    'official'
  ]);

  if (entry.sourceUrl && !donorSourceTypes.has(entry.sourceType ?? '')) {
    const dupes = findDuplicateSourceUrls(allEntries, { allowedDuplicateUrls }).filter(
      (item) => item.modelKey === entry.modelKey
    );
    if (dupes.length > 0 && !allowedDuplicateUrls.has(entry.sourceUrl)) {
      const sameSubcategory = dupes.some((dup) => {
        const other = allEntries.find((e) => dup.duplicates.includes(e.modelKey));
        return other && other.subcategory === entry.subcategory && other.brand === entry.brand;
      });
      const siblingTypes = new Set([
        'wikimedia-hand-curated',
        'wikimedia-agent-visual',
        'wikimedia-sibling',
        'official'
      ]);
      const handCuratedSibling =
        siblingTypes.has(entry.sourceType ?? '') &&
        dupes.every((dup) => {
          const other = allEntries.find((row) => dup.duplicates.includes(row.modelKey));
          return siblingTypes.has(other?.sourceType ?? '') && other.brand === entry.brand;
        });
      if (sameSubcategory && entry.subcategory === 'Phones' && !handCuratedSibling) {
        reasons.push(`duplicate sourceUrl shared with ${dupes[0].duplicates.join(', ')}`);
      }
    }
  }

  const ok = relevance.ok && !reasons.some((r) => r.startsWith('duplicate sourceUrl'));

  return {
    modelKey: entry.modelKey,
    name: entry.name,
    brand: entry.brand,
    subcategory: entry.subcategory,
    sourceUrl: entry.sourceUrl,
    commonsTitle: entry.commonsTitle,
    ok,
    score: relevance.score,
    reasons
  };
}

/**
 * @param {object} candidate
 * @param {string} candidate.title
 * @param {object} product
 * @param {string} product.name
 * @param {string} product.brand
 * @param {string} product.modelKey
 */
export function scoreCommonsCandidate(candidate, product) {
  const title = candidate.title ?? '';
  const lower = title.toLowerCase();
  let score = 0;

  if (/\.(jpg|jpeg|png|webp)$/i.test(lower)) score += 3;
  if (lower.includes('logo') || lower.includes('icon') || lower.includes('diagram')) score -= 5;
  if (lower.includes('svg')) score -= 5;

  for (const denied of TITLE_DENYLIST) {
    if (lower.includes(denied)) score -= 15;
  }

  const brandLower = product.brand.toLowerCase();
  if (lower.includes(brandLower)) score += 4;

  const modelTokens = modelKeyTokens(product.modelKey);
  for (const token of modelTokens) {
    if (token.length > 2 && lower.includes(token)) score += 3;
  }

  const modelNumber = modelTokens.find((token) => /^\d+[a-z]?$/i.test(token));
  if (modelNumber) {
    const wrongNumber = /\b(iphone|galaxy|ipad|tab|ps|poco|redmi|vivo|xiaomi)\s*(\d+[a-z]?)/i.exec(
      lower
    );
    if (wrongNumber && wrongNumber[2] !== modelNumber && wrongNumber[2] !== `${modelNumber}`) {
      score -= 12;
    }
  }

  for (const token of productNameTokens(product.name)) {
    if (token.length > 2 && lower.includes(token)) score += 2;
  }

  if (lower.includes('phone') || lower.includes('smartphone') || lower.includes('product'))
    score += 2;
  if (
    lower.includes('back') ||
    lower.includes('backside') ||
    lower.includes('all color') ||
    lower.includes('product red')
  ) {
    score += 4;
  }

  const width = candidate.width ?? 0;
  const height = candidate.height ?? 0;
  if (width >= 400 && height >= 400) score += 3;
  if (width >= 800) score += 2;

  return score;
}

/** @param {object} product @param {number} score */
export function commonsCandidateThreshold(product, score) {
  const title = product.commonsTitle ?? '';
  const lower = `${title} ${product.name}`.toLowerCase();
  const phoneLike =
    product.subcategory === 'Phones' || lower.includes('phone') || lower.includes('smartphone');

  if (phoneLike) {
    const modelHits = countTokenHits(lower, modelKeyTokens(product.modelKey));
    const nameHits = countTokenHits(lower, productNameTokens(product.name));
    return score >= 10 && modelHits + nameHits >= 2;
  }

  return score >= 8;
}

/** @param {object[]} candidates @param {object} product */
export function pickRelevantCommonsCandidate(candidates, product) {
  const scored = candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreCommonsCandidate(candidate, product)
    }))
    .sort((a, b) => b.score - a.score);

  return (
    scored.find((candidate) =>
      commonsCandidateThreshold({ ...product, commonsTitle: candidate.title }, candidate.score)
    ) ?? null
  );
}
