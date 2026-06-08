interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const getFromCache = <T>(key: string): T | undefined => {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
};

export const setInCache = <T>(key: string, value: T, ttlMs: number): void => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const bustCacheKey = (key: string): void => {
  store.delete(key);
};

export const bustCachePrefix = (prefix: string): void => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};

export const clearMemoryCacheForTests = (): void => {
  store.clear();
};
