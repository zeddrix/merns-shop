import sharp from 'sharp';
import {
  CATALOG_CANVAS_BG,
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  CATALOG_PRODUCT_FILL,
  WEBP_QUALITY
} from './catalog-image-canvas.mjs';

export const MIN_IMAGE_BYTES = 3000;
export const MIN_IMAGE_DIMENSION = 200;

const TRIM_THRESHOLD = 14;

/**
 * Trim uniform borders, then scale the product to fill most of the hero frame.
 * @param {import('sharp').Sharp} pipeline
 */
async function trimProductBounds(pipeline) {
  try {
    const { data, info } = await pipeline
      .clone()
      .flatten({ background: CATALOG_CANVAS_BG })
      .trim({ threshold: TRIM_THRESHOLD })
      .toBuffer({ resolveWithObject: true });
    if (info.width >= 80 && info.height >= 80) {
      return sharp(data);
    }
  } catch {
    // Photos with gradients or busy edges may not trim cleanly.
  }
  return pipeline.clone().flatten({ background: CATALOG_CANVAS_BG });
}

/** @param {Buffer} buffer */
export async function normalizeToCatalogCanvas(buffer) {
  const rotated = sharp(buffer).rotate();
  const trimmed = await trimProductBounds(rotated);
  const meta = await trimmed.metadata();
  const width = meta.width ?? 1;
  const height = meta.height ?? 1;

  const fillScale = Math.min(
    (CATALOG_CANVAS_WIDTH * CATALOG_PRODUCT_FILL) / width,
    (CATALOG_CANVAS_HEIGHT * CATALOG_PRODUCT_FILL) / height
  );
  const targetWidth = Math.max(1, Math.round(width * fillScale));
  const targetHeight = Math.max(1, Math.round(height * fillScale));

  const left = Math.floor((CATALOG_CANVAS_WIDTH - targetWidth) / 2);
  const top = Math.floor((CATALOG_CANVAS_HEIGHT - targetHeight) / 2);
  const resized = await trimmed
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: false
    })
    .toBuffer();

  return sharp({
    create: {
      width: CATALOG_CANVAS_WIDTH,
      height: CATALOG_CANVAS_HEIGHT,
      channels: 3,
      background: CATALOG_CANVAS_BG
    }
  })
    .composite([{ input: resized, left, top }])
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
