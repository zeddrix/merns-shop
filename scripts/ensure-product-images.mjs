import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  MIN_IMAGE_BYTES,
  MIN_IMAGE_DIMENSION,
  validateCatalogImageFile
} from './catalog-image-quality.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../frontend/public/images');
const catalogDir = path.join(imagesDir, 'catalog');

const legacyFiles = [
  { name: 'airpods.jpg', catalogHint: 'apple/airpods-pro-2.webp', color: '#888888' },
  { name: 'phone.jpg', catalogHint: 'apple/iphone-15-pro.webp', color: '#666666' },
  { name: 'camera.jpg', catalogHint: 'sony/ps5.webp', color: '#444444' },
  { name: 'playstation.jpg', catalogHint: 'sony/ps5.webp', color: '#003087' },
  { name: 'mouse.jpg', catalogHint: 'apple/macbook-air-m2.webp', color: '#555555' },
  { name: 'alexa.jpg', catalogHint: 'amazon/echo-dot-3.webp', color: '#333333' },
  { name: 'sample.jpg', catalogHint: 'apple/iphone-15-pro.webp', color: '#777777' }
];

const writeFromCatalog = async (catalogRelative, targetPath) => {
  const source = path.join(catalogDir, catalogRelative);
  if (fs.existsSync(source)) {
    const jpeg = await sharp(source).jpeg({ quality: 85 }).toBuffer();
    fs.writeFileSync(targetPath, jpeg);
    return true;
  }
  return false;
};

const writeSolid = async (color, targetPath) => {
  const jpeg = await sharp({
    create: {
      width: MIN_IMAGE_DIMENSION,
      height: MIN_IMAGE_DIMENSION,
      channels: 3,
      background: color
    }
  })
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(targetPath, jpeg);
};

fs.mkdirSync(imagesDir, { recursive: true });

let written = 0;

for (const file of legacyFiles) {
  const filePath = path.join(imagesDir, file.name);
  let valid = false;
  if (fs.existsSync(filePath)) {
    try {
      const check = await validateCatalogImageFile(filePath);
      valid = check.ok;
    } catch {
      valid = false;
    }
  }
  if (valid) continue;

  const fromCatalog = await writeFromCatalog(file.catalogHint, filePath);
  if (!fromCatalog) {
    await writeSolid(file.color, filePath);
  }
  written += 1;
}

console.log(`Legacy product images ready (${written} written, min ${MIN_IMAGE_BYTES} bytes).`);
