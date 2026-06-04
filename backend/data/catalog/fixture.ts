import type { CatalogParentDraft } from './types.js';

/** E2E fixture: searchable as "Amazon Echo", always out of stock. */
export const fixtureOutOfStock: CatalogParentDraft = {
  name: 'Amazon Echo Dot (3rd Generation)',
  modelKey: 'amazon-echo-dot-3-fixture',
  brand: 'Amazon',
  category: 'Electronics',
  subcategory: 'Smart Speakers',
  pricingCategory: 'Audio',
  releaseYear: 2018,
  description:
    'Meet Echo Dot - Our most popular smart speaker with a fabric design. Compact smart speaker for small spaces.',
  image: '/images/alexa.jpg',
  rating: 4,
  numReviews: 12,
  variants: [
    {
      skuSuffix: 'charcoal',
      label: 'Charcoal',
      listPrice: 49.99,
      countInStock: 0
    },
    {
      skuSuffix: 'heather-gray',
      label: 'Heather Gray',
      listPrice: 49.99,
      countInStock: 0
    }
  ]
};
