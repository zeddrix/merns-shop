import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Card } from 'react-bootstrap';
import OrderLineItem from '../components/OrderLineItem';
import { cartLineKey } from '../features/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder, orderCreateReset } from '../features/orderSlice';
import { userDetailsReset } from '../features/userSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';
import AuthRequiredGate from '../components/AuthRequiredGate';
import SeoPrivateMeta from '../components/SeoPrivateMeta';

const addDecimals = (num: number) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const PlaceOrderScreen = () => {
  const isAuthenticated = useRequireAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = `${location.pathname}${location.search}`;

  const cart = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [navigate, cart.shippingAddress.address, cart.paymentMethod, isAuthenticated]);

  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  const shippingPrice = addDecimals(Number(itemsPrice) > 100 ? 0 : 100);
  const taxPrice = addDecimals(Number((0.15 * Number(itemsPrice)).toFixed(2)));
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

  const orderCreate = useAppSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  useEffect(() => {
    if (success && order) {
      navigate(`/order/${order._id}`);
      dispatch(userDetailsReset());
      dispatch(orderCreateReset());
    }
  }, [dispatch, navigate, success, order]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod ?? 'PayPal',
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      })
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <SeoPrivateMeta canonicalPath="/placeorder" />
        <AuthRequiredGate variant="checkout" />
      </>
    );
  }

  return (
    <div data-testid="place-order-screen">
      <SeoPrivateMeta canonicalPath="/placeorder" />
      <CheckoutSteps step1 step2 step3 step4 redirectPath={redirectPath} />
      <Row>
        <Col xs={12} lg={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
                    <ListGroup.Item key={cartLineKey(item.product, item.variantSku)}>
                      <OrderLineItem item={item} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col xs={12} lg={4} className="mt-3 mt-lg-0">
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && <Message variant="danger">{error}</Message>}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type="button"
                  className="w-100 btn-cta"
                  data-testid="place-order-submit"
                  disabled={cart.cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlaceOrderScreen;
