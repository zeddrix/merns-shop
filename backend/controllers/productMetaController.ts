import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import Product from '../models/Product.js';
import { getFromCache, setInCache } from '../utils/memoryCache.js';

const META_CACHE_KEY = 'product-meta';
const META_CACHE_TTL_MS = 120_000;

const getProductMeta = asyncHandler(async (_req: Request, res: Response) => {
  const cached = getFromCache<{
    brands: string[];
    categories: string[];
    subcategories: string[];
  }>(META_CACHE_KEY);

  if (cached) {
    res.set('X-Cache', 'HIT');
    res.json(cached);
    return;
  }

  const [brands, categories, subcategories] = await Promise.all([
    Product.distinct('brand'),
    Product.distinct('category'),
    Product.distinct('subcategory')
  ]);

  const payload = {
    brands: brands.sort(),
    categories: categories.sort(),
    subcategories: subcategories.sort()
  };

  setInCache(META_CACHE_KEY, payload, META_CACHE_TTL_MS);
  res.set('X-Cache', 'MISS');
  res.json(payload);
});

export { getProductMeta };
