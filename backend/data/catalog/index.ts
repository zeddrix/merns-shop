import { applyTieredPrice } from './pricing.js';
import { defaultReviews } from './helpers.js';
import type { CatalogParentDraft, SeedProduct } from './types.js';

export type { SeedProduct, CatalogParentDraft, PricingCategory } from './types.js';
import { appleIphones } from './apple/iphone.js';
import { appleIpads } from './apple/ipad.js';
import { appleMacs } from './apple/mac.js';
import { appleAirpods } from './apple/airpods.js';
import { appleWatches } from './apple/watch.js';
import { samsungPhones } from './samsung/phones.js';
import { samsungTabs } from './samsung/galaxy-tab.js';
import { samsungWatches } from './samsung/watches.js';
import { samsungTvs } from './samsung/tvs.js';
import { vivoPhones } from './vivo/phones.js';
import { xiaomiPhones } from './xiaomi/phones.js';
import { xiaomiEcosystem } from './xiaomi/ecosystem.js';
import { sonyPlaystations } from './sony/playstation.js';
import { sonyTvs } from './sony/tvs.js';
import { sonyAudio } from './sony/audio.js';
import { fixtureOutOfStock } from './fixture.js';
import { catalogExtras } from './extras.js';

const allDrafts: CatalogParentDraft[] = [
  ...appleIphones,
  ...appleIpads,
  ...appleMacs,
  ...appleAirpods,
  ...appleWatches,
  ...samsungPhones,
  ...samsungTabs,
  ...samsungWatches,
  ...samsungTvs,
  ...vivoPhones,
  ...xiaomiPhones,
  ...xiaomiEcosystem,
  ...sonyPlaystations,
  ...sonyTvs,
  ...sonyAudio,
  ...catalogExtras,
  fixtureOutOfStock
];

const buildVariants = (parent: CatalogParentDraft) =>
  parent.variants.map((v) => {
    const sku = `${parent.modelKey}-${v.skuSuffix}`;
    const listPrice = v.listPrice;
    const price = applyTieredPrice(listPrice, parent.pricingCategory);
    return {
      sku,
      label: v.label,
      storageGb: v.storageGb,
      screenInches: v.screenInches,
      ramGb: v.ramGb,
      listPrice,
      price,
      countInStock:
        parent.modelKey === 'iphone-15-pro' && v.skuSuffix === '256gb' ? 50 : (v.countInStock ?? 8),
      image: v.image
    };
  });

export const buildSeedProducts = (): SeedProduct[] =>
  allDrafts.map((parent) => {
    const reviews = defaultReviews(parent.releaseYear);
    return {
      name: parent.name,
      image: parent.image,
      description: parent.description,
      brand: parent.brand,
      category: parent.category,
      subcategory: parent.subcategory,
      modelKey: parent.modelKey,
      releaseYear: parent.releaseYear,
      condition: 'Like New',
      rating: parent.rating ?? reviews.rating,
      numReviews: parent.numReviews ?? reviews.numReviews,
      variants: buildVariants(parent)
    };
  });

export const getCatalogDrafts = (): CatalogParentDraft[] => allDrafts;

export const getCatalogStats = () => {
  const products = buildSeedProducts();
  const variantCount = products.reduce((acc, p) => acc + p.variants.length, 0);
  return { parentCount: products.length, variantCount };
};

export default buildSeedProducts;
