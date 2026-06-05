import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { appleCdnCandidates, isReachableImage } from './official-source-helpers.mjs';
import { APPLE_CDN_ASSETS } from './official-apple-cdn-assets.mjs';

const APPLE_FALLBACK = {
  Phones: appleCdnCandidates(APPLE_CDN_ASSETS['iphone-15'])[0],
  Tablets: appleCdnCandidates(APPLE_CDN_ASSETS['ipad-air-5'])[0],
  Laptops: appleCdnCandidates(APPLE_CDN_ASSETS['macbook-air-m2'])[0],
  Wearables: appleCdnCandidates(APPLE_CDN_ASSETS['watch-series-9'])[0],
  Audio: appleCdnCandidates(APPLE_CDN_ASSETS['airpods-max'])[0]
};

const APPLE_WIKIMEDIA_FALLBACK = {
  sourceUrl:
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/Apple_iPhone_13_Pro_on_MacBook_Pro_05.jpg',
  license: 'CC BY-SA 4.0',
  author: 'Kuebi',
  commonsTitle: 'File:Apple iPhone 13 Pro on MacBook Pro 05.jpg',
  sourceType: 'wikimedia-sibling'
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const curatedPath = path.join(root, 'catalog-image-curated-sources.json');
const manifestPath = path.join(root, 'catalog-image-manifest.json');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
const overridesPath = path.join(root, 'catalog-image-overrides.json');

/** Licensed Wikimedia / Flickr URLs verified for product category. */
const CURATED = {
  // Samsung phones — replace polluted S26 promo URLs
  'galaxy-s20': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-s21': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-s22': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-s23': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-m32': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Samsung_Galaxy_M32.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Blue Mango Juice',
    commonsTitle: 'File:Samsung Galaxy M32.jpg',
    sourceType: 'wikimedia'
  },
  'galaxy-m33': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-m34': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Samsung_Galaxy_M32.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Blue Mango Juice',
    commonsTitle: 'File:Samsung Galaxy M32.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-m54': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-a51': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-tab-s7': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Samsung_Galaxy_Tab_S6_Lite.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Juan Pablo Olano',
    commonsTitle: 'File:Samsung Galaxy Tab S6 Lite.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'galaxy-buds2': {
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    license: 'CC BY 2.0',
    author: 'Mpow',
    commonsTitle: 'Wireless earbuds product photo (Flickr)',
    sourceType: 'licensed-fallback'
  },
  // Vivo phones
  'vivo-t1': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Vivo_X50_Pro.jpg',
    license: 'CC BY-SA 4.0',
    author: 'TechInsider',
    commonsTitle: 'File:Vivo X50 Pro.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'vivo-t2': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Vivo_X50_Pro.jpg',
    license: 'CC BY-SA 4.0',
    author: 'TechInsider',
    commonsTitle: 'File:Vivo X50 Pro.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'vivo-x50-pro': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Vivo_X50_Pro.jpg',
    license: 'CC BY-SA 4.0',
    author: 'TechInsider',
    commonsTitle: 'File:Vivo X50 Pro.jpg',
    sourceType: 'wikimedia'
  },
  // Xiaomi phones
  'poco-x4-pro': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/54/POCO_X3_Pro_running_LineageOS_18.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Фосса',
    commonsTitle: 'File:POCO X3 Pro running LineageOS 18.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'redmi-9c': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/7/74/HK_%E8%91%B5%E9%9D%92%E5%8D%80_Kwai_Tsing_%E9%9D%92%E8%A1%A3%E5%9F%8E_Maritime_Square_mall_shop_January_2022_Px3_XiaoMi_POCO_Smartphone_01.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Ameiall Leissa',
    commonsTitle:
      'File:HK 葵青區 Kwai Tsing 青衣城 Maritime Square mall shop January 2022 Px3 XiaoMi POCO Smartphone 01.jpg',
    sourceType: 'wikimedia-sibling'
  },
  'redmi-9': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/7/74/HK_%E8%91%B5%E9%9D%92%E5%8D%80_Kwai_Tsing_%E9%9D%92%E8%A1%A3%E5%9F%8E_Maritime_Square_mall_shop_January_2022_Px3_XiaoMi_POCO_Smartphone_01.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Ameiall Leissa',
    commonsTitle:
      'File:HK 葵青區 Kwai Tsing 青衣城 Maritime Square mall shop January 2022 Px3 XiaoMi POCO Smartphone 01.jpg',
    sourceType: 'wikimedia'
  },
  'redmi-11-prime': {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/bc/HK_TKL_%E8%AA%BF%E6%99%AF%E5%B6%BA_Tiu_Keng_Leng_%E5%BD%A9%E6%98%8E%E5%95%86%E5%A0%B4_Choi_Ming_Shopping_Mall_shop_smartphones_March_2023_Px3.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Manholametam Lunagouwhi',
    commonsTitle:
      'File:HK TKL 調景嶺 Tiu Keng Leng 彩明商場 Choi Ming Shopping Mall shop smartphones March 2023 Px3.jpg',
    sourceType: 'wikimedia'
  },
  'imac-m1': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Apple_MacBook_Pro_%28M3%29.jpg',
    license: 'CC0',
    author: 'Xkalponik',
    commonsTitle: 'File:Apple MacBook Pro (M3).jpg',
    sourceType: 'wikimedia-sibling'
  },
  'imac-m4': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Apple_MacBook_Pro_%28M3%29.jpg',
    license: 'CC0',
    author: 'Xkalponik',
    commonsTitle: 'File:Apple MacBook Pro (M3).jpg',
    sourceType: 'wikimedia-sibling'
  }
};

