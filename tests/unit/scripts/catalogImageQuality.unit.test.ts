import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const MIN_IMAGE_BYTES = 8 * 1024;
const MIN_IMAGE_DIMENSION = 200;

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
  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return { ok: false, reason: `dimensions ${width}x${height} below ${MIN_IMAGE_DIMENSION}px` };
  }
  return { ok: true };
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
    expect(result.reason).toMatch(/small|dimension/i);
    fs.rmSync(dir, { recursive: true });
  });

  it('accepts decodable images above thresholds', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-img-'));
    const filePath = path.join(dir, 'ok.webp');
    const ok = await sharp({
      create: {
        width: MIN_IMAGE_DIMENSION,
        height: MIN_IMAGE_DIMENSION,
        channels: 3,
        background: { r: 40, g: 80, b: 120 }
      }
    })
      .webp({ quality: 90 })
      .toBuffer();
    expect(ok.length).toBeGreaterThanOrEqual(MIN_IMAGE_BYTES);
    fs.writeFileSync(filePath, ok);

    const result = await validateCatalogImageFile(filePath);
    expect(result.ok).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});
