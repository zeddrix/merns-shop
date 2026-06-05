import type { Product, ProductVariant } from '../types';

interface ProductVariantDetailsProps {
  product: Product;
  variant: ProductVariant;
}

const ProductVariantDetails = ({ product, variant }: ProductVariantDetailsProps) => {
  const specs: string[] = [];

  if (variant.storageGb) {
    specs.push(`${variant.storageGb}GB storage`);
  }
  if (variant.screenInches) {
    specs.push(`${variant.screenInches}" display`);
  }
  if (variant.ramGb) {
    specs.push(`${variant.ramGb}GB RAM`);
  }
  specs.push(`Configuration: ${variant.label}`);
  specs.push(`Condition: ${product.condition}`);
  specs.push(`SKU: ${variant.sku}`);

  return (
    <div className="product-details-block" data-testid="product-variant-details">
      <h4 className="h6 mb-2">Configuration details</h4>
      <ul className="variant-spec-list mb-0">
        {specs.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductVariantDetails;
