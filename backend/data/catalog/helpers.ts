import type { CatalogParentDraft, CatalogVariantDraft } from './types.js';

export const catalogImage = (brand: string, slug: string): string =>
  `/images/catalog/${brand.toLowerCase()}/${slug}.webp`;

export const storageVariants = (
  modelKey: string,
  tiers: Array<{ gb: number; listPrice: number }>,
  stock = 8
): CatalogVariantDraft[] =>
  tiers.map((t) => ({
    skuSuffix: `${t.gb}gb`,
    label: `${t.gb}GB`,
    storageGb: t.gb,
    listPrice: t.listPrice,
    countInStock: stock
  }));

export const screenVariants = (
  tiers: Array<{ inches: number; listPrice: number }>,
  stock = 6
): CatalogVariantDraft[] =>
  tiers.map((t) => ({
    skuSuffix: `${t.inches}in`,
    label: `${t.inches}"`,
    screenInches: t.inches,
    listPrice: t.listPrice,
    countInStock: stock
  }));

export const consoleStorageVariants = (
  tiers: Array<{ label: string; suffix: string; listPrice: number }>,
  stock = 10
): CatalogVariantDraft[] =>
  tiers.map((t) => ({
    skuSuffix: t.suffix,
    label: t.label,
    listPrice: t.listPrice,
    countInStock: stock
  }));

export const phoneParent = (opts: {
  name: string;
  modelKey: string;
  brand: string;
  releaseYear: number;
  description: string;
  image: string;
  storageTiers: Array<{ gb: number; listPrice: number }>;
  rating?: number;
  numReviews?: number;
}): CatalogParentDraft => ({
  ...opts,
  category: 'Electronics',
  subcategory: 'Phones',
  pricingCategory: 'Phones',
  variants: storageVariants(opts.modelKey, opts.storageTiers)
});

export const defaultReviews = (releaseYear: number): { rating: number; numReviews: number } => {
  const age = new Date().getFullYear() - releaseYear;
  return {
    rating: Math.min(5, 3.8 + age * 0.05),
    numReviews: Math.max(4, 20 - age * 2)
  };
};
