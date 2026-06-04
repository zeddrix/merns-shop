import { DISPLAY_BRAND_NAME } from './brand';

export const DEFAULT_META_DESCRIPTION =
  'Shop phones, tablets, TVs, and consoles at great prices. Browse top-rated electronics with fast checkout.';

export const DEFAULT_OG_IMAGE_PATH = '/favicon.ico';

export const DEFAULT_META_TITLE = `Welcome to ${DISPLAY_BRAND_NAME}`;

export const SEO_DESCRIPTION_MAX_LENGTH = 155;

export const ROBOTS_INDEX_FOLLOW = 'index,follow';
export const ROBOTS_NOINDEX_FOLLOW = 'noindex,follow';
export const ROBOTS_NOINDEX_NOFOLLOW = 'noindex,nofollow';

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
