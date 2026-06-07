import { useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Row, Col, ListGroup, Button, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import CartLineItem from '../components/CartLineItem';
import { addToCart, removeFromCart, cartLineKey } from '../features/cartSlice';
import { capQtyOptions } from '../constants/cartLimits';
import { formatPrice } from '../utils/formatPrice';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import { buildAuthUrl } from '../utils/authModalUrl';

const CartScreen = () => {
  const { id: productId } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const qty = params.get('qty') ? Number(params.get('qty')) : 1;
  const variantSku = params.get('variantSku') ?? '';

  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart);
  const { cartItems } = cart;
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (productId && variantSku) {
      dispatch(addToCart({ id: productId, qty, variantSku }));
    }
  }, [dispatch, productId, qty, variantSku]);

  const removeFromCartHandler = (lineKey: string) => {
    dispatch(removeFromCart(lineKey));
  };

  const checkoutHandler = () => {
    if (userInfo) {
      navigate('/checkout');
    } else {
      navigate(buildAuthUrl('/cart', 'login', '/checkout'));
    }
  };

  return (
    <>
      <SeoPrivateMeta canonicalPath="/cart" />
      <Row data-testid="cart-screen">
        <Col xs={12} lg={8}>
          <h1>Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <Message data-testid="cart-empty">
              Your cart is empty <Link to="/">Go Back</Link>
            </Message>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => {
                const lineKey = cartLineKey(item.product, item.variantSku);
                const maxQty = capQtyOptions(item.countInStock);
                return (
                  <ListGroup.Item key={lineKey}>
                    <CartLineItem
                      item={item}
                      maxQty={maxQty}
                      onQtyChange={(newQty) =>
                        dispatch(
                          addToCart({
                            id: item.product,
                            qty: newQty,
                            variantSku: item.variantSku
                          })
                        )
                      }
                      onRemove={() => removeFromCartHandler(lineKey)}
                    />
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Col>
        <Col xs={12} lg={4} className="mt-3 mt-lg-0">
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                {formatPrice(cartItems.reduce((acc, item) => acc + item.qty * item.price, 0))}
              </ListGroup.Item>
              {cartItems.length > 0 && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="w-100 btn-cta"
                    data-testid="cart-checkout"
                    onClick={checkoutHandler}
                  >
                    Proceed To Checkout
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CartScreen;
