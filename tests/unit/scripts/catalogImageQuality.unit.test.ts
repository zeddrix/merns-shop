import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {
  normalizeToCatalogCanvas,
  validateCatalogImageFile
} from '../../../scripts/catalog-image-quality.mjs';
import {
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  CATALOG_PRODUCT_FILL
} from '../../../scripts/catalog-image-canvas.mjs';

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

  it('scales trimmed product to fill most of the hero canvas', async () => {
    const inset = await sharp({
      create: { width: 200, height: 300, channels: 3, background: { r: 40, g: 80, b: 120 } }
    })
      .extend({
        top: 200,
        bottom: 200,
        left: 300,
        right: 300,
        background: { r: 248, g: 249, b: 250 }
      })
      .png()
      .toBuffer();
    const output = await normalizeToCatalogCanvas(inset);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    const bg = { r: 248, g: 249, b: 250 };
    let productPixels = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r !== bg.r || g !== bg.g || b !== bg.b) productPixels += 1;
    }
    const productRatio = productPixels / (info.width * info.height);
    expect(productRatio).toBeGreaterThan(CATALOG_PRODUCT_FILL * 0.35);
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
