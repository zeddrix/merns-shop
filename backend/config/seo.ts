import { DEFAULT_META_TITLE } from '../constants/brand.js';

export { DEFAULT_META_TITLE };

export const DEFAULT_META_DESCRIPTION =
  'Shop phones, tablets, TVs, and consoles at great prices. Browse top-rated electronics with fast checkout.';

export const SEO_DESCRIPTION_MAX_LENGTH = 155;

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
