import type { Product } from '../types';
import {
  DEVELOPER_ATTRIBUTION_SUFFIX,
  DEVELOPER_GITHUB_REPO_URL,
  DEVELOPER_LINKEDIN_URL,
  DEVELOPER_NAME,
  DEVELOPER_PORTFOLIO_URL,
  DEFAULT_META_DESCRIPTION_PRIMARY,
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

export const buildMetaDescription = (primary: string): string => {
  const trimmed = primary.trim();
  if (trimmed.includes(DEVELOPER_NAME)) {
    return truncateDescription(trimmed);
  }
  const suffix = DEVELOPER_ATTRIBUTION_SUFFIX;
  const maxPrimaryLength = SEO_DESCRIPTION_MAX_LENGTH - suffix.length;
  const truncatedPrimary =
    trimmed.length <= maxPrimaryLength
      ? trimmed
      : `${trimmed.slice(0, maxPrimaryLength - 1).trimEnd()}…`;
  return `${truncatedPrimary}${suffix}`;
};

export const DEFAULT_META_DESCRIPTION = buildMetaDescription(DEFAULT_META_DESCRIPTION_PRIMARY);

export const buildCanonicalUrl = (canonicalPath: string): string => {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  return toAbsoluteUrl(path);
};

export const buildSearchTitle = (keyword: string): string =>
  `Search: ${keyword} | ${DISPLAY_BRAND_NAME}`;

export const buildProductTitle = (productName: string): string =>
  `${productName} | ${DISPLAY_BRAND_NAME}`;

export const buildNotFoundTitle = (): string => `Page Not Found | ${DISPLAY_BRAND_NAME}`;

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

export const buildDeveloperSameAs = (): string[] => [
  DEVELOPER_GITHUB_REPO_URL,
  DEVELOPER_PORTFOLIO_URL,
  DEVELOPER_LINKEDIN_URL
];

export const buildPersonJsonLd = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: DEVELOPER_NAME,
  url: buildCanonicalUrl('/about'),
  sameAs: buildDeveloperSameAs(),
  jobTitle: 'Software Developer',
  knowsAbout: ['MERN stack', 'React', 'TypeScript', 'Node.js', 'MongoDB']
});

const personAuthorRef = (): Record<string, unknown> => ({
  '@type': 'Person',
  name: DEVELOPER_NAME,
  url: buildCanonicalUrl('/about')
});

export const buildWebsiteJsonLd = (): Record<string, unknown> => {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DISPLAY_BRAND_NAME,
    url: siteUrl,
    author: personAuthorRef(),
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
  url: getSiteUrl(),
  founder: personAuthorRef()
});

export const buildAboutTitle = (): string =>
  `${DEVELOPER_NAME} | MERN Stack Developer | ${DISPLAY_BRAND_NAME}`;

export const buildAboutMetaDescription = (): string =>
  buildMetaDescription(
    `${DEVELOPER_NAME} built ${DISPLAY_BRAND_NAME} as a MERN stack portfolio e-commerce demo — TypeScript, React 19, Vite, Express, MongoDB, and ATDD.`
  );

export const buildAboutJsonLd = (description: string): Record<string, unknown>[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: buildAboutTitle(),
    description,
    url: buildCanonicalUrl('/about'),
    author: personAuthorRef(),
    mainEntity: buildPersonJsonLd()
  },
  buildPersonJsonLd()
];

export const buildSearchMetaDescription = (keyword: string): string =>
  buildMetaDescription(`Browse results for "${keyword}" at our electronics store.`);

export const buildPrivateMetaDescription = (): string =>
  buildMetaDescription('Sign in or manage your account on our electronics store.');

export const buildProductMetaDescription = (productDescription: string): string =>
  buildMetaDescription(productDescription);

export const buildProductNotFoundMetaDescription = (): string =>
  buildMetaDescription('This product could not be found. Browse our electronics catalog instead.');

export const buildNotFoundMetaDescription = (): string =>
  buildMetaDescription('The page you requested could not be found.');

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

export { DEFAULT_META_TITLE, DEFAULT_OG_IMAGE_PATH, DISPLAY_BRAND_NAME, DEVELOPER_NAME };
