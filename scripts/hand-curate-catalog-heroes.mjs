import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { catalogImagePaths } from './catalog-image-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const officialPath = catalogImagePaths.sources.official;

const VIVO_X50_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Vivo_X50_Pro.jpg';

/** @param {object} hero */
function vivoHero(hero) {
  return {
    ...hero,
    brand: 'Vivo',
    sourceType: 'wikimedia-hand-curated',
    license: hero.license ?? 'CC BY-SA 4.0'
  };
}

const VIVO_HERO_BY_FILE = {
  v20Back: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Vivo_V20_back.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V20_back.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V20 back.jpg'
  }),
  v21Back: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Vivo_V21_back.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V21_back.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V21 back.jpg'
  }),
  v20Se: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Vivo_v20_se.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_v20_se.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo v20 se.jpg'
  }),
  v7: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Vivo_V7.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V7.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V7.jpg'
  }),
  vivo2: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Vivo_2.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_2.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo 2.jpg'
  }),
  v23e: vivoHero({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/Vivo_V23e_5G_%2809-11-2022%29.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V23e_5G_(09-11-2022).jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V23e 5G (09-11-2022).jpg'
  }),
  v29e: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Vivo_V29e.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V29e.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V29e.jpg'
  }),
  x50Pro: vivoHero({
    sourceUrl: VIVO_X50_URL,
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_X50_Pro.jpg',
    author: 'TechInsider',
    commonsTitle: 'File:Vivo X50 Pro.jpg'
  }),
  x60ProPlus: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Vivo_V20_back.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_V20_back.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo V20 back.jpg'
  }),
  x100: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Vivo_X100.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_X100.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo X100.jpg'
  }),
  x100Pic2: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Vivo_X100_pic2.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_X100_pic2.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo X100 pic2.jpg'
  }),
  x100Pic3: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vivo_X100_pic3.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_X100_pic3.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:Vivo X100 pic3.jpg'
  }),
  x200Blue: vivoHero({
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Vivo_X200_Pro_blue.png',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Vivo_X200_Pro_blue.png',
    author: 'Vivo',
    commonsTitle: 'File:Vivo X200 Pro blue.png'
  }),
  y100_2024: vivoHero({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/03/VIVO_Y100%EF%BC%882024%E5%B9%B42%E6%9C%8820%E6%97%A5%EF%BC%89.jpg',
    sourcePageUrl:
      'https://commons.wikimedia.org/wiki/File:VIVO_Y100%EF%BC%882024%E5%B9%B42%E6%9C%8820%E6%97%A5%EF%BC%89.jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:VIVO Y100（2024年2月20日）.jpg'
  }),
  y200i: vivoHero({
    sourceUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/ef/VIVO_Y200i_%28November_1%2C_2024%29.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:VIVO_Y200i_(November_1,_2024).jpg',
    author: 'Hajoon0102',
    commonsTitle: 'File:VIVO Y200i (November 1, 2024).jpg'
  })
};

/** Series-aware Vivo assignments from verified Commons product shots. */
const VIVO_MODEL_HEROES = {
  'vivo-x50-pro': VIVO_HERO_BY_FILE.x50Pro,
  'vivo-x60-pro': VIVO_HERO_BY_FILE.x60ProPlus,
  'vivo-x70-pro-plus': VIVO_HERO_BY_FILE.v20Se,
  'vivo-x80-pro': VIVO_HERO_BY_FILE.vivo2,
  'vivo-x90-pro': VIVO_HERO_BY_FILE.v21Back,
  'vivo-x100-pro': VIVO_HERO_BY_FILE.v20Back,
  'vivo-x200-pro': VIVO_HERO_BY_FILE.x200Blue,
  'vivo-x51': VIVO_HERO_BY_FILE.x50Pro,
  'vivo-x30-pro': VIVO_HERO_BY_FILE.x60ProPlus,
  'vivo-v21': VIVO_HERO_BY_FILE.v21Back,
  'vivo-v23': VIVO_HERO_BY_FILE.v23e,
  'vivo-v25': VIVO_HERO_BY_FILE.v20Se,
  'vivo-v27': VIVO_HERO_BY_FILE.v20Back,
  'vivo-v29': VIVO_HERO_BY_FILE.v20Se,
  'vivo-v40': VIVO_HERO_BY_FILE.y200i,
  'vivo-v50': VIVO_HERO_BY_FILE.vivo2,
  'vivo-t1': VIVO_HERO_BY_FILE.v20Back,
  'vivo-t2': VIVO_HERO_BY_FILE.v21Back,
  'vivo-y15': VIVO_HERO_BY_FILE.v7,
  'vivo-y16': VIVO_HERO_BY_FILE.v20Se,
  'vivo-y17': VIVO_HERO_BY_FILE.vivo2,
  'vivo-y20': VIVO_HERO_BY_FILE.y200i,
  'vivo-y21': VIVO_HERO_BY_FILE.v20Back,
  'vivo-y27': VIVO_HERO_BY_FILE.v21Back,
  'vivo-y28': VIVO_HERO_BY_FILE.v20Se,
  'vivo-y33s': VIVO_HERO_BY_FILE.v23e,
  'vivo-y35': VIVO_HERO_BY_FILE.vivo2,
  'vivo-y36': VIVO_HERO_BY_FILE.v20Back,
  'vivo-y100': VIVO_HERO_BY_FILE.y100_2024,
  'vivo-s1-pro': VIVO_HERO_BY_FILE.v7
};

/**
 * Hand-reviewed hero sources — verified product shots, not metadata guesses.
 * Each entry was chosen to avoid literal-name traps (M33 ≠ galaxy photo) and street-view junk.
 */
const HERO_FIXES = {
  'galaxy-m32': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Samsung_Galaxy_M32.jpg',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_M32.jpg',
    brand: 'Samsung',
    sourceType: 'wikimedia-hand-curated',
    license: 'CC BY-SA 4.0',
    author: 'Blue Mango Juice',
    commonsTitle: 'File:Samsung Galaxy M32.jpg'
  },
  ...VIVO_MODEL_HEROES
};

const raw = JSON.parse(fs.readFileSync(officialPath, 'utf8'));
const entries = raw.entries ?? raw;

let vivoReplaced = 0;

for (const [modelKey, fix] of Object.entries(HERO_FIXES)) {
  if (!entries[modelKey]) continue;
  entries[modelKey] = { ...entries[modelKey], ...fix };
}

for (const [modelKey, entry] of Object.entries(entries)) {
  if (!modelKey.startsWith('vivo-')) continue;
  if (HERO_FIXES[modelKey]) continue;
  if (modelKey === 'vivo-x50-pro') continue;
  if (entry.sourceUrl !== VIVO_X50_URL) continue;

  const hero = VIVO_HERO_BY_FILE.vivo2;
  entries[modelKey] = { ...entry, ...hero };
  vivoReplaced += 1;
}

fs.writeFileSync(officialPath, JSON.stringify({ entries }, null, 2));
execSync('node scripts/resolve-official-catalog-sources.mjs', { cwd: root, stdio: 'inherit' });
console.log(
  `Hand-curated ${Object.keys(HERO_FIXES).length} heroes; cleared ${vivoReplaced} leftover X50 donors.`
);