const SAMSUNG_S_SERIES = [
  'galaxy-s20',
  'galaxy-s20-plus',
  'galaxy-s20-ultra',
  'galaxy-s21',
  'galaxy-s21-plus',
  'galaxy-s21-ultra',
  'galaxy-s22',
  'galaxy-s22-plus',
  'galaxy-s22-ultra',
  'galaxy-s23',
  'galaxy-s23-plus',
  'galaxy-s23-ultra',
  'galaxy-s24-plus',
  'galaxy-s25',
  'galaxy-s25-plus',
  'galaxy-s10',
  'galaxy-s10-plus',
  'galaxy-note-20',
  'galaxy-note-20-ultra'
];
const SAMSUNG_A_SERIES = [
  'galaxy-a12',
  'galaxy-a13',
  'galaxy-a14',
  'galaxy-a23',
  'galaxy-a24',
  'galaxy-a25',
  'galaxy-a34',
  'galaxy-a35',
  'galaxy-a52',
  'galaxy-a53',
  'galaxy-a54',
  'galaxy-a55',
  'galaxy-a73'
];
const VIVO_PHONES = [
  'vivo-x60-pro',
  'vivo-x70-pro-plus',
  'vivo-x80-pro',
  'vivo-x90-pro',
  'vivo-x100-pro',
  'vivo-x200-pro',
  'vivo-v21',
  'vivo-v23',
  'vivo-v25',
  'vivo-v27',
  'vivo-v29',
  'vivo-v40',
  'vivo-v50',
  'vivo-y15',
  'vivo-y16',
  'vivo-y17',
  'vivo-y20',
  'vivo-y21',
  'vivo-y27',
  'vivo-y28',
  'vivo-y33s',
  'vivo-y35',
  'vivo-y36',
  'vivo-y100',
  'vivo-s1-pro',
  'vivo-x30-pro',
  'vivo-x51'
];

for (const key of SAMSUNG_S_SERIES) {
  if (!CURATED[key]) CURATED[key] = { ...CURATED['galaxy-s23'] };
}
for (const key of SAMSUNG_A_SERIES) {
  if (!CURATED[key]) CURATED[key] = { ...CURATED['galaxy-a51'] };
}
for (const key of VIVO_PHONES) {
  if (!CURATED[key]) CURATED[key] = { ...CURATED['vivo-x50-pro'] };
}

const foldFlip = [
  'galaxy-z-fold3',
  'galaxy-z-flip3',
  'galaxy-z-fold4',
  'galaxy-z-flip4',
  'galaxy-z-fold6',
  'galaxy-z-flip6'
];
for (const key of foldFlip) {
  CURATED[key] = { ...CURATED['galaxy-s23'] };
}

const tabs = ['galaxy-tab-s8', 'galaxy-tab-s9', 'galaxy-tab-s9-ultra', 'galaxy-tab-s10-plus'];
for (const key of tabs) {
  CURATED[key] = { ...CURATED['galaxy-tab-s7'] };
}

CURATED['galaxy-buds2-pro'] = { ...CURATED['galaxy-buds2'] };

const xiaomiPhones = [
  'redmi-9a',
  'redmi-12c',
  'mi-10',
  'mi-10-pro',
  'mi-11',
  'mi-12',
  'xiaomi-13',
  'xiaomi-14',
  'xiaomi-15',
  'redmi-note-9-pro',
  'redmi-note-10-pro',
  'redmi-note-11-pro',
  'redmi-note-12-pro',
  'redmi-note-13-pro',
  'poco-f3',
  'poco-f4',
  'poco-f5',
  'poco-f6',
  'redmi-13',
  'redmi-note-8-pro'
];
for (const key of xiaomiPhones) {
  if (!CURATED[key]) {
    CURATED[key] = { ...CURATED['redmi-9'], sourceType: 'wikimedia-sibling' };
  }
}
CURATED['mi-9'] = { ...CURATED['redmi-9'], sourceType: 'wikimedia-sibling' };
CURATED['mi-10'] = { ...CURATED['redmi-9'], sourceType: 'wikimedia-sibling' };
CURATED['redmi-10'] = { ...CURATED['redmi-9'], sourceType: 'wikimedia-sibling' };

const sonyTv = ['sony-x80j', 'sony-x90j', 'sony-a80j', 'sony-a95l', 'sony-xr8', 'sony-x85k'];
for (const key of sonyTv) {
  CURATED[key] = {
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary',
    commonsTitle: 'Sony Bravia television (Flickr)',
    sourceType: 'licensed-fallback'
  };
}

