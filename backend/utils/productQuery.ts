type ProductFilter = Record<string, unknown>;

export const PRODUCTS_PER_PAGE = 12;

export const calculateTotalPages = (count: number, pageSize = PRODUCTS_PER_PAGE): number => {
  return Math.ceil(count / pageSize) || 1;
};

export interface ProductListQueryParams {
  keyword?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const buildProductListFilter = (params: ProductListQueryParams): ProductFilter => {
  const filter: ProductFilter = {};

  if (params.keyword) {
    const keyword = params.keyword.trim();
    const looksLikeSku = /^[a-z0-9-]+$/i.test(keyword) && keyword.includes('-');

    if (looksLikeSku) {
      const skuRegex = { $regex: keyword, $options: 'i' };
      filter.$or = [{ 'variants.sku': skuRegex }, { 'variants.label': skuRegex }];
    } else {
      const searchTerms = keyword.includes(' ') ? `"${keyword.replace(/"/g, '')}"` : keyword;
      filter.$text = { $search: searchTerms };
    }
  }

  if (params.brand) {
    filter.brand = params.brand;
  }

  if (params.category) {
    filter.category = params.category;
  }

  if (params.subcategory) {
    filter.subcategory = params.subcategory;
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFrom: { $gte?: number; $lte?: number } = {};
    if (params.minPrice !== undefined) {
      priceFrom.$gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      priceFrom.$lte = params.maxPrice;
    }
    filter['variants.price'] = priceFrom;
  }

  return filter;
};

export const buildProductSort = (sort?: string): Record<string, 1 | -1> => {
  switch (sort) {
    case 'price-asc':
      return { 'variants.price': 1 };
    case 'price-desc':
      return { 'variants.price': -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { releaseYear: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const isPriceSort = (sort?: string): sort is 'price-asc' | 'price-desc' =>
  sort === 'price-asc' || sort === 'price-desc';

export const getPriceSortDirection = (sort: 'price-asc' | 'price-desc'): 1 | -1 =>
  sort === 'price-asc' ? 1 : -1;

/** @deprecated Use buildProductListFilter */
export const buildKeywordFilter = (keyword?: string) => buildProductListFilter({ keyword });
