import { buildCatalogSrcSet, DEFAULT_CATALOG_SIZES } from '../utils/catalogImage';

interface CatalogImageProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  className?: string;
  'data-testid'?: string;
}

const CatalogImage = ({
  src,
  alt,
  loading = 'lazy',
  fetchPriority,
  sizes = DEFAULT_CATALOG_SIZES,
  className,
  'data-testid': dataTestId
}: CatalogImageProps) => (
  <img
    src={src}
    srcSet={buildCatalogSrcSet(src)}
    sizes={sizes}
    alt={alt}
    loading={loading}
    decoding="async"
    fetchPriority={fetchPriority}
    className={className}
    data-testid={dataTestId}
  />
);

export default CatalogImage;