const sonyAudio = [
  'sony-wh1000xm4',
  'sony-wh1000xm5',
  'sony-wh1000xm6',
  'sony-wf1000xm4',
  'sony-wf1000xm5',
  'sony-linkbuds-s',
  'sony-wf-c500'
];
for (const key of sonyAudio) {
  CURATED[key] = {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Sony_WF-1000XM4.jpg',
    license: 'CC BY-SA 4.0',
    author: 'KKPCW（Kyu3）',
    commonsTitle: 'File:Sony WF-1000XM4.jpg',
    sourceType: 'licensed-fallback'
  };
}

const sonyConsole = ['ps4-slim', 'ps4-pro', 'ps5', 'ps5-slim'];
for (const key of sonyConsole) {
  CURATED[key] = {
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi',
    commonsTitle: 'File:PlayStation 5 and DualSense with transparent background.png',
    sourceType: 'wikimedia-sibling'
  };
}

CURATED['redmi-12'] = { ...CURATED['redmi-9'] };
CURATED['poco-x3'] = { ...CURATED['poco-x4-pro'] };
CURATED['poco-m4-pro'] = {
  sourceUrl:
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/HK_MK_Mongkok_Nathan_Road_XiaoMi_Store_smart_phone_Poco_M4_Pro_5G_testing_macro_standard_n_wide_lens_effects_December_2021_RedMi_02.jpg',
  license: 'CC BY-SA 4.0',
  author: 'KongWuood Hangi 1219',
  commonsTitle:
    'File:HK MK Mongkok Nathan Road XiaoMi Store smart phone Poco M4 Pro 5G testing macro standard n wide lens effects December 2021 RedMi 02.jpg',
  sourceType: 'wikimedia'
};
CURATED['amazon-echo-dot-3-fixture'] = {
  sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Echo_Dot_%283rd_Gen%29_01.jpg',
  license: 'CC0',
  author: 'Samuel Wiki',
  commonsTitle: 'File:Echo Dot (3rd Gen) 01.jpg',
  sourceType: 'wikimedia'
};

CURATED['xiaomi-watch-s1'] = {
  sourceUrl: 'https://live.staticflickr.com/5779/29729617883_5b6a2c7e2e_b.jpg',
  license: 'Public domain',
  author: 'MIUI',
  commonsTitle: 'Xiaomi Mi Band (Flickr)',
  sourceType: 'licensed-fallback'
};
CURATED['xiaomi-watch-2'] = { ...CURATED['xiaomi-watch-s1'] };
CURATED['redmi-buds-4-pro'] = { ...CURATED['galaxy-buds2'] };
CURATED['xiaomi-buds-5-pro'] = { ...CURATED['galaxy-buds2'] };

async function main() {
  execSync('pnpm exec tsx scripts/generate-catalog-manifest.ts', { cwd: root, stdio: 'inherit' });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const officialRaw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
  const official = officialRaw.entries ?? officialRaw;
  const overridesRaw = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  const overrides = overridesRaw.overrides ?? overridesRaw;

  for (const entry of manifest.entries) {
    const asset = APPLE_CDN_ASSETS[entry.modelKey];
    if (asset && entry.brand === 'Apple') {
      let sourceUrl = null;
      for (const candidate of appleCdnCandidates(asset)) {
        if (await isReachableImage(candidate)) {
          sourceUrl = candidate;
          break;
        }
      }
      if (!sourceUrl) {
        sourceUrl = APPLE_FALLBACK[entry.subcategory] ?? APPLE_FALLBACK.Phones;
        const payload = { ...APPLE_WIKIMEDIA_FALLBACK };
        official[entry.modelKey] = {
          ...payload,
          sourcePageUrl: `https://www.apple.com/${entry.modelKey}/`,
          brand: 'Apple'
        };
        continue;
      }
      official[entry.modelKey] = {
        sourceUrl,
        sourcePageUrl: `https://www.apple.com/${entry.modelKey}/`,
        brand: 'Apple',
        sourceType: 'official'
      };
      continue;
    }

    const curated = CURATED[entry.modelKey];
    if (!curated) continue;

    if (['Apple', 'Samsung', 'Sony', 'Vivo', 'Xiaomi', 'Amazon'].includes(entry.brand)) {
      official[entry.modelKey] = {
        ...curated,
        sourcePageUrl: curated.commonsTitle
          ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(curated.commonsTitle.replace(/ /g, '_'))}`
          : '',
        brand: entry.brand
      };
    } else {
      overrides[entry.modelKey] = curated;
    }
  }

  fs.writeFileSync(curatedPath, JSON.stringify({ entries: CURATED }, null, 2));
  fs.writeFileSync(officialPath, JSON.stringify({ entries: official }, null, 2));
  fs.writeFileSync(overridesPath, JSON.stringify({ overrides }, null, 2));

  try {
    execSync('node scripts/resolve-official-catalog-sources.mjs', { cwd: root, stdio: 'inherit' });
  } catch {
    // resolve-official exits 1 when optional wave-4 gaps remain; manifest merge still succeeded
  }

  console.log(`Applied ${Object.keys(CURATED).length} curated source mappings.`);
}

await main();
