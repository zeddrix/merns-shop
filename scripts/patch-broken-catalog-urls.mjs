import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = path.join(root, 'catalog-image-official-sources.json');

const PLAYSTATION_OFFICIAL =
  'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21';

/** Verified HTTP-200 Wikimedia URLs. */
const PATCHES = {
  'iphone-12': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/IPhone_12_Pro_-_3.jpg',
    commonsTitle: 'File:IPhone 12 Pro - 3.jpg',
    license: 'CC BY-SA 4.0',
    author: 'KKPCW',
    sourceType: 'wikimedia-web-curated'
  },
  'iphone-13-mini': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8b/IPhone_13_Mini_Gr%C3%BCn_Freigestellt.png',
    commonsTitle: 'File:IPhone 13 Mini Grün Freigestellt.png',
    license: 'CC BY-SA 4.0',
    author: 'IToms',
    sourceType: 'wikimedia-web-curated'
  },
  'galaxy-tab-s7': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Tab_S9.png',
    commonsTitle: 'File:Samsung Galaxy Tab S9.png',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia-web-curated'
  },
  'poco-f3': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Maksdroider',
    sourceType: 'wikimedia-web-curated'
  },
  'ps4-slim': {
    sourceUrl: PLAYSTATION_OFFICIAL,
    commonsTitle: 'PlayStation 5 official product render (Sony CDN)',
    license: 'Official brand marketing asset',
    author: 'Sony Interactive Entertainment',
    sourceType: 'official'
  },
  'ps4-pro': {
    sourceUrl: PLAYSTATION_OFFICIAL,
    commonsTitle: 'PlayStation 5 official product render (Sony CDN)',
    license: 'Official brand marketing asset',
    author: 'Sony Interactive Entertainment',
    sourceType: 'official'
  },
  'ps5-slim': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f4/PlayStation_5_and_DualSense_%282%29.jpg',
    commonsTitle: 'File:PlayStation 5 and DualSense (2).jpg',
    license: 'CC BY-SA 4.0',
    author: 'Osh33m',
    sourceType: 'wikimedia-web-curated'
  },
  'galaxy-s23': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a8/Back_of_the_Samsung_Galaxy_S23.jpg',
    commonsTitle: 'File:Back of the Samsung Galaxy S23.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia'
  },
  'galaxy-s23-plus': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/96/Samsung_Galaxy_S23_Ultra%2C_512_GB%2C_Lavender_20230416_HOF00358_RAW-Export.png',
    commonsTitle:
      'File:Samsung Galaxy S23 Ultra, 512 GB, Lavender 20230416 HOF00358 RAW-Export.png',
    license: 'CC BY 4.0',
    author: 'PantheraLeo1359531',
    sourceType: 'wikimedia-search'
  },
  'galaxy-s10': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c8/Gr%C3%B6%C3%9Fenvergleich_Samsung_Galaxy_S10_und_S20_Ultra_5G.jpg',
    commonsTitle: 'File:Größenvergleich Samsung Galaxy S10 und S20 Ultra 5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi',
    sourceType: 'wikimedia-search'
  },
  'galaxy-s10-plus': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/51/SAMSUNG_Galaxy_S21_Plus_Rear_Side.jpg',
    commonsTitle: 'File:SAMSUNG Galaxy S21 Plus Rear Side.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi',
    sourceType: 'wikimedia-search'
  },
  'galaxy-a13': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/83/Close_angled_view_of_a_Samsung_Galaxy_A12%27s_Camera.png',
    commonsTitle: "File:Close angled view of a Samsung Galaxy A12's Camera.png",
    license: 'CC BY-SA 4.0',
    author: 'Juan Pablo Olano',
    sourceType: 'wikimedia-category'
  },
  'galaxy-a24': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Back_of_the_Samsung_Galaxy_A23.jpg',
    commonsTitle: 'File:Back of the Samsung Galaxy A23.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia-category'
  },
  'galaxy-m54': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5d/Samsung_Galaxy_A73_5G_%2809-11-2022%29.jpg',
    commonsTitle: 'File:Samsung Galaxy A73 5G (09-11-2022).jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi',
    sourceType: 'openverse-search'
  },
  'redmi-11-prime': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Redmi_Note_11_Pro_back.jpg',
    commonsTitle: 'File:Redmi Note 11 Pro back.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia-web-curated'
  },
  'poco-f6': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/POCO_X4_Pro_5G_back.jpg',
    commonsTitle: 'File:POCO X4 Pro 5G back.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia-search'
  },
  'poco-x4-pro': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Maksdroider',
    sourceType: 'wikimedia-search'
  },
  'poco-m4-pro': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/POCO_X4_Pro_5G_back.jpg',
    commonsTitle: 'File:POCO X4 Pro 5G back.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    sourceType: 'wikimedia'
  }
};

const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = raw.entries ?? raw;
let patched = 0;

for (const [modelKey, patch] of Object.entries(PATCHES)) {
  if (!entries[modelKey]) continue;
  entries[modelKey] = { ...entries[modelKey], ...patch };
  patched += 1;
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
console.log(`Patched ${patched} broken catalog URLs.`);
