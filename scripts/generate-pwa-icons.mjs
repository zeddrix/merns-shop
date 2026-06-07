import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'frontend/public/icons');
const publicDir = path.join(root, 'frontend/public');

const background = '#212529';
const foreground = '#ffffff';

async function createIcon(size, maskable) {
  const inset = maskable ? Math.round(size * 0.2) : Math.round(size * 0.12);
  const inner = size - inset * 2;
  const fontSize = Math.round(inner * 0.34);

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${background}" rx="${maskable ? 0 : Math.round(size * 0.12)}"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="700" fill="${foreground}">MS</text>
    </svg>`;

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
