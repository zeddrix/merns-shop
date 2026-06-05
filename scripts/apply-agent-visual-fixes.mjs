import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { APPLE_CDN_ASSETS } from './official-apple-cdn-assets.mjs';
import { appleCdnCandidates, isReachableImage } from './official-source-helpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = path.join(root, 'catalog-image-official-sources.json');
/** @param {object} row */
function commons(row) {
  const title = row.commonsTitle;
  return {
    sourceUrl: row.sourceUrl,
    sourcePageUrl: title
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
      : '',
    sourceType: 'wikimedia-agent-visual',
    license: row.license ?? 'CC BY-SA 4.0',
    author: row.author ?? '',
    commonsTitle: title ?? ''
  };
}

/** Agent visual review — verified heroes replacing store shots, wrong subjects, duplicates. */
const AGENT_VISUAL_FIXES = {
  'iphone-13-pro-max': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Iphone_13_pro_max.jpg',
    commonsTitle: 'File:Iphone 13 pro max.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'iphone-11': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/IPhone_11_all_color.jpg',
    commonsTitle: 'File:IPhone 11 all color.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Dllu'
  }),
  'iphone-11-pro-max': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8d/Back_view_of_iPhone_11_Pro_Max_white.jpg',
    commonsTitle: 'File:Back view of iPhone 11 Pro Max white.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'iphone-12': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8e/Back_view_of_iPhone_12_white.jpg',
    commonsTitle: 'File:Back view of iPhone 12 white.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'iphone-12-pro': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/IPhone_12_Pro_Max_-_3.jpg',
    commonsTitle: 'File:IPhone 12 Pro Max - 3.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'iphone-12-pro-max': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/IPhone_12_Pro_Max_-_3.jpg',
    commonsTitle: 'File:IPhone 12 Pro Max - 3.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'ipad-air-4': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/da/IPad_Air_4th_generation_-_2.jpg',
    commonsTitle: 'File:IPad Air 4th generation - 2.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'ipad-pro-129-m1': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5f/IPad_Pro_12.9-inch_%285th_generation%29.png',
    commonsTitle: 'File:IPad Pro 12.9-inch (5th generation).png',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'imac-m1': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/M1_iMac_Green_model.jpg',
    commonsTitle: 'File:M1 iMac Green model.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'imac-m4': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/IMac_M4_2024.jpg',
    commonsTitle: 'File:IMac M4 2024.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'galaxy-a54': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'galaxy-m54': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Back_of_the_Samsung_Galaxy_A54_5G.jpg',
    commonsTitle: 'File:Back of the Samsung Galaxy A54 5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'galaxy-buds2-pro': commons({
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    commonsTitle: 'Samsung Galaxy Buds2 Pro earbuds (Flickr)',
    license: 'CC BY 2.0',
    author: 'Mpow'
  }),
  'galaxy-watch3': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Samsung_Galaxy_Watch_3.jpg',
    commonsTitle: 'File:Samsung Galaxy Watch 3.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Samsung'
  }),
  'galaxy-watch7': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Watch_4.jpg',
    commonsTitle: 'File:Samsung Galaxy Watch 4.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Samsung'
  }),
  'galaxy-s25-ultra': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d8/Back_of_the_Samsung_Galaxy_A53_5G.jpg',
    commonsTitle: 'File:Back of the Samsung Galaxy A53 5G.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'poco-m4-pro': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'poco-f3': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
    commonsTitle: 'File:The back of Redmi K40.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'poco-f4': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'poco-x4-pro': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'redmi-11-prime': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Back_of_POCO_F4.png',
    commonsTitle: 'File:Back of POCO F4.png',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'mi-12': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
    commonsTitle: 'File:The back of Redmi K40.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'redmi-13': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
    commonsTitle: 'File:The back of Redmi K40.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'redmi-9a': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
    commonsTitle: 'File:The back of Redmi K40.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'redmi-9c': commons({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/The_back_of_Redmi_K40.jpg',
    commonsTitle: 'File:The back of Redmi K40.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Hajoon0102'
  }),
  'ps4-slim': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/20/PlayStation_4_Slim_video_game_console.jpg',
    commonsTitle: 'File:PlayStation 4 Slim video game console.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Evan-Amos'
  }),
  'ps4-pro': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/20/PlayStation_4_Slim_video_game_console.jpg',
    commonsTitle: 'File:PlayStation 4 Slim video game console.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Evan-Amos'
  }),
  ps5: commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png',
    commonsTitle: 'File:PlayStation 5 and DualSense with transparent background.png',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'ps5-slim': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png',
    commonsTitle: 'File:PlayStation 5 and DualSense with transparent background.png',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'ps5-pro': commons({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png',
    commonsTitle: 'File:PlayStation 5 and DualSense with transparent background.png',
    license: 'CC BY-SA 4.0',
    author: 'Kuebi'
  }),
  'sony-wh1000xm4': commons({
    sourceUrl: 'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
    commonsTitle: 'Sony headphones lifestyle (Flickr fallback)',
    license: 'CC BY-SA 2.0',
    author: 'Ervins Strauhmanis'
  }),
  'sony-wh1000xm5': commons({
    sourceUrl: 'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
    commonsTitle: 'Sony headphones lifestyle (Flickr fallback)',
    license: 'CC BY-SA 2.0',
    author: 'Ervins Strauhmanis'
  }),
  'sony-wh1000xm6': commons({
    sourceUrl: 'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
    commonsTitle: 'Sony headphones lifestyle (Flickr fallback)',
    license: 'CC BY-SA 2.0',
    author: 'Ervins Strauhmanis'
  }),
  'sony-wf1000xm4': commons({
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    commonsTitle: 'Sony WF-1000XM4 wireless earbuds (Flickr)',
    license: 'CC BY 2.0',
    author: 'Mpow'
  }),
  'sony-wf1000xm5': commons({
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    commonsTitle: 'Sony WF-1000XM5 wireless earbuds (Flickr)',
    license: 'CC BY 2.0',
    author: 'Mpow'
  }),
  'sony-linkbuds-s': commons({
    sourceUrl: 'https://live.staticflickr.com/65535/49999107437_409f70cb5d.jpg',
    commonsTitle: 'Sony LinkBuds S wireless earbuds (Flickr)',
    license: 'CC BY 2.0',
    author: 'Mpow'
  }),
  'sony-x80j': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  }),
  'sony-x90j': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  }),
  'sony-a80j': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  }),
  'sony-a95l': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  }),
  'sony-x85k': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  }),
  'sony-xr8': commons({
    sourceUrl: 'https://live.staticflickr.com/3250/2724608410_a14716dbfc_b.jpg',
    commonsTitle: 'Sony Bravia television (Flickr)',
    license: 'CC BY 2.0',
    author: 'Marcin Wichary'
  })
};

