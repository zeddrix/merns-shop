/** Preferred donor modelKey per brand + subcategory (must be same product type). */
export const CATEGORY_DONOR_MODEL_KEY = {
  'Apple:Phones': 'iphone-15',
  'Apple:Tablets': 'ipad-air-5',
  'Apple:Laptops': 'macbook-air-m2',
  'Apple:Wearables': 'watch-series-9',
  'Apple:Audio': 'airpods-max',
  'Samsung:Phones': 'galaxy-s24',
  'Samsung:Wearables': 'galaxy-watch7',
  'Samsung:TVs': 'samsung-q60a',
  'Sony:Consoles': 'ps5'
};

/** CC-licensed category fallbacks when brand CDN has no reachable hero URL. */
export const SUBCATEGORY_LICENSED_FALLBACK = {
  'Samsung:Tablets': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Tab_S9.png',
    license: 'CC BY-SA 4.0',
    author: 'Samsung',
    commonsTitle: 'File:Samsung Galaxy Tab S9.png'
  },
  'Samsung:Audio': {
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    license: 'CC BY 2.0',
    author: 'Mpow',
    commonsTitle: 'Wireless earbuds product photo (Flickr)'
  },
  'Sony:TVs': {
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary',
    commonsTitle: 'Sony Bravia television (Flickr)'
  },
  'Sony:Audio': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Sony_WF-1000XM4.jpg',
    license: 'CC BY-SA 4.0',
    author: 'KKPCW（Kyu3）',
    commonsTitle: 'File:Sony WF-1000XM4.jpg'
  }
};

/** @param {string} brand @param {string} subcategory */
export function categoryKey(brand, subcategory) {
  return `${brand}:${subcategory}`;
}

/** @param {Record<string, { sourceUrl?: string }>} entries @param {string} modelKey */
export function donorUrlFromModelKey(entries, modelKey) {
  const donor = entries[modelKey];
  return donor?.sourceUrl ?? null;
}
