import { describe, expect, it } from 'vitest';
import {
  auditManifestEntry,
  pickRelevantCommonsCandidate,
  scoreManifestEntryRelevance
} from '../../../scripts/catalog-image-relevance.mjs';

describe('catalog image relevance', () => {
  it('flags vivo-t2 soup commons title', () => {
    const entry = {
      modelKey: 'vivo-t2',
      name: 'vivo T2',
      brand: 'Vivo',
      subcategory: 'Phones',
      sourceUrl:
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/%E0%A6%AB%E0%A7%81%E0%A6%B2%E0%A6%95%E0%A6%AA%E0%A6%BF%E0%A6%B0_%E0%A6%B8%E0%A7%8D%E0%A6%AF%E0%A7%81%E0%A6%AA.jpg',
      commonsTitle: 'File:ফুলকপির স্যুপ -চুচুরা হুগলি.jpg'
    };
    const result = scoreManifestEntryRelevance(entry);
    expect(result.ok).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('flags poco-x4-pro tractor commons title', () => {
    const entry = {
      modelKey: 'poco-x4-pro',
      name: 'POCO X4 Pro',
      brand: 'Xiaomi',
      subcategory: 'Phones',
      sourceUrl:
        'https://upload.wikimedia.org/wikipedia/commons/2/2d/Renault_460s_Baujahr_1979.jpg',
      commonsTitle: 'File:Renault 460s Baujahr 1979.jpg'
    };
    const result = scoreManifestEntryRelevance(entry);
    expect(result.ok).toBe(false);
  });

  it('flags redmi-9c wheat field commons title', () => {
    const entry = {
      modelKey: 'redmi-9c',
      name: 'Redmi 9C',
      brand: 'Xiaomi',
      subcategory: 'Phones',
      sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Campos_de_Fontihoyuelo.jpg',
      commonsTitle: 'File:Campos de Fontihoyuelo.jpg'
    };
    const result = scoreManifestEntryRelevance(entry);
    expect(result.ok).toBe(false);
  });

  it('flags polluted Samsung S26 shared official URL', () => {
    const entry = {
      modelKey: 'galaxy-m32',
      name: 'Galaxy M32',
      brand: 'Samsung',
      subcategory: 'Phones',
      sourceType: 'official',
      sourceUrl:
        'https://images.samsung.com/is/image/samsung/p6pim/us/s2602/gallery/us-galaxy-s26-ultra-s948-sm-s948uzvaxaa-550993934?$PD_GALLERY_PNG$',
      commonsTitle: ''
    };
    const result = scoreManifestEntryRelevance(entry);
    expect(result.ok).toBe(false);
  });

  it('passes plausible phone commons match', () => {
    const entry = {
      modelKey: 'poco-m4-pro',
      name: 'POCO M4 Pro',
      brand: 'Xiaomi',
      subcategory: 'Phones',
      sourceUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d2/HK_MK_Mongkok_Nathan_Road_XiaoMi_Store_smart_phone_Poco_M4_Pro_5G_testing_macro_standard_n_wide_lens_effects_December_2021_RedMi_02.jpg',
      commonsTitle:
        'File:HK MK Mongkok Nathan Road XiaoMi Store smart phone Poco M4 Pro 5G testing macro standard n wide lens effects December 2021 RedMi 02.jpg'
    };
    const result = scoreManifestEntryRelevance(entry);
    expect(result.ok).toBe(true);
  });

  it('pickRelevantCommonsCandidate rejects tractor and prefers phone', () => {
    const product = {
      modelKey: 'poco-x4-pro',
      name: 'POCO X4 Pro',
      brand: 'Xiaomi'
    };
    const candidates = [
      {
        title: 'File:Renault 460s Baujahr 1979.jpg',
        url: 'https://example.com/tractor.jpg',
        width: 1200,
        height: 900
      },
      {
        title: 'File:POCO X4 Pro smartphone.jpg',
        url: 'https://example.com/phone.jpg',
        width: 1200,
        height: 900
      }
    ];
    const picked = pickRelevantCommonsCandidate(candidates, product) as {
      title?: string;
    } | null;
    expect(picked?.title).toContain('POCO X4 Pro');
  });

  it('auditManifestEntry flags duplicate phone URLs', () => {
    const sharedUrl =
      'https://upload.wikimedia.org/wikipedia/commons/e/ed/Samsung_S24_Ultra_Phone.png';
    const entries = [
      {
        modelKey: 'galaxy-s23',
        name: 'Galaxy S23',
        brand: 'Samsung',
        subcategory: 'Phones',
        sourceUrl: sharedUrl,
        commonsTitle: 'File:Samsung S24 Ultra Phone.png'
      },
      {
        modelKey: 'galaxy-s23-ultra',
        name: 'Galaxy S23 Ultra',
        brand: 'Samsung',
        subcategory: 'Phones',
        sourceUrl: sharedUrl,
        commonsTitle: 'File:Samsung S24 Ultra Phone.png'
      }
    ];
    const result = auditManifestEntry(entries[0], entries, new Set());
    expect(result.ok).toBe(false);
    expect(result.reasons.some((reason) => reason.startsWith('duplicate'))).toBe(true);
  });
});