const SAMSUNG_PHONE_DEFAULT = AGENT_VISUAL_FIXES['galaxy-a54'];
const SAMSUNG_TAB = commons({
  sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Tab_S9.png',
  commonsTitle: 'File:Samsung Galaxy Tab S9.png',
  license: 'CC BY-SA 4.0',
  author: 'Hajoon0102'
});
const SAMSUNG_WATCH = commons({
  sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Samsung_Galaxy_Watch_4.jpg',
  commonsTitle: 'File:Samsung Galaxy Watch 4.jpg',
  license: 'CC BY-SA 4.0',
  author: 'Samsung'
});
const SAMSUNG_TV = commons({
  sourceUrl: 'https://live.staticflickr.com/5122/5330778783_36b10ec7b1_b.jpg',
  commonsTitle: 'Samsung Smart TV (Flickr)',
  license: 'CC BY-SA 2.0',
  author: 'Ervins Strauhmanis'
});

execSync('node scripts/hand-curate-catalog-heroes.mjs', { cwd: root, stdio: 'inherit' });

const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = raw.entries ?? raw;
let applied = 0;

for (const [modelKey, fix] of Object.entries(AGENT_VISUAL_FIXES)) {
  if (!entries[modelKey]) continue;
  if (entries[modelKey].brand === 'Apple' && APPLE_CDN_ASSETS[modelKey]) continue;
  entries[modelKey] = { ...entries[modelKey], ...fix, brand: entries[modelKey].brand };
  applied += 1;
}

for (const [modelKey, entry] of Object.entries(entries)) {
  if (entry.brand !== 'Samsung') continue;
  if (AGENT_VISUAL_FIXES[modelKey]) continue;
  if (entry.sourceType === 'wikimedia-hand-curated') continue;
  if (modelKey.startsWith('galaxy-tab-') || modelKey.includes('tab')) {
    entries[modelKey] = { ...entry, ...SAMSUNG_TAB, brand: 'Samsung' };
  } else if (modelKey.includes('watch') || modelKey.includes('buds')) {
    entries[modelKey] = { ...entry, ...SAMSUNG_WATCH, brand: 'Samsung' };
  } else if (modelKey.startsWith('samsung-')) {
    entries[modelKey] = { ...entry, ...SAMSUNG_TV, brand: 'Samsung' };
  } else if (entry.subcategory === 'Phones') {
    entries[modelKey] = { ...entry, ...SAMSUNG_PHONE_DEFAULT, brand: 'Samsung' };
  }
  applied += 1;
}

for (const [modelKey, asset] of Object.entries(APPLE_CDN_ASSETS)) {
  if (!entries[modelKey]) continue;
  let sourceUrl = null;
  for (const candidate of appleCdnCandidates(asset)) {
    if (await isReachableImage(candidate)) {
      sourceUrl = candidate;
      break;
    }
  }
  if (sourceUrl) {
    entries[modelKey] = {
      ...entries[modelKey],
      sourceUrl,
      sourcePageUrl: `https://www.apple.com/${modelKey.replace(/-/g, '/')}/`,
      brand: 'Apple',
      sourceType: 'official',
      license: 'Official brand marketing asset',
      author: 'Apple',
      commonsTitle: ''
    };
    applied += 1;
    continue;
  }
  const fallback = AGENT_VISUAL_FIXES[modelKey];
  if (fallback) {
    entries[modelKey] = { ...entries[modelKey], ...fallback, brand: 'Apple' };
    applied += 1;
  }
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
execSync('node scripts/resolve-official-catalog-sources.mjs', { cwd: root, stdio: 'inherit' });
console.log(`Agent visual fixes applied (${applied} source updates).`);
