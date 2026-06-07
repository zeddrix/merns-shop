import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { shippingAddressSchema, type ShippingAddressInput } from '@shared/validators/shipping';
import { countryOptions } from '@shared/constants/countries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import CheckoutProgress from '../components/CheckoutProgress';
import OrderLineItem from '../components/OrderLineItem';
import AppSelect from '../components/AppSelect';
import { cartLineKey, savePaymentMethod, saveShippingAddress } from '../features/cartSlice';
import { createOrder, orderCreateReset } from '../features/orderSlice';
import { userDetailsReset } from '../features/userSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';
import AuthRequiredGate from '../components/AuthRequiredGate';
import SeoPrivateMeta from '../components/SeoPrivateMeta';

const addDecimals = (num: number) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const CheckoutScreen = () => {
  const isAuthenticated = useRequireAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.cart);
  const orderCreate = useAppSelector((state) => state.orderCreate);
  const { order, success, error: orderError } = orderCreate;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    mode: 'onTouched',
    defaultValues: {
      address: cart.shippingAddress.address ?? '',
      city: cart.shippingAddress.city ?? '',
      postalCode: cart.shippingAddress.postalCode ?? '',
      country: cart.shippingAddress.country ?? ''
    }
  });

  const countryValue = watch('country');

  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  const shippingPrice = addDecimals(Number(itemsPrice) > 100 ? 0 : 100);
  const taxPrice = addDecimals(Number((0.15 * Number(itemsPrice)).toFixed(2)));
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

  useEffect(() => {
    if (success && order) {
      navigate(`/order/${order._id}`);
      dispatch(userDetailsReset());
      dispatch(orderCreateReset());
    }
  }, [dispatch, navigate, success, order]);

  const onSubmit = (data: ShippingAddressInput) => {
    dispatch(saveShippingAddress(data));
    dispatch(savePaymentMethod('PayPal'));
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: data,
        paymentMethod: 'PayPal',
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
        <SeoPrivateMeta canonicalPath="/checkout" />
        <AuthRequiredGate variant="checkout" />
      </>
    );
  }

  if (cart.cartItems.length === 0) {
    return (
      <div data-testid="checkout-screen">
        <SeoPrivateMeta canonicalPath="/checkout" />
        <CheckoutProgress activeStep={1} />
        <Message data-testid="checkout-empty">
          Your cart is empty <Link to="/">Go Back</Link>
        </Message>
      </div>
    );
  }

  return (
    <div data-testid="checkout-screen">
      <SeoPrivateMeta canonicalPath="/checkout" />
      <CheckoutProgress activeStep={1} />
      <h1 data-testid="checkout-heading">Checkout</h1>
      <Row className="checkout-layout g-4">
        <Col xs={12} lg={7}>
          <Card className="checkout-form-card">
            <Card.Body>
              <h2 className="h5 mb-3">Shipping Address</h2>
              <Form onSubmit={handleSubmit(onSubmit)} data-testid="checkout-form" noValidate>
                <Form.Group controlId="checkout-address" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter address"
                    data-testid="checkout-address"
                    isInvalid={Boolean(errors.address)}
                    {...register('address')}
                  />
                  {errors.address && (
                    <Form.Control.Feedback type="invalid" data-testid="checkout-address-error">
                      {errors.address.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group controlId="checkout-city" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter city"
                    data-testid="checkout-city"
                    isInvalid={Boolean(errors.city)}
                    {...register('city')}
                  />
                  {errors.city && (
                    <Form.Control.Feedback type="invalid" data-testid="checkout-city-error">
                      {errors.city.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group controlId="checkout-postal-code" className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter postal code"
                    data-testid="checkout-postal-code"
                    isInvalid={Boolean(errors.postalCode)}
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <Form.Control.Feedback type="invalid" data-testid="checkout-postal-code-error">
                      {errors.postalCode.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Form.Group controlId="checkout-country" className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <AppSelect
                    searchable
                    value={countryValue}
                    options={countryOptions}
                    data-testid="checkout-country"
                    ariaLabel="Country"
                    placeholder="Select country…"
                    onChange={(value) =>
                      setValue('country', value, { shouldValidate: true, shouldTouch: true })
                    }
                  />
                  {errors.country && (
                    <div className="text-danger small mt-1" data-testid="checkout-country-error">
                      {errors.country.message}
                    </div>
                  )}
                </Form.Group>

                <p className="text-muted small mb-3" data-testid="checkout-payment-note">
                  Payment: PayPal or Credit Card (after you place your order)
                </p>

                {orderError && (
                  <Message variant="danger" data-testid="checkout-order-error">
                    {orderError}
                  </Message>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 btn-cta"
                  data-testid="checkout-place-order-submit"
                  disabled={orderCreate.loading}
                >
                  Place Order
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={5}>
          <Card className="checkout-summary-card" data-testid="checkout-summary-card">
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2 className="h5 mb-0">Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                {cart.cartItems.map((item) => (
                  <div key={cartLineKey(item.product, item.variantSku)} className="mb-2">
                    <OrderLineItem item={item} />
                  </div>
                ))}
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col data-testid="checkout-items-price">${itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col data-testid="checkout-shipping-price">${shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col data-testid="checkout-tax-price">${taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>
                    <strong>Total</strong>
                  </Col>
                  <Col data-testid="checkout-total-price">
                    <strong>${totalPrice}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutScreen;
