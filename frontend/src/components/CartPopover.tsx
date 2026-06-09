import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, ListGroup } from 'react-bootstrap';
import { useAppSelector } from '../store/hooks';
import { cartLineKey, isShoppingItem, isToPayItem } from '../features/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { buildAuthUrl, stripAuthSearch } from '../utils/authModalUrl';

interface CartPopoverProps {
  onClose: () => void;
}

const CartPopover = ({ onClose }: CartPopoverProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useAppSelector((state) => state.cart);
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const shoppingItems = cartItems.filter(isShoppingItem);
  const subtotal = shoppingItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const hasShoppingItems = shoppingItems.length > 0;

  const checkoutHandler = () => {
    onClose();
    if (userInfo) {
      navigate('/checkout');
    } else {
      navigate(
        buildAuthUrl(location.pathname, 'login', '/checkout', stripAuthSearch(location.search))
      );
    }
  };

  return (
    <div className="cart-popover-panel header-panel-dark" data-testid="cart-popover">
      {cartItems.length === 0 ? (
        <p className="text-muted mb-0" data-testid="cart-popover-empty">
          Your cart is empty
        </p>
      ) : (
        <>
          <ListGroup variant="flush" className="cart-popover-list">
            {cartItems.map((item) => {
              const lineId = cartLineKey(item.product, item.variantSku);
              const pending = isToPayItem(item);
              return (
                <ListGroup.Item key={lineId} className="px-0 py-2 border-0">
                  <div className="d-flex justify-content-between gap-2 align-items-start">
                    {pending && item.orderId ? (
                      <Link
                        to={`/order/${item.orderId}`}
                        className="link-cta small"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Link
                        to={`/product/${item.product}`}
                        className="link-cta small"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                    )}
                    <div className="text-end">
                      {pending && (
                        <Badge bg="warning" className="mb-1" data-testid="cart-item-to-pay-badge">
                          To Pay
                        </Badge>
                      )}
                      <div className="text-muted small text-nowrap">
                        {item.qty} × {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
          {hasShoppingItems && (
            <div className="d-flex justify-content-between fw-semibold mt-2 mb-3">
              <span>Subtotal</span>
              <span data-testid="cart-popover-subtotal">{formatPrice(subtotal)}</span>
            </div>
          )}
          {hasShoppingItems && (
            <Button
              type="button"
              className="w-100 btn-cta"
              data-testid="cart-popover-checkout"
              onClick={checkoutHandler}
            >
              Proceed To Checkout
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default CartPopover;
