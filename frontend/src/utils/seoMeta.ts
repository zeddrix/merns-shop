import type { Product } from '../types';
import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
  DEFAULT_OG_IMAGE_PATH,
  SEO_DESCRIPTION_MAX_LENGTH,
  getSiteUrl,
  toAbsoluteUrl
} from '../constants/seo';
import { DISPLAY_BRAND_NAME } from '../constants/brand';

export type RobotsDirective = 'index,follow' | 'noindex,follow' | 'noindex,nofollow';

export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export const truncateDescription = (
  text: string,
  maxLength = SEO_DESCRIPTION_MAX_LENGTH
): string => {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

export const buildCanonicalUrl = (canonicalPath: string): string => {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  return toAbsoluteUrl(path);
};

export const buildSearchTitle = (keyword: string): string =>
  `Search: ${keyword} | ${DISPLAY_BRAND_NAME}`;

export const buildProductTitle = (productName: string): string =>
  `${productName} | ${DISPLAY_BRAND_NAME}`;

export const buildHomeCanonicalPath = (options: {
  keyword?: string;
  pageNumber?: string;
  hasFilterQuery: boolean;
}): string => {
  const { keyword, pageNumber, hasFilterQuery } = options;
  if (hasFilterQuery) {
    return '/';
  }
  if (keyword && pageNumber) {
    return `/search/${encodeURIComponent(keyword)}/page/${pageNumber}`;
  }
  if (keyword) {
    return `/search/${encodeURIComponent(keyword)}`;
  }
  if (pageNumber && pageNumber !== '1') {
    return `/page/${pageNumber}`;
  }
  return '/';
};

export const buildWebsiteJsonLd = (): Record<string, unknown> => {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DISPLAY_BRAND_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search/{search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

export const buildOrganizationJsonLd = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: DISPLAY_BRAND_NAME,
  url: getSiteUrl()
});

export const buildAboutTitle = (): string => `About | ${DISPLAY_BRAND_NAME}`;

export const buildAboutMetaDescription = (): string =>
  truncateDescription(
    `Learn how ${DISPLAY_BRAND_NAME} started as a 2021 Udemy MERN learning project and was modernized in 2026 with ATDD and AI-assisted development by Zeddrix Fabian.`
  );

export const buildAboutJsonLd = (description: string): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: buildAboutTitle(),
  description,
  url: buildCanonicalUrl('/about')
});

export const buildProductJsonLd = (product: Product): Record<string, unknown> => {
  const lowestVariant = [...product.variants].sort((a, b) => a.price - b.price)[0];
  const price = product.priceFrom ?? lowestVariant?.price ?? 0;
  const sku = lowestVariant?.sku ?? product.modelKey;
  const image = toAbsoluteUrl(lowestVariant?.image ?? product.image);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncateDescription(product.description),
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      url: buildCanonicalUrl(`/product/${product._id}`),
      priceCurrency: 'USD',
      price: price.toFixed(2),
      availability:
        product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
    }
  };

  if (product.numReviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.numReviews
    };
  }

  return jsonLd;
};

export const defaultOgImageUrl = (): string => toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);

export const productOgImageUrl = (product: Product): string => toAbsoluteUrl(product.image);

export { DEFAULT_META_DESCRIPTION, DEFAULT_META_TITLE, DEFAULT_OG_IMAGE_PATH, DISPLAY_BRAND_NAME };
