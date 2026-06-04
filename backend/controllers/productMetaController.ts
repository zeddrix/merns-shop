import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import Product from '../models/Product.js';

const getProductMeta = asyncHandler(async (_req: Request, res: Response) => {
  const [brands, categories, subcategories] = await Promise.all([
    Product.distinct('brand'),
    Product.distinct('category'),
    Product.distinct('subcategory')
  ]);

  res.json({
    brands: brands.sort(),
    categories: categories.sort(),
    subcategories: subcategories.sort()
  });
});

export { getProductMeta };
