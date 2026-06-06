import { Button } from 'react-bootstrap';

export type AddToCartButtonState = 'idle' | 'added';

interface AddToCartButtonProps {
  state: AddToCartButtonState;
  disabled?: boolean;
  onClick: () => void;
}

const AddToCartButton = ({ state, disabled = false, onClick }: AddToCartButtonProps) => {
  const isAdded = state === 'added';

  return (
    <Button
      onClick={onClick}
      className={`w-100 btn-cta product-add-cart-btn${isAdded ? ' product-add-cart-btn--added' : ''}`}
      type="button"
      data-testid={isAdded ? 'product-add-cart-added' : 'product-add-cart'}
      disabled={disabled}
    >
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--idle"
        aria-hidden={isAdded}
      >
        Add To Cart
      </span>
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--success"
        aria-hidden={!isAdded}
      >
        Added to cart!
      </span>
    </Button>
  );
};

export default AddToCartButton;
