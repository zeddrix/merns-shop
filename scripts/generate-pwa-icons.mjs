import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'frontend/public/icons');
const publicDir = path.join(root, 'frontend/public');

const DISPLAY_BRAND_NAME = "MERN's Shop";
const DEVELOPER_NAME = 'Zeddrix Fabian';

const background = '#212529';
const foreground = '#ffffff';
const subtitleColor = '#adb5bd';

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createMonogramSvg(size, maskable) {
  const inset = maskable ? Math.round(size * 0.2) : Math.round(size * 0.12);
  const inner = size - inset * 2;
  const fontSize = Math.round(inner * 0.34);
  const radius = maskable ? 0 : Math.round(size * 0.12);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${background}" rx="${radius}"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="700" fill="${foreground}">MS</text>
    </svg>`;
}

function createBrandedSvg(size, maskable) {
  const inset = maskable ? Math.round(size * 0.2) : Math.round(size * 0.1);
  const inner = size - inset * 2;
  const radius = maskable ? 0 : Math.round(size * 0.12);
  const titleSize = Math.max(Math.round(inner * 0.13), 10);
  const subtitleSize = Math.max(Math.round(inner * 0.075), 7);
  const lineGap = Math.round(subtitleSize * 1.35);
  const brand = escapeXml(DISPLAY_BRAND_NAME);
  const developer = escapeXml(`by ${DEVELOPER_NAME}`);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${background}" rx="${radius}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" fill="${foreground}">
        <tspan x="50%" dy="-${Math.round(lineGap * 0.35)}" font-size="${titleSize}" font-weight="700">${brand}</tspan>
        <tspan x="50%" dy="${lineGap}" font-size="${subtitleSize}" font-weight="500" fill="${subtitleColor}">${developer}</tspan>
      </text>
    </svg>`;
}

async function createIcon(size, maskable) {
  const svg = size <= 32 ? createMonogramSvg(size, maskable) : createBrandedSvg(size, maskable);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  fs.mkdirSync(iconsDir, { recursive: true });

  const icon192 = await createIcon(192, false);
  const icon512 = await createIcon(512, false);
  const icon512Maskable = await createIcon(512, true);
  const appleTouch = await createIcon(180, false);
  const favicon = await createIcon(32, false);

  await sharp(icon192).toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(icon512).toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(icon512Maskable).toFile(path.join(iconsDir, 'icon-512-maskable.png'));
  await sharp(appleTouch).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(favicon).toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Generated PWA icons in frontend/public/icons and favicon.ico');
}

void main();
