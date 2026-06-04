import { useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card, Form } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import { addToCart, removeFromCart, cartLineKey } from '../features/cartSlice';
import { capQtyOptions } from '../constants/cartLimits';
import { formatPrice } from '../utils/formatPrice';
import SeoPrivateMeta from '../components/SeoPrivateMeta';

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
      navigate('/shipping');
    } else {
      navigate('/login?redirect=shipping');
    }
  };

  return (
    <>
      <SeoPrivateMeta canonicalPath="/cart" />
      <Row data-testid="cart-screen">
        <Col md={8}>
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
                  <ListGroup.Item key={lineKey} data-testid={`cart-item-${item.product}`}>
                    <Row>
                      <Col md={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col md={3}>
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </Col>
                      <Col md={2}>{formatPrice(item.price)}</Col>
                      <Col md={2}>
                        <Form.Select
                          value={item.qty}
                          data-testid={`cart-qty-${item.product}`}
                          onChange={(e) =>
                            dispatch(
                              addToCart({
                                id: item.product,
                                qty: Number(e.target.value),
                                variantSku: item.variantSku
                              })
                            )
                          }
                        >
                          {[...Array(maxQty).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={2}>
                        <Button
                          type="button"
                          variant="light"
                          data-testid={`cart-remove-${item.product}`}
                          onClick={() => removeFromCartHandler(lineKey)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
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
                    className="btn-block"
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
