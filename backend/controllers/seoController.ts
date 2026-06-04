import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { buildDefaultSitemapEntries, buildSitemapXml } from '../utils/sitemapXml.js';
import { buildRobotsTxt } from '../utils/seoHtml.js';

export const getRobotsTxt = asyncHandler(async (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(buildRobotsTxt());
});

export const getSitemapXml = asyncHandler(async (_req: Request, res: Response) => {
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
  res.type('application/xml');
  res.send(buildSitemapXml(entries));
});
