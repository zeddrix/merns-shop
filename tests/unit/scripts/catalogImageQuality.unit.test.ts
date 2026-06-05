import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const MIN_IMAGE_BYTES = 3000;
const CATALOG_CANVAS_WIDTH = 1200;
const CATALOG_CANVAS_HEIGHT = 900;
const CATALOG_CANVAS_BG = { r: 248, g: 249, b: 250 };

async function validateCatalogImageFile(
  filePath: string
): Promise<{ ok: boolean; reason?: string }> {
  const stat = fs.statSync(filePath);
  if (stat.size < MIN_IMAGE_BYTES) {
    return { ok: false, reason: `file too small (${stat.size} bytes)` };
  }
  const meta = await sharp(filePath).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width !== CATALOG_CANVAS_WIDTH || height !== CATALOG_CANVAS_HEIGHT) {
    return {
      ok: false,
      reason: `expected ${CATALOG_CANVAS_WIDTH}x${CATALOG_CANVAS_HEIGHT}, got ${width}x${height}`
    };
  }
  return { ok: true };
}

async function normalizeToCatalogCanvas(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(CATALOG_CANVAS_WIDTH, CATALOG_CANVAS_HEIGHT, {
      fit: 'contain',
      background: CATALOG_CANVAS_BG
    })
    .flatten({ background: CATALOG_CANVAS_BG })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

describe('catalog image quality', () => {
  it('rejects tiny placeholder files', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-img-'));
    const filePath = path.join(dir, 'tiny.webp');
    const tiny = await sharp({
      create: { width: 1, height: 1, channels: 3, background: { r: 128, g: 128, b: 128 } }
    })
      .webp()
      .toBuffer();
    fs.writeFileSync(filePath, tiny);

    const result = await validateCatalogImageFile(filePath);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/small|expected/i);
    fs.rmSync(dir, { recursive: true });
  });

  it('normalizeToCatalogCanvas outputs fixed 1200x900 webp', async () => {
    const portrait = await sharp({
      create: { width: 400, height: 900, channels: 3, background: { r: 10, g: 20, b: 30 } }
    })
      .png()
      .toBuffer();
    const output = await normalizeToCatalogCanvas(portrait);
    const meta = await sharp(output).metadata();
    expect(meta.width).toBe(CATALOG_CANVAS_WIDTH);
    expect(meta.height).toBe(CATALOG_CANVAS_HEIGHT);
    expect(meta.format).toBe('webp');
  });

  it('accepts normalized canvas webp at 1200x900', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-img-'));
    const filePath = path.join(dir, 'ok.webp');
    const pixels = Buffer.alloc(800 * 600 * 3);
    for (let i = 0; i < pixels.length; i += 1) {
      pixels[i] = (i * 17) % 256;
    }
    const source = await sharp(pixels, {
      raw: { width: 800, height: 600, channels: 3 }
    })
      .png()
      .toBuffer();
    const ok = await normalizeToCatalogCanvas(source);
    fs.writeFileSync(filePath, ok);

    const result = await validateCatalogImageFile(filePath);
    expect(result.ok).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});
