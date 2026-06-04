import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PayPalScriptProvider,
  PayPalButtons,
  type PayPalButtonsComponentProps
} from '@paypal/react-paypal-js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
  orderPayReset,
  orderDeliverReset
} from '../features/orderSlice';
import type { Order, PaymentResult } from '../types';

const addDecimals = (num: number) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const OrderScreen = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('');

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
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    const fetchPayPalClientId = async () => {
      const { data } = await axios.get<string>('/api/config/paypal');
      setClientId(data);
    };
    void fetchPayPalClientId();
  }, []);

  useEffect(() => {
    if (!orderId) return;

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch(orderPayReset());
      dispatch(orderDeliverReset());
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, successPay, order, successDeliver]);

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

  if (loading || !orderWithPrices) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">{error}</Message>;
  }

  const displayOrder = orderWithPrices as Order & { itemsPrice: string };

  return (
    <div data-testid="order-screen">
      <h1 data-testid="order-heading">Order {displayOrder._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {displayOrder.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${displayOrder.user.email}`}>{displayOrder.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {displayOrder.shippingAddress.address}, {displayOrder.shippingAddress.city}{' '}
                {displayOrder.shippingAddress.postalCode}, {displayOrder.shippingAddress.country}
              </p>
              {displayOrder.isDelivered ? (
                <Message variant="success" data-testid="order-delivered-message">
                  Delivered on {displayOrder.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger" data-testid="order-not-delivered-message">
                  Not Delivered
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {displayOrder.paymentMethod}
              </p>
              {displayOrder.isPaid ? (
                <Message variant="success">Paid on {displayOrder.paidAt}</Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {displayOrder.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {displayOrder.orderItems.map((item) => (
                    <ListGroup.Item key={item.product}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${displayOrder.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${displayOrder.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${displayOrder.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${displayOrder.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!displayOrder.isPaid && clientId && (
                <ListGroup.Item data-testid="paypal-buttons">
                  {loadingPay && <Loader />}
                  <PayPalScriptProvider options={{ clientId, currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
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
                    className="btn-block"
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
