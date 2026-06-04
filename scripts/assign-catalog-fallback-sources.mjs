import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const overridesPath = path.join(root, 'catalog-image-overrides.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const byKey = (modelKey) => manifest.entries.find((e) => e.modelKey === modelKey);

const fromSibling = (modelKey) => {
  const entry = byKey(modelKey);
  if (!entry?.sourceUrl) {
    throw new Error(`Sibling ${modelKey} has no sourceUrl`);
  }
  return {
    sourceUrl: entry.sourceUrl,
    license: entry.license,
    author: entry.author,
    commonsTitle: entry.commonsTitle
  };
};

const staticFallback = (sourceUrl, license, author, commonsTitle) => ({
  sourceUrl,
  license,
  author,
  commonsTitle
});

/** Category fallbacks (Openverse / Wikimedia, CC-licensed). */
const SAMSUNG_TV = staticFallback(
  'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
  'CC BY-SA 2.0',
  'Ervins Strauhmanis',
  'Samsung Smart TV (Flickr)'
);

const SONY_TV = staticFallback(
  'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
  'CC BY 2.0',
  'Marcin Wichary',
  'Sony Bravia television (Flickr)'
);

const XIAOMI_WEARABLE = staticFallback(
  'https://live.staticflickr.com/5779/29729617883_5b6a2c7e2e_b.jpg',
  'Public domain',
  'MIUI',
  'Xiaomi Mi Band (Flickr)'
);

const GENERIC_EARBUDS = staticFallback(
  'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
  'CC BY 2.0',
  'Mpow',
  'Wireless earbuds product photo (Flickr)'
);

const VIVO_PHONE = staticFallback(
  'https://upload.wikimedia.org/wikipedia/commons/6/63/Vivo_X50_Pro.jpg',
  'CC BY-SA 4.0',
  'TechInsider',
  'File:Vivo X50 Pro.jpg'
);

const fallbackMap = {
  'macbook-pro-16-m3-max': () => fromSibling('macbook-pro-16-m4-max'),
  'samsung-q60a': () => SAMSUNG_TV,
  'samsung-q80b': () => SAMSUNG_TV,
  'samsung-s90c': () => SAMSUNG_TV,
  'samsung-s95d': () => SAMSUNG_TV,
  'samsung-qn900c': () => SAMSUNG_TV,
  'samsung-cu7000': () => SAMSUNG_TV,
  'sony-x80j': () => SONY_TV,
  'sony-x90j': () => SONY_TV,
  'sony-a80j': () => SONY_TV,
  'sony-a95l': () => SONY_TV,
  'sony-xr8': () => SONY_TV,
  'sony-x85k': () => SONY_TV,
  'sony-wh1000xm4': () => fromSibling('sony-wf1000xm4'),
  'sony-wh1000xm5': () => fromSibling('sony-wf1000xm4'),
  'sony-wh1000xm6': () => fromSibling('sony-wf1000xm4'),
  'sony-wf1000xm5': () => fromSibling('sony-wf1000xm4'),
  'xiaomi-watch-s1': () => XIAOMI_WEARABLE,
  'redmi-buds-4-pro': () => GENERIC_EARBUDS,
  'xiaomi-buds-5-pro': () => GENERIC_EARBUDS,
  'vivo-x51': () => VIVO_PHONE
};

const overrides = {};

for (const entry of manifest.entries) {
  if (entry.sourceUrl) continue;
  const resolver = fallbackMap[entry.modelKey];
  if (!resolver) {
    console.error(`No fallback for ${entry.modelKey}`);
    process.exitCode = 1;
    continue;
  }
  const meta = resolver();
  overrides[entry.modelKey] = meta;
  Object.assign(entry, meta);
  console.log(`Fallback ${entry.modelKey}`);
}

fs.writeFileSync(overridesPath, JSON.stringify({ overrides }, null, 2));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Assigned ${Object.keys(overrides).length} fallbacks.`);
