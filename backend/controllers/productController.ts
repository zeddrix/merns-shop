import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import Product from '../models/Product.js';
import {
  PRODUCTS_PER_PAGE,
  buildProductListFilter,
  buildProductSort,
  calculateTotalPages
} from '../utils/productQuery.js';
import { enrichProductForList } from '../utils/productVariants.js';

const toListProduct = (product: {
  toObject?: () => Record<string, unknown>;
  variants: unknown[];
}) => {
  const plain = product.toObject ? product.toObject() : product;
  return enrichProductForList(plain as Parameters<typeof enrichProductForList>[0]);
};

const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.pageNumber) || 1;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

  const filter = buildProductListFilter({
    keyword: req.query.keyword ? String(req.query.keyword) : undefined,
    brand: req.query.brand ? String(req.query.brand) : undefined,
    category: req.query.category ? String(req.query.category) : undefined,
    subcategory: req.query.subcategory ? String(req.query.subcategory) : undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined
  });

  const sort = buildProductSort(req.query.sort ? String(req.query.sort) : undefined);
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(PRODUCTS_PER_PAGE)
    .skip(PRODUCTS_PER_PAGE * (page - 1));

  res.json({
    products: products.map((p) => toListProduct(p)),
    page,
    pages: calculateTotalPages(count)
  });
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(toListProduct(product));
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ msg: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const product = new Product({
    name: req.body.name,
    user: req.user._id,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    subcategory: req.body.subcategory,
    modelKey: req.body.modelKey,
    releaseYear: req.body.releaseYear,
    condition: req.body.condition ?? 'Like New',
    numReviews: 0,
    description: req.body.description,
    variants: req.body.variants
  });

  const createdProduct = await product.save();
  res.status(201).json(toListProduct(createdProduct));
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    image,
    brand,
    category,
    subcategory,
    modelKey,
    releaseYear,
    condition,
    variants
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.subcategory = subcategory;
    product.modelKey = modelKey;
    product.releaseYear = releaseYear;
    if (condition) {
      product.condition = condition;
    }
    product.variants = variants;

    const updatedProduct = await product.save();
    res.json(toListProduct(updatedProduct));
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const createProductReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user!._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    };

    product.reviews.push(review as (typeof product.reviews)[number]);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ msg: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products.map((p) => toListProduct(p)));
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts
};
