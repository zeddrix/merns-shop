import { DEFAULT_META_TITLE } from '../constants/brand.js';

export { DEFAULT_META_TITLE };

export const DEVELOPER_NAME = 'Zeddrix Fabian';

export const DEVELOPER_ATTRIBUTION_SUFFIX = ` Developed by ${DEVELOPER_NAME}.`;

export const DEVELOPER_GITHUB_REPO_URL = 'https://github.com/zeddrix/merns-shop';

export const DEVELOPER_PORTFOLIO_URL = 'https://github.com/zeddrix/portfolio';

export const DEVELOPER_LINKEDIN_URL = 'https://www.linkedin.com/in/zeddrix-fabian-30a18029a/';

export const PRODUCTION_SITE_URL = 'https://merns-shop.onrender.com';

export const DEFAULT_META_DESCRIPTION_PRIMARY =
  'Shop phones, tablets, TVs, and consoles at great prices. Browse top-rated electronics with fast checkout.';

export const DEFAULT_OG_IMAGE_PATH = '/images/og-default.webp';

export const SEO_DESCRIPTION_MAX_LENGTH = 155;

const truncateDescription = (text: string, maxLength = SEO_DESCRIPTION_MAX_LENGTH): string => {
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

const DEV_SITE_URL = 'http://localhost:5021';

export const getSiteUrl = (): string => {
  const raw = process.env.SITE_URL;
  const value = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : DEV_SITE_URL;
  return value.replace(/\/+$/, '');
};

export const toAbsoluteUrl = (path: string): string => {
  const base = getSiteUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
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
  url: toAbsoluteUrl('/about'),
  sameAs: buildDeveloperSameAs(),
  jobTitle: 'Software Developer',
  knowsAbout: ['MERN stack', 'React', 'TypeScript', 'Node.js', 'MongoDB']
});

export const buildAboutTitle = (): string =>
  `${DEVELOPER_NAME} | MERN Stack Developer | MERN's Shop`;

export const buildAboutMetaDescription = (): string =>
  buildMetaDescription(
    `${DEVELOPER_NAME} built MERN's Shop as a MERN stack portfolio e-commerce demo — TypeScript, React 19, Vite, Express, MongoDB, and ATDD.`
  );
