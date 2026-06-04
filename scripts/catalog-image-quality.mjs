import sharp from 'sharp';

export const MIN_IMAGE_BYTES = 8 * 1024;
export const MIN_IMAGE_DIMENSION = 200;
export const WEBP_MAX_WIDTH = 1200;
export const WEBP_QUALITY = 82;

/** @param {Buffer} buffer */
export async function toCatalogWebp(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: WEBP_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
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
  return { ok: true, width, height, size: stat.size };
}
