import { DISPLAY_BRAND_NAME } from './brand';

export const DEVELOPER_NAME = 'Zeddrix Fabian';

export const DEVELOPER_ATTRIBUTION_SUFFIX = ` Developed by ${DEVELOPER_NAME}.`;

export const DEVELOPER_GITHUB_REPO_URL = 'https://github.com/zeddrix/merns-shop';

export const DEVELOPER_PORTFOLIO_URL = 'https://github.com/zeddrix/portfolio';

export const DEVELOPER_LINKEDIN_URL = 'https://www.linkedin.com/in/zeddrix-fabian-30a18029a/';

export const PRODUCTION_SITE_URL = 'https://merns-shop.onrender.com';

export const DEFAULT_META_DESCRIPTION_PRIMARY =
  'Shop phones, tablets, TVs, and consoles at great prices. Browse top-rated electronics with fast checkout.';

export const DEFAULT_OG_IMAGE_PATH = '/images/og-default.webp';

export const DEFAULT_META_TITLE = `Welcome to ${DISPLAY_BRAND_NAME}`;

export const SEO_DESCRIPTION_MAX_LENGTH = 155;

export const ROBOTS_INDEX_FOLLOW = 'index,follow';
export const ROBOTS_NOINDEX_FOLLOW = 'noindex,follow';
export const ROBOTS_NOINDEX_NOFOLLOW = 'noindex,nofollow';

export const ABOUT_KEYWORDS =
  'Zeddrix Fabian, MERN stack, React, TypeScript, portfolio, e-commerce, PWA, Playwright, Render, MongoDB Atlas';

const DEV_SITE_URL = 'http://localhost:5020';

export const getSiteUrl = (): string => {
  const raw = import.meta.env.VITE_SITE_URL;
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
