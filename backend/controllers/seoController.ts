import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { buildDefaultSitemapEntries, buildSitemapXml } from '../utils/sitemapXml.js';
import { buildRobotsTxt } from '../utils/seoHtml.js';
import { getFromCache, setInCache } from '../utils/memoryCache.js';

const SITEMAP_CACHE_KEY = 'sitemap-xml';
const SITEMAP_CACHE_TTL_MS = 120_000;

export const getRobotsTxt = asyncHandler(async (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(buildRobotsTxt());
});

export const getSitemapXml = asyncHandler(async (_req: Request, res: Response) => {
  const cached = getFromCache<string>(SITEMAP_CACHE_KEY);
  if (cached) {
    res.type('application/xml');
    res.set('Cache-Control', 'public, max-age=120');
    res.send(cached);
    return;
  }

  const products = await Product.find({}).select('_id updatedAt').lean();
  const entries = buildDefaultSitemapEntries(
    products.map((product) => {
      const row = product as { _id: { toString(): string }; updatedAt?: Date };
      return {
        id: row._id.toString(),
        updatedAt: row.updatedAt
      };
    })
  );
  const xml = buildSitemapXml(entries);
  setInCache(SITEMAP_CACHE_KEY, xml, SITEMAP_CACHE_TTL_MS);
  res.type('application/xml');
  res.set('Cache-Control', 'public, max-age=120');
  res.send(xml);
});
