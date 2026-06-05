const USER_AGENT = 'merns-shop-catalog/1.0 (educational demo)';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {string} url */
export async function isReachableImage(url) {
  try {
    const head = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } });
    if (head.ok) {
      const type = head.headers.get('content-type') ?? '';
      if (type.startsWith('image/')) return true;
    }
    const get = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!get.ok) return false;
    const type = get.headers.get('content-type') ?? '';
    return type.startsWith('image/');
  } catch {
    return false;
  }
}

/** @param {string} html */
export function extractUrls(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[0].replace(/&amp;/g, '&'));
}

export const APPLE_CDN_QUERY = 'wid=1200&hei=1200&fmt=png-alpha&qlt=80';
export const APPLE_CDN_BASES = [
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is',
  'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is',
  'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is'
];

/** @param {string} assetPath */
export function appleCdnCandidates(assetPath) {
  return APPLE_CDN_BASES.map((base) => `${base}/${assetPath}?${APPLE_CDN_QUERY}`);
}

/** @param {string} modelKey */
export function buildSamsungPageUrl(modelKey, subcategory) {
  if (subcategory === 'TVs') {
    const tvSlug = modelKey.replace('samsung-', '');
    return `https://www.samsung.com/us/televisions-home-theater/tvs/all-tvs/?search=${tvSlug}`;
  }
  if (subcategory === 'Tablets') {
    return `https://www.samsung.com/us/tablets/${modelKey}/`;
  }
  if (subcategory === 'Wearables') {
    if (modelKey.includes('buds')) {
      return `https://www.samsung.com/us/audio-sound/galaxy-buds/${modelKey}/`;
    }
    return `https://www.samsung.com/us/watches/${modelKey}/`;
  }
  return `https://www.samsung.com/us/smartphones/${modelKey}/`;
}

/** @param {string} modelKey */
export function buildSonyPageUrl(modelKey, subcategory) {
  if (subcategory === 'TVs') {
    return 'https://electronics.sony.com/tv/' + modelKey;
  }
  if (subcategory === 'Consoles') {
    return 'https://www.playstation.com/en-us/ps5/';
  }
  return 'https://electronics.sony.com/audio/' + modelKey;
}

/** @param {string} modelKey */
export function buildApplePageUrl(modelKey, subcategory) {
  if (subcategory === 'Laptops' || modelKey.startsWith('macbook') || modelKey.startsWith('imac')) {
    return `https://www.apple.com/${modelKey}/`;
  }
  if (modelKey.startsWith('ipad')) {
    return `https://www.apple.com/${modelKey}/`;
  }
  if (modelKey.startsWith('iphone')) {
    return `https://www.apple.com/${modelKey}/`;
  }
  if (modelKey.startsWith('airpods')) {
    return `https://www.apple.com/${modelKey}/`;
  }
  if (modelKey.includes('watch')) {
    return `https://www.apple.com/apple-watch-${modelKey.replace('apple-watch-', '')}/`;
  }
  return `https://www.apple.com/${modelKey}/`;
}

/** @param {string} modelKey */
export function samsungModelTokens(modelKey) {
  const normalized = modelKey.replace(/^galaxy-/, '').replace(/-/g, '');
  const tokens = [modelKey.replace(/-/g, ''), normalized];
  if (modelKey.startsWith('galaxy-')) {
    tokens.push(modelKey.replace('galaxy-', ''));
  }
  if (modelKey.startsWith('samsung-')) {
    tokens.push(modelKey.replace('samsung-', ''));
  }
  return [...new Set(tokens.map((token) => token.toLowerCase()).filter(Boolean))];
}

/** @param {string} html @param {string} modelKey */
export function pickSamsungImageUrl(html, modelKey) {
  const modelTokens = samsungModelTokens(modelKey);
  const candidates = [
    ...extractUrls(html, /https:\/\/images\.samsung\.com\/is\/image\/samsung\/[^"'\s<>]+/g),
    ...extractUrls(html, /https:\/\/images\.samsung\.com\/us\/[^"'\s<>]+\.(?:jpg|png|webp)/g)
  ];
  const scored = candidates
    .filter((url) => !url.includes('icon') && !url.includes('logo'))
    .map((url) => {
      const lower = url.toLowerCase();
      let score = 0;
      if (url.includes('highlights-kv')) score += 5;
      if (url.includes('thumbnail')) score += 2;
      if (url.includes('share-image')) score += 1;
      if (url.includes('is/image/samsung')) score += 3;
      if (lower.includes('galaxy-s26-ultra') || lower.includes('/s2602/')) score -= 20;
      for (const token of modelTokens) {
        if (token.length > 2 && lower.includes(token.replace(/-/g, ''))) score += 8;
        if (token.length > 2 && lower.includes(token)) score += 6;
      }
      return { url, score };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored.find((item) => item.score >= 6);
  return best?.url ?? null;
}

/** @param {string} html */
export function pickSonyImageUrl(html) {
  const candidates = [
    ...extractUrls(html, /https:\/\/[^"'\s<>]*sony[^"'\s<>]*\.(?:jpg|png|webp)[^"'\s<>]*/g),
    ...extractUrls(html, /https:\/\/media\.sony[^"'\s<>]+/g)
  ];
  const og = html.match(/property="og:image" content="([^"]+)"/);
  if (og?.[1]) candidates.unshift(og[1]);
  return (
    candidates.find(
      (url) => url.includes('product') || url.includes('hero') || url.includes('kv')
    ) ??
    candidates[0] ??
    null
  );
}
