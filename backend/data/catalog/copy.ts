import type { CatalogParentDraft } from './types.js';

const SUBCATEGORY_INTROS: Record<string, string> = {
  Phones:
    'This refurbished smartphone is fully tested, data-wiped, and graded Like New for reliable daily use.',
  Tablets:
    'This refurbished tablet is inspected for display quality, battery health, and connectivity before listing.',
  Laptops:
    'This refurbished laptop is benchmarked, stress-tested, and cleaned so you get dependable productivity performance.',
  TVs: 'This refurbished TV is checked for panel uniformity, HDMI ports, and smart platform functionality.',
  Consoles:
    'This refurbished console is tested for disc/read errors, cooling, and controller pairing stability.',
  Audio:
    'This refurbished audio product is verified for driver balance, pairing, and microphone clarity where applicable.',
  Wearables:
    'This refurbished wearable is checked for sensors, strap condition, and battery runtime in typical use.',
  'Smart Speakers':
    'This refurbished smart speaker is verified for wake-word response, Wi-Fi stability, and audio clarity.'
};

const variantSummary = (parent: CatalogParentDraft): string => {
  const labels = parent.variants.map((v) => v.label);
  const unique = [...new Set(labels)];
  if (unique.length <= 4) {
    return unique.join(', ');
  }
  return `${unique.slice(0, 3).join(', ')}, and more`;
};

export const enrichDescription = (parent: CatalogParentDraft): string => {
  const intro =
    SUBCATEGORY_INTROS[parent.subcategory] ??
    'This refurbished device is quality-checked and sold in Like New condition with transparent pricing.';
  const variantLine = `Available configurations include ${variantSummary(parent)}.`;
  const yearLine = `Originally released in ${parent.releaseYear}, this ${parent.brand} ${parent.name} remains a strong value in the ${parent.subcategory} category.`;
  const base = parent.description.trim();
  const closing =
    'Every unit ships from our catalog with verified photos, accurate variant SKUs, and tiered pricing based on current market demand.';

  return [intro, base, variantLine, yearLine, closing].filter(Boolean).join(' ');
};
