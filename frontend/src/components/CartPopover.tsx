import { Link, useNavigate } from 'react-router-dom';
import { Button, ListGroup } from 'react-bootstrap';
import { useAppSelector } from '../store/hooks';
import { cartLineKey } from '../features/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { buildAuthUrl } from '../utils/authModalUrl';

interface CartPopoverProps {
  onClose: () => void;
}

const CartPopover = ({ onClose }: CartPopoverProps) => {
  const navigate = useNavigate();
  const { cartItems } = useAppSelector((state) => state.cart);
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const checkoutHandler = () => {
    onClose();
    if (userInfo) {
      navigate('/shipping');
    } else {
      navigate(buildAuthUrl('/', 'login', '/shipping'));
    }
  };

  return (
    <div className="cart-popover-panel" data-testid="cart-popover">
      {cartItems.length === 0 ? (
        <p className="text-muted mb-0" data-testid="cart-popover-empty">
          Your cart is empty
        </p>
      ) : (
        <>
          <ListGroup variant="flush" className="cart-popover-list">
            {cartItems.map((item) => {
              const lineId = cartLineKey(item.product, item.variantSku);
              return (
                <ListGroup.Item key={lineId} className="px-0 py-2 border-0">
                  <div className="d-flex justify-content-between gap-2">
                    <Link
                      to={`/product/${item.product}`}
                      className="link-cta small"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <span className="text-muted small text-nowrap">
                      {item.qty} × {formatPrice(item.price)}
                    </span>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          <div className="d-flex justify-content-between fw-semibold mt-2 mb-3">
            <span>Subtotal</span>
            <span data-testid="cart-popover-subtotal">{formatPrice(subtotal)}</span>
          </div>
          <Button
            type="button"
            className="w-100 btn-cta"
            data-testid="cart-popover-checkout"
            onClick={checkoutHandler}
          >
            Proceed To Checkout
          </Button>
        </>
      )}
    </div>
  );
};

export default CartPopover;
