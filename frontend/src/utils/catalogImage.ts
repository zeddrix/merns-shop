export const CATALOG_IMAGE_WIDTHS = [400, 800, 1200] as const;

export const catalogVariantPath = (basePath: string, width: number): string => {
  if (width >= 1200) {
    return basePath;
  }
  return basePath.replace(/\.webp$/i, `-${width}.webp`);
};

export const buildCatalogSrcSet = (basePath: string): string =>
  CATALOG_IMAGE_WIDTHS.map((width) => `${catalogVariantPath(basePath, width)} ${width}w`).join(
    ', '
  );

export const DEFAULT_CATALOG_SIZES =
  '(max-width: 576px) 100vw, (max-width: 992px) 50vw, (max-width: 1200px) 33vw, 25vw';

export const PDP_CATALOG_SIZES = '(max-width: 768px) 100vw, 50vw';

export const CART_CATALOG_SIZES = '80px';
