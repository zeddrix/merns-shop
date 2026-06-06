import { Button, Spinner } from 'react-bootstrap';

export type AddToCartButtonState = 'idle' | 'loading' | 'added' | 'error';

interface AddToCartButtonProps {
  state: AddToCartButtonState;
  disabled?: boolean;
  onClick: () => void;
}

const testIdForState = (state: AddToCartButtonState): string => {
  switch (state) {
    case 'loading':
      return 'product-add-cart-loading';
    case 'added':
      return 'product-add-cart-added';
    case 'error':
      return 'product-add-cart-error';
    default:
      return 'product-add-cart';
  }
};

const modifierClassForState = (state: AddToCartButtonState): string => {
  switch (state) {
    case 'loading':
      return ' product-add-cart-btn--loading';
    case 'added':
      return ' product-add-cart-btn--added';
    case 'error':
      return ' product-add-cart-btn--error';
    default:
      return '';
  }
};

const AddToCartButton = ({ state, disabled = false, onClick }: AddToCartButtonProps) => {
  const isIdle = state === 'idle';
  const isLoading = state === 'loading';
  const isAdded = state === 'added';
  const isError = state === 'error';

  return (
    <Button
      onClick={onClick}
      className={`w-100 btn-cta product-add-cart-btn${modifierClassForState(state)}`}
      type="button"
      data-testid={testIdForState(state)}
      disabled={disabled || isLoading}
    >
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--idle"
        aria-hidden={!isIdle}
      >
        Add To Cart
      </span>
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--loading"
        aria-hidden={!isLoading}
      >
        <Spinner animation="border" size="sm" role="status" data-testid="product-add-cart-spinner">
          <span className="visually-hidden">Adding to cart...</span>
        </Spinner>
      </span>
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--success"
        aria-hidden={!isAdded}
      >
        Added to cart!
      </span>
      <span
        className="product-add-cart-btn__layer product-add-cart-btn__layer--error"
        aria-hidden={!isError}
      >
        Couldn&apos;t add — try again
      </span>
    </Button>
  );
};

export default AddToCartButton;
