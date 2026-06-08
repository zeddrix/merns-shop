export interface FetchCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, FetchCacheEntry<unknown>>();

export const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
};

export const setCached = <T>(key: string, data: T, ttlMs: number): void => {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const bustCache = (keyPrefix?: string): void => {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
};

export const buildCacheKey = (
  url: string,
  params?: Record<string, string | number | undefined>
): string => {
  if (!params) {
    return url;
  }
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${url}?${sorted}` : url;
};

/** Test-only helper */
export const clearFetchCacheForTests = (): void => {
  cache.clear();
};
