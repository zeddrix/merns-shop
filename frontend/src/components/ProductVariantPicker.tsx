import { Form } from 'react-bootstrap';
import type { ProductVariant } from '../types';

interface ProductVariantPickerProps {
  variants: ProductVariant[];
  selectedSku: string;
  onSelect: (sku: string) => void;
}

const ProductVariantPicker = ({ variants, selectedSku, onSelect }: ProductVariantPickerProps) => {
  return (
    <Form.Group className="my-3" controlId="variant">
      <Form.Label>
        <strong>Select option</strong>
      </Form.Label>
      <div className="d-flex flex-wrap gap-2" data-testid="product-variant-picker">
        {variants.map((variant) => (
          <Form.Check key={variant.sku} id={`variant-${variant.sku}`} className="me-3">
            <Form.Check.Input
              type="radio"
              name="variant"
              checked={selectedSku === variant.sku}
              onChange={() => onSelect(variant.sku)}
              disabled={variant.countInStock === 0}
              data-testid={`product-variant-${variant.sku}`}
            />
            <Form.Check.Label htmlFor={`variant-${variant.sku}`}>
              {variant.label} — ${variant.price.toFixed(2)}
            </Form.Check.Label>
          </Form.Check>
        ))}
      </div>
    </Form.Group>
  );
};

export default ProductVariantPicker;
