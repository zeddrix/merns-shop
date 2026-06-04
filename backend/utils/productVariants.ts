export interface ProductVariantLike {
  sku: string;
  label: string;
  storageGb?: number;
  screenInches?: number;
  ramGb?: number;
  listPrice: number;
  price: number;
  countInStock: number;
  image?: string;
}

export interface ProductWithVariantsLike {
  image: string;
  variants: ProductVariantLike[];
}

export interface ProductListSummary {
  priceFrom: number;
  listPriceFrom: number;
  savingsPercentMax: number;
  inStock: boolean;
  totalStock: number;
}

export const resolveVariant = (
  product: ProductWithVariantsLike,
  variantSku?: string
): ProductVariantLike | null => {
  if (!product.variants?.length) {
    return null;
  }
  if (!variantSku) {
    return product.variants[0] ?? null;
  }
  return product.variants.find((v) => v.sku === variantSku) ?? null;
};

export const getProductListSummary = (variants: ProductVariantLike[]): ProductListSummary => {
  if (!variants.length) {
    return {
      priceFrom: 0,
      listPriceFrom: 0,
      savingsPercentMax: 0,
      inStock: false,
      totalStock: 0
    };
  }

  const priceFrom = Math.min(...variants.map((v) => v.price));
  const listPriceFrom = Math.min(...variants.map((v) => v.listPrice));
  const savingsPercentMax = Math.max(
    ...variants.map((v) =>
      v.listPrice > 0 ? Math.round(((v.listPrice - v.price) / v.listPrice) * 100) : 0
    )
  );
  const totalStock = variants.reduce((acc, v) => acc + v.countInStock, 0);

  return {
    priceFrom,
    listPriceFrom,
    savingsPercentMax,
    inStock: totalStock > 0,
    totalStock
  };
};

export const enrichProductForList = <T extends { variants: ProductVariantLike[] }>(
  product: T
): T & ProductListSummary => ({
  ...product,
  ...getProductListSummary(product.variants)
});

export const getVariantDisplayImage = (
  product: ProductWithVariantsLike,
  variant: ProductVariantLike
): string => variant.image ?? product.image;

export const getVariantLineName = (productName: string, variant: ProductVariantLike): string =>
  `${productName} (${variant.label})`;
