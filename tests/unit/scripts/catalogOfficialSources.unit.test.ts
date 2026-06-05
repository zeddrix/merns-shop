import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('catalog official sources', () => {
  it('official sources JSON uses entries map shape', () => {
    const filePath = path.join(process.cwd(), 'catalog-image-official-sources.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
      entries: Record<string, unknown>;
    };
    expect(raw.entries).toBeTypeOf('object');
  });

  it('iphone-15-pro uses Apple CDN sourceUrl', () => {
    const filePath = path.join(process.cwd(), 'catalog-image-official-sources.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
      entries: Record<string, { sourceUrl: string; brand: string }>;
    };
    const entry = raw.entries['iphone-15-pro'];
    expect(entry.brand).toBe('Apple');
    expect(entry.sourceUrl).toMatch(/store\.storeimages\.cdn-apple\.com/);
  });

  it('covers Apple Samsung and Sony catalog parents', () => {
    const filePath = path.join(process.cwd(), 'catalog-image-official-sources.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
      entries: Record<string, { brand: string }>;
    };
    const counts = { Apple: 0, Samsung: 0, Sony: 0, Vivo: 0, Xiaomi: 0, Amazon: 0 };
    for (const entry of Object.values(raw.entries)) {
      if (entry.brand in counts) {
        counts[entry.brand as keyof typeof counts] += 1;
      }
    }
    expect(counts.Apple).toBe(71);
    expect(counts.Samsung).toBe(65);
    expect(counts.Sony).toBe(12);
    expect(counts.Vivo).toBe(30);
    expect(counts.Xiaomi).toBe(33);
    expect(counts.Amazon).toBe(1);
    expect(Object.keys(raw.entries).length).toBe(212);
  });
});
