import { useEffect, useState } from 'react';
import { axios } from '../api/http';
import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps
} from '@paypal/react-paypal-js';
import { useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import OrderLineItem from '../components/OrderLineItem';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
  orderPayReset,
  orderDeliverReset
} from '../features/orderSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';
import AuthRequiredGate from '../components/AuthRequiredGate';
import type { Order, PaymentResult } from '../types';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import CheckoutProgress from '../components/CheckoutProgress';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { clearCartItemsForOrder } from '../features/cartSlice';

const addDecimals = (num: number) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const OrderScreen = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const isAuthenticated = useRequireAuth();
  const [clientId, setClientId] = useState('');
  const [paypalButtonsReady, setPaypalButtonsReady] = useState(false);

  const dispatch = useAppDispatch();

  const orderDetails = useAppSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useAppSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useAppSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const orderWithPrices = order
    ? {
        ...order,
        itemsPrice: addDecimals(
          order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
        )
      }
    : undefined;

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    const fetchPayPalClientId = async (attempt = 0): Promise<void> => {
      try {
        const { data } = await axios.get<string>('/api/config/paypal');
        if (!cancelled) {
          setClientId(typeof data === 'string' ? data : '');
        }
      } catch {
        if (!cancelled && attempt < 2) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 1000);
          });
          await fetchPayPalClientId(attempt + 1);
        }
      }
    };

    void fetchPayPalClientId();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    setPaypalButtonsReady(false);
  }, [clientId, orderId]);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch(orderPayReset());
      dispatch(orderDeliverReset());
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, isAuthenticated, orderId, successPay, order, successDeliver]);

  useEffect(() => {
    if (order?.isPaid && order._id) {
      dispatch(clearCartItemsForOrder(order._id));
    }
  }, [dispatch, order?.isPaid, order?._id]);

  const successPaymentHandler: NonNullable<PayPalButtonsComponentProps['onApprove']> = async (
    _data,
    actions
  ) => {
    if (!orderId) return;
    const details = await actions.order?.capture();
    if (details?.id && details.status) {
      const paymentResult: PaymentResult = {
        id: details.id,
        status: details.status,
        update_time: details.update_time ?? '',
        payer: {
          email_address:
            details.payer?.email_address ?? details.payment_source?.paypal?.email_address ?? ''
        }
      };
      dispatch(payOrder({ orderId, paymentResult }));
    }
  };

  const deliverHandler = () => {
    if (order) {
      dispatch(deliverOrder(order));
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <SeoPrivateMeta canonicalPath={orderId ? `/order/${orderId}` : '/order'} />
        <AuthRequiredGate variant="order" />
      </>
    );
  }

  if (loading || (!error && !orderWithPrices)) {
    return <Loader />;
  }

  if (error) {
    if (isApiUnreachableMessage(error)) {
      return (
        <ApiUnreachablePanel
          onRetry={() => {
            if (orderId) {
              dispatch(getOrderDetails(orderId));
            }
          }}
        />
      );
    }
    return (
      <Message variant="danger" data-testid="order-details-error">
        {error}
      </Message>
    );
  }

  const displayOrder = orderWithPrices as Order & { itemsPrice: string };

  return (
    <div data-testid="order-screen">
      <SeoPrivateMeta canonicalPath={`/order/${displayOrder._id}`} />
      <CheckoutProgress activeStep={2} />
      <h1 data-testid="order-heading">Order {displayOrder._id}</h1>
      <Row>
        <Col xs={12} lg={8}>
          <ListGroup variant="flush" className="order-sections">
            <ListGroup.Item className="order-section" data-testid="order-items">
              <h2 className="order-section-heading">Order Items</h2>
              {displayOrder.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {displayOrder.orderItems.map((item) => (
                    <ListGroup.Item key={`${item.product}-${item.name}`} className="px-0">
                      <OrderLineItem item={item} />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>

            <ListGroup.Item className="order-section" data-testid="order-payment">
              <h2 className="order-section-heading">Payment Method</h2>
              <p className="mb-2">
                <strong>Method: </strong>
                {displayOrder.paymentMethod}
              </p>
              {displayOrder.isPaid ? (
                <OrderStatusBadge
                  kind="paid"
                  dateLabel={displayOrder.paidAt}
                  testId="order-paid-message"
                />
              ) : (
                <OrderStatusBadge kind="unpaid" testId="order-payment-badge" />
              )}
            </ListGroup.Item>

            <ListGroup.Item className="order-section" data-testid="order-shipping">
              <h2 className="order-section-heading">Shipping</h2>
              <p>
                <strong>Name: </strong> {displayOrder.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${displayOrder.user.email}`}>{displayOrder.user.email}</a>
              </p>
              <p className="mb-2">
                <strong>Address:</strong> {displayOrder.shippingAddress.address},{' '}
                {displayOrder.shippingAddress.city} {displayOrder.shippingAddress.postalCode},{' '}
                {displayOrder.shippingAddress.country}
              </p>
              {displayOrder.isDelivered ? (
                <OrderStatusBadge
                  kind="delivered"
                  dateLabel={displayOrder.deliveredAt}
                  testId="order-delivered-message"
                />
              ) : (
                <OrderStatusBadge kind="pending" testId="order-not-delivered-message" />
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className="order-summary-card" data-testid="order-summary">
            <ListGroup variant="flush">
              <ListGroup.Item className="order-summary-heading">
                <h2 className="h5 mb-0">Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item className="order-summary-row">
                <Row>
                  <Col>Items</Col>
                  <Col className="text-end">${displayOrder.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item className="order-summary-row">
                <Row>
                  <Col>Shipping</Col>
                  <Col className="text-end">${displayOrder.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item className="order-summary-row">
                <Row>
                  <Col>Tax</Col>
                  <Col className="text-end">${displayOrder.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item className="order-summary-row order-summary-total">
                <Row>
                  <Col>
                    <strong>Total</strong>
                  </Col>
                  <Col className="text-end">
                    <strong>${displayOrder.totalPrice}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
              {!displayOrder.isPaid && clientId && (
                <ListGroup.Item
                  className="order-summary-paypal"
                  data-testid={paypalButtonsReady ? 'paypal-buttons-ready' : 'paypal-buttons'}
                >
                  {loadingPay && <Loader />}
                  <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      onInit={() => setPaypalButtonsReady(true)}
                      createOrder={(_data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              amount: {
                                currency_code: 'USD',
                                value: String(displayOrder.totalPrice)
                              }
                            }
                          ]
                        });
                      }}
                      onApprove={successPaymentHandler}
                    />
                  </PayPalScriptProvider>
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo?.isAdmin && displayOrder.isPaid && !displayOrder.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="w-100 btn-cta"
                    data-testid="order-deliver"
                    onClick={deliverHandler}
                  >
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderScreen;
