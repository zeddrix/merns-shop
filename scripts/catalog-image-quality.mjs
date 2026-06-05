import sharp from 'sharp';
import {
  CATALOG_CANVAS_BG,
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  WEBP_QUALITY
} from './catalog-image-canvas.mjs';

export const MIN_IMAGE_BYTES = 3000;
export const MIN_IMAGE_DIMENSION = 200;

/** @param {Buffer} buffer */
export async function normalizeToCatalogCanvas(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(CATALOG_CANVAS_WIDTH, CATALOG_CANVAS_HEIGHT, {
      fit: 'contain',
      background: CATALOG_CANVAS_BG
    })
    .flatten({ background: CATALOG_CANVAS_BG })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

/** @param {Buffer} buffer */
export async function toCatalogWebp(buffer) {
  return normalizeToCatalogCanvas(buffer);
}

/** @param {string} filePath */
export async function validateCatalogImageFile(filePath) {
  const fs = await import('node:fs');
  const stat = fs.statSync(filePath);
  if (stat.size < MIN_IMAGE_BYTES) {
    return { ok: false, reason: `file too small (${stat.size} bytes)` };
  }
  const meta = await sharp(filePath).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return { ok: false, reason: `dimensions ${width}x${height} below ${MIN_IMAGE_DIMENSION}px` };
  }
  if (width !== CATALOG_CANVAS_WIDTH || height !== CATALOG_CANVAS_HEIGHT) {
    return {
      ok: false,
      reason: `expected ${CATALOG_CANVAS_WIDTH}x${CATALOG_CANVAS_HEIGHT}, got ${width}x${height}`
    };
  }
  return { ok: true, width, height, size: stat.size };
}
