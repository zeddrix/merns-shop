import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
  DEFAULT_OG_IMAGE_PATH,
  buildAboutMetaDescription,
  buildAboutTitle,
  buildMetaDescription,
  buildPersonJsonLd,
  getSiteUrl,
  toAbsoluteUrl
} from '../config/seo.js';
import { DISPLAY_BRAND_NAME } from '../constants/brand.js';
import type { IProductDocument } from '../models/Product.js';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const truncateDescription = (text: string, maxLength = 155): string => {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

export interface SeoHtmlDocumentOptions {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  robots?: string;
  author?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const buildSeoHtmlDocument = (options: SeoHtmlDocumentOptions): string => {
  const canonicalUrl = toAbsoluteUrl(options.canonicalPath);
  const imageUrl = options.ogImage ?? toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const robots = options.robots ?? 'index,follow';
  const ogType = options.ogType ?? 'website';
  const authorMeta = options.author
    ? `<meta name="author" content="${escapeHtml(options.author)}"/>`
    : '';
  const jsonLdEntries = options.jsonLd
    ? Array.isArray(options.jsonLd)
      ? options.jsonLd
      : [options.jsonLd]
    : [];

  const jsonLdScripts = jsonLdEntries
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}"/>
${authorMeta}
<meta name="robots" content="${escapeHtml(robots)}"/>
<link rel="canonical" href="${escapeHtml(canonicalUrl)}"/>
<meta property="og:site_name" content="${escapeHtml(DISPLAY_BRAND_NAME)}"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:title" content="${escapeHtml(options.title)}"/>
<meta property="og:description" content="${escapeHtml(options.description)}"/>
<meta property="og:url" content="${escapeHtml(canonicalUrl)}"/>
<meta property="og:image" content="${escapeHtml(imageUrl)}"/>
<meta property="og:type" content="${escapeHtml(ogType)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(options.title)}"/>
<meta name="twitter:description" content="${escapeHtml(options.description)}"/>
<meta name="twitter:image" content="${escapeHtml(imageUrl)}"/>
${jsonLdScripts}
</head>
<body>
<div id="root"></div>
</body>
</html>`;
};

const personAuthorRef = (): Record<string, unknown> => ({
  '@type': 'Person',
  name: 'Zeddrix Fabian',
  url: toAbsoluteUrl('/about')
});

export const buildHomeBotHtml = (): string =>
  buildSeoHtmlDocument({
    title: DEFAULT_META_TITLE,
    description: DEFAULT_META_DESCRIPTION,
    canonicalPath: '/',
    ogType: 'website',
    author: 'Zeddrix Fabian',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: DISPLAY_BRAND_NAME,
        url: getSiteUrl(),
        author: personAuthorRef()
      },
      buildPersonJsonLd()
    ]
  });

export const buildAboutBotHtml = (): string => {
  const description = buildAboutMetaDescription();
  return buildSeoHtmlDocument({
    title: buildAboutTitle(),
    description,
    canonicalPath: '/about',
    ogType: 'website',
    author: 'Zeddrix Fabian',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: buildAboutTitle(),
        description,
        url: toAbsoluteUrl('/about'),
        author: personAuthorRef(),
        mainEntity: buildPersonJsonLd()
      },
      buildPersonJsonLd()
    ]
  });
};

export const buildProductBotHtml = (product: IProductDocument): string => {
  const lowestVariant = [...product.variants].sort((a, b) => a.price - b.price)[0];
  const price = lowestVariant?.price ?? 0;

  return buildSeoHtmlDocument({
    title: `${product.name} | ${DISPLAY_BRAND_NAME}`,
    description: buildMetaDescription(product.description),
    canonicalPath: `/product/${product._id.toString()}`,
    ogImage: toAbsoluteUrl(product.image),
    ogType: 'product',
    author: 'Zeddrix Fabian',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: toAbsoluteUrl(product.image),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: price.toFixed(2)
      }
    }
  });
};

export const buildRobotsTxt = (): string => {
  const siteUrl = getSiteUrl();
  return `User-agent: *
Allow: /
Allow: /product/
Disallow: /admin
Disallow: /cart
Disallow: /profile
Disallow: /checkout
Disallow: /shipping
Disallow: /payment
Disallow: /placeorder
Disallow: /order

Sitemap: ${siteUrl}/sitemap.xml
`;
};

export { buildMetaDescription, truncateDescription };
